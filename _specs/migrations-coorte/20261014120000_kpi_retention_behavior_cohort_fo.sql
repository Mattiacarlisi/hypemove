-- Retention e Comportamento contano la coorte del primo avvio (14/10/2026).
-- Un utente appartiene al periodo in cui cade il suo primo first_open (tabella events);
-- i suoi eventi contano per la coorte anche dopo la fine del periodo.
-- Finestra: [p_t0, p_t1) se passati, altrimenti [inizio, fine + 1 giorno) in Europe/Rome.

-- ---------------------------------------------------------------- Retention settimanale
-- Settimana 0 = settimana del primo avvio (prima era il primo workout).
CREATE OR REPLACE FUNCTION public.kpi_retention(inizio date, fine date, min_workouts integer DEFAULT 1, max_weeks integer DEFAULT 6, min_w0 integer DEFAULT 1, p_goal text DEFAULT NULL::text, p_level integer DEFAULT NULL::integer, p_gender text DEFAULT NULL::text, p_start timestamp with time zone DEFAULT NULL::timestamp with time zone, p_end timestamp with time zone DEFAULT NULL::timestamp with time zone)
 RETURNS jsonb
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  select public.assert_internal_operator();
  WITH win AS (
    SELECT coalesce(p_start, inizio::timestamp AT TIME ZONE 'Europe/Rome') t0,
           coalesce(p_end, (fine + 1)::timestamp AT TIME ZONE 'Europe/Rome') t1
  ),
  fo AS (
    SELECT e.user_id, min(e.created_at) t
    FROM public.events e
    WHERE e.event_name = 'first_open' AND e.user_id IS NOT NULL AND e.created_at <= now()
      AND NOT EXISTS (SELECT 1 FROM public.kpi_excluded_users x WHERE x.id = e.user_id)
    GROUP BY e.user_id
  ),
  cohort_filtered AS (
    SELECT fo.user_id, (fo.t AT TIME ZONE 'Europe/Rome')::date AS anchor_date
    FROM fo CROSS JOIN win
    LEFT JOIN public.user_profile up ON up.user_id = fo.user_id
    WHERE fo.t >= win.t0 AND fo.t < win.t1
      AND (p_goal   IS NULL OR p_goal = 'all'   OR up.primary_goal = p_goal)
      AND (p_level  IS NULL OR up.current_level = p_level)
      AND (p_gender IS NULL OR p_gender = 'all' OR lower(up.gender) = lower(p_gender))
  ),
  weeks AS (SELECT generate_series(0, max_weeks) AS wn),
  user_week_counts AS (
    SELECT c.user_id, (((ws.finished_at AT TIME ZONE 'Europe/Rome')::date - c.anchor_date) / 7) AS wn, COUNT(*) AS workouts
    FROM cohort_filtered c
    JOIN workout_sessions ws ON ws.user_id = c.user_id
    WHERE ws.finished_at IS NOT NULL
      AND (((ws.finished_at AT TIME ZONE 'Europe/Rome')::date - c.anchor_date) / 7) BETWEEN 0 AND max_weeks
    GROUP BY c.user_id, 2
  ),
  all_slots AS (
    SELECT c.user_id, w.wn, COALESCE(uwc.workouts, 0) AS workouts
    FROM cohort_filtered c
    CROSS JOIN weeks w
    LEFT JOIN user_week_counts uwc ON uwc.user_id = c.user_id AND uwc.wn = w.wn
  ),
  eligible_users AS (SELECT DISTINCT user_id FROM all_slots WHERE wn = 0 AND workouts >= min_w0),
  slots AS (SELECT a.* FROM all_slots a WHERE a.user_id IN (SELECT user_id FROM eligible_users))
  SELECT jsonb_agg(
    jsonb_build_object(
      'week', wn,
      'eligible', totale,
      'retained', retained,
      'retention_pct', CASE WHEN totale = 0 THEN 0 ELSE ROUND(retained::numeric / totale * 100, 1) END
    ) ORDER BY wn)
  FROM (
    SELECT wn, COUNT(*) AS totale, COUNT(*) FILTER (WHERE workouts >= min_workouts) AS retained
    FROM slots GROUP BY wn
  ) t;
$function$;

