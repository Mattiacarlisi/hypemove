-- kpi_activation a coorte "primo avvio": la persona entra nel periodo in cui cade il suo PRIMO first_open
-- (prima era il primo evento qualsiasi). Cambia solo l'ancora `first_seen` in first_ev_all; il resto
-- (esclusioni, bot, maturità, finestra personale, pay) è identico. Non usa cohort_users_fo perché qui
-- servono anche i bot (p_include_bots), il filtro is_test e la vista vw_real_user_events.

CREATE OR REPLACE FUNCTION public.kpi_activation(p_cohort_start date DEFAULT '2026-07-20'::date, p_maturity_days integer DEFAULT 14, p_window_days integer DEFAULT 7, p_start timestamp with time zone DEFAULT NULL::timestamp with time zone, p_end timestamp with time zone DEFAULT NULL::timestamp with time zone, p_include_bots boolean DEFAULT false)
 RETURNS jsonb
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public', 'auth'
AS $function$
  -- Dashboard interna: solo operatori in public.internal_operators.
  select public.assert_internal_operator();

  WITH
  -- Coorte = primo first_open della persona, letto da `events` (la vista vw_real_user_events poggia su
  -- user_events, dove first_open non c'è). Il join con users toglie is_test, anche NULL, via COALESCE.
  -- Dal 27/09/2026 la coorte passa anche da kpi_excluded_users, come ogni kpi_*: bloccati ed
  -- emulatori escono sempre, i bot escono salvo p_include_bots (il chip «Bot» della dashboard).
  first_ev_all AS (
    SELECT e.user_id, MIN(e.created_at) AS first_seen
    FROM public.events e
    JOIN public.users u ON u.id = e.user_id AND COALESCE(u.is_test, false) = false
    WHERE e.event_name = 'first_open'
      AND e.created_at <= now()
      AND e.user_id NOT IN (SELECT x.id FROM public.kpi_excluded_users x WHERE x.reason <> 'bot')
    GROUP BY e.user_id
  ),
  bot_ids AS (
    SELECT x.id FROM public.kpi_excluded_users x WHERE x.reason = 'bot'
  ),
  first_ev AS (
    SELECT f.user_id, f.first_seen
    FROM first_ev_all f
    WHERE p_include_bots OR f.user_id NOT IN (SELECT id FROM bot_ids)
  ),
  cohort AS (
    SELECT user_id, first_seen,
           date_trunc('week', first_seen)::date AS week_start,
           (first_seen < now() - make_interval(days => p_maturity_days)) AS mature,
           (p_start IS NOT NULL AND p_end IS NOT NULL
            AND first_seen >= p_start AND first_seen < p_end) AS in_window
    FROM first_ev
    -- La serie settimanale vuole la storia dal p_cohort_start; se il periodo scelto comincia prima
    -- si allarga fin lì, altrimenti quelle persone non entrerebbero nemmeno nel funnel.
    WHERE first_seen >= LEAST(p_cohort_start::timestamptz, COALESCE(p_start, p_cohort_start::timestamptz))
  ),
  -- Allenamenti finiti dentro la finestra personale di ciascuno (primi p_window_days giorni).
  wk AS (
    SELECT c.user_id, COUNT(*) AS n_workouts
    FROM cohort c
    JOIN public.workout_sessions ws
      ON ws.user_id = c.user_id
     AND ws.finished_at IS NOT NULL
     AND ws.finished_at >= c.first_seen
     AND ws.finished_at <  c.first_seen + make_interval(days => p_window_days)
    GROUP BY c.user_id
  ),
  -- Eventi paywall della coorte, senza finestra personale: chi paga lo fa quando gli pare.
  -- `excl_blocked` e non `excl_any`: is_test è già fuori dalla coorte e gli emulatori non hanno
  -- carte di credito, ma un account bloccato non è una persona.
  pay AS (
    SELECT ec.user_id,
           bool_or(ec.event_name IN ('paywall_open','view_Paywall'))              AS saw_paywall,
           bool_or(ec.event_name = 'paywall_purchase_attempt')                    AS attempted,
           bool_or(ec.event_name IN ('paywall_purchase_success','purchase_success')) AS paid
    -- Da `events` e non da `events_canonical`: la vista costringeva a leggere la tabella riga
    -- per riga (2.000 ricerche sparse, 7-13 s a cache fredda), mentre qui bastano user_id ed
    -- event_name e risponde l'indice idx_events_user_event_name da solo. L'esclusione è la stessa
    -- di `excl_blocked`: utenti in kpi_excluded_users con reason = 'blocked'.
    FROM public.events ec
    JOIN cohort c ON c.user_id = ec.user_id
    WHERE ec.user_id NOT IN (SELECT x.id FROM public.kpi_excluded_users x WHERE x.reason = 'blocked')
      AND ec.event_name IN ('paywall_open','view_Paywall','paywall_purchase_attempt',
                            'paywall_purchase_success','purchase_success')
    GROUP BY ec.user_id
  ),
  -- Una riga per persona matura con tutto quello che serve ai primi due blocchi.
  person AS (
    SELECT c.user_id,
           c.mature,
           EXTRACT(day FROM now() - c.first_seen)::int AS eta_giorni,
           COALESCE(w.n_workouts, 0)   AS n_workouts,
           COALESCE(p.saw_paywall, false) AS saw_paywall,
           COALESCE(p.attempted,   false) AS attempted,
           COALESCE(p.paid,        false) AS paid
    FROM cohort c
    LEFT JOIN wk  w ON w.user_id = c.user_id
    LEFT JOIN pay p ON p.user_id = c.user_id
    WHERE (p_start IS NULL OR p_end IS NULL OR c.in_window)
      -- Senza un periodo scelto restano solo le persone mature, come prima.
      AND (c.mature OR (p_start IS NOT NULL AND p_end IS NOT NULL))
  ),
  -- ── Blocco 1 · funnel della coorte matura ────────────────────────────────────────────
  -- La cascata è per costruzione monotona: `saw_paywall` viene contato solo su chi ha già tre
  -- allenamenti, `attempted` solo su chi ha visto il paywall, e così via. Senza questo
  -- annidamento uno step potrebbe superare il precedente e la percentuale di perdita uscirebbe
  -- negativa.
  -- Ogni step conta due volte: il totale di chi l'ha già raggiunto, e quanti di quelli sono
  -- ancora dentro la loro settimana. La seconda quota è la parte tratteggiata del grafico: sono
  -- numeri che possono solo salire, perché a quelle persone manca ancora tempo, non occasioni.
  fun AS (
    SELECT
      COUNT(*)                                                                    AS s0,
      COUNT(*) FILTER (WHERE n_workouts >= 1)                                     AS s1,
      COUNT(*) FILTER (WHERE n_workouts >= 2)                                     AS s2,
      COUNT(*) FILTER (WHERE n_workouts >= 3)                                     AS s3,
      COUNT(*) FILTER (WHERE n_workouts >= 3 AND saw_paywall)                     AS s4,
      COUNT(*) FILTER (WHERE n_workouts >= 3 AND saw_paywall AND attempted)       AS s5,
      COUNT(*) FILTER (WHERE n_workouts >= 3 AND saw_paywall AND attempted AND paid) AS s6,
      COUNT(*) FILTER (WHERE NOT mature)                                          AS p0,
      COUNT(*) FILTER (WHERE NOT mature AND n_workouts >= 1)                      AS p1,
      COUNT(*) FILTER (WHERE NOT mature AND n_workouts >= 2)                      AS p2,
      COUNT(*) FILTER (WHERE NOT mature AND n_workouts >= 3)                      AS p3,
      COUNT(*) FILTER (WHERE NOT mature AND n_workouts >= 3 AND saw_paywall)      AS p4,
      COUNT(*) FILTER (WHERE NOT mature AND n_workouts >= 3 AND saw_paywall AND attempted) AS p5,
      COUNT(*) FILTER (WHERE NOT mature AND n_workouts >= 3 AND saw_paywall AND attempted AND paid) AS p6,
      -- Giorni che mancano alla persona più giovane per completare la maturità.
      GREATEST(MAX(p_maturity_days - eta_giorni) FILTER (WHERE NOT mature), 0)    AS giorni_mancanti
    FROM person
  ),
  fun_steps AS (
    SELECT * FROM (VALUES
      (0, 'Primo avvio',            'first_open',               (SELECT s0 FROM fun), (SELECT p0 FROM fun)),
      (1, '1º allenamento finito',  'workout_complete',         (SELECT s1 FROM fun), (SELECT p1 FROM fun)),
      (2, '2º allenamento finito',  'workout_complete',         (SELECT s2 FROM fun), (SELECT p2 FROM fun)),
      (3, '3º allenamento finito',  'workout_complete',         (SELECT s3 FROM fun), (SELECT p3 FROM fun)),
      (4, 'Vede un paywall',        'paywall_open',             (SELECT s4 FROM fun), (SELECT p4 FROM fun)),
      (5, 'Tocca «paga»',           'paywall_purchase_attempt', (SELECT s5 FROM fun), (SELECT p5 FROM fun)),
      (6, 'Ha pagato',              'purchase_success',         (SELECT s6 FROM fun), (SELECT p6 FROM fun))
    ) AS t(idx, label, evento, n, n_pending)
  ),
  fun_rows AS (
    SELECT idx, label, evento, n, n_pending,
           (SELECT s0 FROM fun) AS base,
           LAG(n) OVER (ORDER BY idx) AS prev_n
    FROM fun_steps
  ),
  -- ── Blocco 2 · allenamenti fatti → tocca «paga» ──────────────────────────────────────
  -- Le barre restano sulle sole persone mature: una finestra personale incompleta abbasserebbe
  -- il denominatore di un bucket che la persona non ha ancora finito di attraversare.
  buckets AS (
    SELECT CASE WHEN n_workouts >= 4 THEN 4 ELSE n_workouts END AS bucket,
           COUNT(*)                            AS tot,
           COUNT(*) FILTER (WHERE attempted)   AS hit
    FROM person
    WHERE mature
    GROUP BY 1
  ),
  bucket_rows AS (
    SELECT b.bucket, b.tot, b.hit,
           CASE b.bucket WHEN 0 THEN 'Nessuno'
                         WHEN 1 THEN '1 allenamento'
                         WHEN 4 THEN '4 o più'
                         ELSE b.bucket || ' allenamenti' END AS label,
           w.*
    FROM buckets b
    CROSS JOIN LATERAL public.kpi_wilson95(b.hit, b.tot) w
  ),
  -- ── Blocco 3 · attivazione per settimana (tutte le coorti, non solo le mature) ────────
  weekly AS (
    SELECT c.week_start,
           COUNT(*)                                              AS tot,
           COUNT(*) FILTER (WHERE COALESCE(w.n_workouts, 0) >= 2) AS attivi
    FROM cohort c
    LEFT JOIN wk w ON w.user_id = c.user_id
    GROUP BY c.week_start
  ),
  weekly_rows AS (
    SELECT wl.week_start, wl.tot, wl.attivi,
           (wl.week_start + make_interval(days => p_window_days) > current_date) AS in_corso,
           wi.*
    FROM weekly wl
    CROSS JOIN LATERAL public.kpi_wilson95(wl.attivi, wl.tot) wi
  ),
  weekly_tot AS (
    SELECT COALESCE(SUM(tot), 0) AS tot, COALESCE(SUM(attivi), 0) AS attivi FROM weekly
  ),
  -- ── Maturità dello sprint selezionato (avviso ambra + etichetta dei due pannelli) ─────
  sprint AS (
    SELECT COUNT(*) AS tot,
           COUNT(*) FILTER (WHERE c.mature) AS maturi,
           MAX(EXTRACT(day FROM now() - c.first_seen))::int AS eta_max_giorni
    FROM cohort c
    WHERE p_start IS NOT NULL AND p_end IS NOT NULL
      AND c.first_seen >= p_start AND c.first_seen < p_end
  )
  SELECT jsonb_build_object(
    'cohort_start',  p_cohort_start,
    'maturity_days', p_maturity_days,
    'window_days',   p_window_days,
    'include_bots',  p_include_bots,
    -- Account bot con il primo evento nel periodo scelto (o in tutta la storia senza periodo):
    -- il numero accanto al chip «Bot», contato anche quando sono inclusi.
    'bots_excluded', (
      SELECT count(*) FROM first_ev_all f
      WHERE f.user_id IN (SELECT id FROM bot_ids)
        AND (p_start IS NULL OR p_end IS NULL OR (f.first_seen >= p_start AND f.first_seen < p_end))
    ),
    'funnel', jsonb_build_object(
      'cohort', (SELECT s0 FROM fun),
      'pending', (SELECT p0 FROM fun),
      'giorni_mancanti', (SELECT giorni_mancanti FROM fun),
      'steps', (
        SELECT COALESCE(jsonb_agg(jsonb_build_object(
          'idx', idx, 'label', label, 'evento', evento, 'n', n,
          'n_pending', n_pending,
          'pct',      CASE WHEN base > 0 THEN ROUND(100.0 * n / base, 2) END,
          'lost',     CASE WHEN prev_n IS NOT NULL THEN prev_n - n END,
          'lost_pct', CASE WHEN prev_n IS NOT NULL AND base > 0
                           THEN ROUND(100.0 * (prev_n - n) / base, 2) END
        ) ORDER BY idx), '[]'::jsonb)
        FROM fun_rows
      )
    ),
    'by_workouts', jsonb_build_object(
      'cohort', (SELECT s0 - p0 FROM fun),
      'rows', (
        SELECT COALESCE(jsonb_agg(jsonb_build_object(
          'bucket', bucket, 'label', label, 'hit', hit, 'tot', tot,
          'pct', pct, 'ci_lo', ci_lo, 'ci_hi', ci_hi
        ) ORDER BY bucket), '[]'::jsonb)
        FROM bucket_rows
      )
    ),
    'weekly', jsonb_build_object(
      'attivi', (SELECT attivi FROM weekly_tot),
      'cohort', (SELECT tot    FROM weekly_tot),
      'mean_pct', (SELECT CASE WHEN tot > 0 THEN ROUND(100.0 * attivi / tot, 2) END FROM weekly_tot),
      'rows', (
        SELECT COALESCE(jsonb_agg(jsonb_build_object(
          'week_start', week_start, 'attivi', attivi, 'tot', tot,
          'pct', pct, 'ci_lo', ci_lo, 'ci_hi', ci_hi, 'in_corso', in_corso
        ) ORDER BY week_start), '[]'::jsonb)
        FROM weekly_rows
      )
    ),
    'sprint', CASE WHEN p_start IS NULL OR p_end IS NULL THEN NULL ELSE (
      SELECT jsonb_build_object(
        'cohort',         tot,
        'maturi',         maturi,
        'eta_max_giorni', eta_max_giorni,
        'mature',         (maturi > 0),
        'applied',        true
      ) FROM sprint
    ) END
  );
$function$;