-- ---------------------------------------------------------------- Retention giornaliera
-- Una sola ancora: il primo avvio. p_anchor resta per compatibilità ed è ignorato.
-- p_t0/p_t1 portano gli orari dello sprint.
DROP FUNCTION IF EXISTS public.kpi_retention_daily(date, date, text, text, integer, text);
CREATE FUNCTION public.kpi_retention_daily(p_start date, p_end date, p_anchor text DEFAULT NULL::text, p_goal text DEFAULT NULL::text, p_level integer DEFAULT NULL::integer, p_gender text DEFAULT NULL::text, p_t0 timestamp with time zone DEFAULT NULL::timestamp with time zone, p_t1 timestamp with time zone DEFAULT NULL::timestamp with time zone)
 RETURNS jsonb
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  select public.assert_internal_operator();
WITH axis AS (
  SELECT unnest(ARRAY[0,1,2,3,4,5,6,7,8,9,10,14,21,30]) AS d
),
win AS (
  SELECT coalesce(p_t0, p_start::timestamp AT TIME ZONE 'Europe/Rome') t0,
         coalesce(p_t1, (p_end + 1)::timestamp AT TIME ZONE 'Europe/Rome') t1
),
fo AS (
  SELECT coalesce(e.user_id::text, 'anon:' || e.session_id::text) ident, e.user_id pid,
         min(e.created_at) anchor_ts,
         (array_agg(e.session_id ORDER BY e.created_at))[1] sid
  FROM public.events e
  WHERE e.event_name = 'first_open' AND e.created_at <= now()
    AND NOT EXISTS (SELECT 1 FROM public.kpi_excluded_users x WHERE x.id = e.user_id)
  GROUP BY 1, 2
),
cohort_f AS (
  SELECT fo.ident, fo.anchor_ts, fo.pid, fo.sid
  FROM fo CROSS JOIN win
  LEFT JOIN public.user_profile up ON up.user_id = fo.pid
  WHERE fo.anchor_ts >= win.t0 AND fo.anchor_ts < win.t1
    AND (p_goal   IS NULL OR p_goal   = 'all' OR up.primary_goal  = p_goal)
    AND (p_level  IS NULL OR up.current_level = p_level)
    AND (p_gender IS NULL OR p_gender = 'all' OR lower(up.gender) = lower(p_gender))
),
last_seen AS (
  SELECT c.ident,
         c.anchor_ts,
         GREATEST(
           COALESCE((SELECT MAX(e.created_at)::date - c.anchor_ts::date
                       FROM public.events_canonical e
                      WHERE c.pid IS NOT NULL AND e.user_id = c.pid
                        AND e.created_at >= c.anchor_ts
                        AND e.excl_any IS NOT TRUE), 0),
           COALESCE((SELECT MAX(e.created_at)::date - c.anchor_ts::date
                       FROM public.events_canonical e
                      WHERE c.sid IS NOT NULL AND e.session_id = c.sid
                        AND e.created_at >= c.anchor_ts
                        AND e.excl_any IS NOT TRUE), 0)
         ) AS last_off
  FROM cohort_f c
),
grid AS (
  SELECT a.d,
         COUNT(*) FILTER (
           WHERE a.d = 0
              OR l.anchor_ts + ((a.d + 1) * interval '1 day') <= now()
         ) AS observable,
         COUNT(*) FILTER (
           WHERE (a.d = 0 OR l.anchor_ts + ((a.d + 1) * interval '1 day') <= now())
             AND l.last_off >= a.d
         ) AS alive,
         COUNT(*) FILTER (
           WHERE a.d > 0
             AND l.anchor_ts + ((a.d + 1) * interval '1 day') <= now()
             AND l.last_off = a.d - 1
         ) AS lost
  FROM axis a
  CROSS JOIN last_seen l
  GROUP BY a.d
)
SELECT jsonb_build_object(
  'anchor',          'first_open',
  'from',            p_start,
  'to',              p_end,
  'cohort_size',     (SELECT COUNT(*) FROM cohort_f),
  'median_last_day', (SELECT percentile_cont(0.5) WITHIN GROUP (ORDER BY last_off)
                      FROM last_seen),
  'days', COALESCE((
    SELECT jsonb_agg(
      jsonb_build_object(
        'day',        g.d,
        'observable', g.observable,
        'alive',      CASE WHEN g.observable = 0 THEN NULL ELSE g.alive END,
        'lost',       CASE WHEN g.observable = 0 OR g.d = 0 THEN NULL ELSE g.lost END,
        'pct',        CASE WHEN g.observable = 0 THEN NULL
                           ELSE ROUND(g.alive::numeric / g.observable * 100, 1) END
      ) ORDER BY g.d)
    FROM grid g), '[]'::jsonb)
);
$function$;
GRANT EXECUTE ON FUNCTION public.kpi_retention_daily(date, date, text, text, integer, text, timestamptz, timestamptz) TO anon, authenticated, service_role;

-- ---------------------------------------------------------------- Menu sprint della giornaliera
-- cohort_size = primi avvii di utenti registrati nella finestra; first_opens = tutti i primi avvii
-- (anche anonimi). t0/t1 = finestra con gli orari, da ripassare a kpi_retention_daily.
CREATE OR REPLACE FUNCTION public.kpi_retention_daily_cohort_sizes(p_sprint_ids uuid[] DEFAULT NULL::uuid[])
 RETURNS jsonb
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  select public.assert_internal_operator();
  WITH sp AS (
    SELECT s.id, s.nome, s.inizio, s.fine,
           (s.inizio + coalesce(s.inizio_ora, time '00:00')) AT TIME ZONE 'Europe/Rome' t0,
           CASE WHEN s.fine_ora IS NULL THEN (s.fine + 1)::timestamp AT TIME ZONE 'Europe/Rome'
                ELSE (s.fine + s.fine_ora) AT TIME ZONE 'Europe/Rome' END t1
    FROM public.sprints s
    WHERE p_sprint_ids IS NULL OR s.id = ANY(p_sprint_ids)
  ),
  fo AS (
    SELECT coalesce(e.user_id::text, 'anon:' || e.session_id::text) ident, e.user_id, min(e.created_at) t
    FROM public.events e
    WHERE e.event_name = 'first_open' AND e.created_at <= now()
      AND NOT EXISTS (SELECT 1 FROM public.kpi_excluded_users x WHERE x.id = e.user_id)
    GROUP BY 1, 2
  )
  SELECT COALESCE(jsonb_agg(
    jsonb_build_object(
      'sprint_id',   t.id,
      'nome',        t.nome,
      'inizio',      t.inizio,
      'fine',        t.fine,
      't0',          t.t0,
      't1',          t.t1,
      'cohort_size', t.cohort_size,
      'first_opens', t.first_opens,
      'max_day',     t.max_day
    ) ORDER BY t.inizio DESC), '[]'::jsonb)
  FROM (
    SELECT sp.*,
           (SELECT COUNT(*) FILTER (WHERE fo.user_id IS NOT NULL) FROM fo WHERE fo.t >= sp.t0 AND fo.t < sp.t1) AS cohort_size,
           (SELECT COUNT(*) FROM fo WHERE fo.t >= sp.t0 AND fo.t < sp.t1) AS first_opens,
           GREATEST(FLOOR(EXTRACT(EPOCH FROM (now() - sp.t1)) / 86400)::int, -1) AS max_day
    FROM sp
  ) t;
$function$;

-- ---------------------------------------------------------------- Comportamento
-- Con un periodo scelto contano gli eventi (di sempre) degli utenti la cui coorte cade nel periodo.
-- Senza periodo (entrambi NULL) restano tutti gli eventi. Le date arrivano come giorni di calendario.
CREATE OR REPLACE FUNCTION public.kpi_events_summary(p_from timestamp with time zone DEFAULT NULL::timestamp with time zone, p_to timestamp with time zone DEFAULT NULL::timestamp with time zone)
 RETURNS TABLE(event_name text, event_type text, total bigint, unique_users bigint)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  select public.assert_internal_operator();
  WITH fo AS (
    SELECT e.user_id, min(e.created_at) t
    FROM public.events e
    WHERE e.event_name = 'first_open' AND e.user_id IS NOT NULL AND e.created_at <= now()
    GROUP BY e.user_id
  ),
  coh AS (
    SELECT fo.user_id FROM fo
    WHERE (p_from IS NULL OR fo.t >= ((p_from AT TIME ZONE 'UTC')::date)::timestamp AT TIME ZONE 'Europe/Rome')
      AND (p_to   IS NULL OR fo.t <  ((p_to AT TIME ZONE 'UTC')::date + 1)::timestamp AT TIME ZONE 'Europe/Rome')
  )
  SELECT ue.event_name, ue.event_type, COUNT(*) AS total, COUNT(DISTINCT ue.user_id) AS unique_users
  FROM public.user_events ue
  WHERE ue.user_id NOT IN (SELECT id FROM public.kpi_excluded_users)
    AND (p_from IS NULL AND p_to IS NULL OR ue.user_id IN (SELECT user_id FROM coh))
  GROUP BY ue.event_name, ue.event_type ORDER BY total DESC LIMIT 50;
$function$;
