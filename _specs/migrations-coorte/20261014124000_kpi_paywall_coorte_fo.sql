-- Coorte per primo avvio per le RPC paywall della dashboard KPI. Un utente conta nel periodo del suo
-- primo first_open; di lui contano tutti gli eventi/acquisti, anche dopo la fine del periodo.
-- Si parte dalla definizione LIVE e si cambia solo l'ancora (CREATE OR REPLACE: firme, grant,
-- SECURITY e search_path invariati). Idempotente.
DO $mig$
DECLARE
  d text;
  coh text := E'coh AS MATERIALIZED (SELECT c.user_id FROM win, public.cohort_users_fo(win.t_from, win.t_to) c),\n  ';
BEGIN
  -- kpi_paywall_purchases: gli acquisti di chi è in coorte, quando che siano avvenuti.
  d := pg_get_functiondef('public.kpi_paywall_purchases(date,date,timestamptz,timestamptz)'::regprocedure);
  IF d NOT LIKE '%cohort_users_fo%' THEN
    d := replace(d, E'\n  excluded_users AS (', E'\n  ' || coh || 'excluded_users AS (');
    d := replace(d, 'AND pp.created_at >= win.t_from AND pp.created_at < win.t_to',
                    'AND pp.user_id IN (SELECT user_id FROM coh)');
    IF d NOT LIKE '%cohort_users_fo%' OR d LIKE '%pp.created_at < win.t_to%' THEN RAISE EXCEPTION 'kpi_paywall_purchases'; END IF;
    EXECUTE d;
  END IF;

  -- kpi_purchase_attempt_rate: coorte fo, eventi senza taglio superiore.
  d := pg_get_functiondef('public.kpi_purchase_attempt_rate(timestamptz,timestamptz,text)'::regprocedure);
  IF d NOT LIKE '%cohort_users_fo%' THEN
    d := replace(d, 'public.cohort_users(p_start, p_end)', 'public.cohort_users_fo(p_start, p_end)');
    d := replace(d, 'AND ue.created_at >= p_start AND ue.created_at < p_end', 'AND ue.created_at <= now()');
    IF d NOT LIKE '%cohort_users_fo%' OR d LIKE '%< p_end%' THEN RAISE EXCEPTION 'kpi_purchase_attempt_rate'; END IF;
    EXECUTE d;
  END IF;

  -- kpi_paywall_event_users
  d := pg_get_functiondef('public.kpi_paywall_event_users(text,text,date,date,timestamptz,timestamptz)'::regprocedure);
  IF d NOT LIKE '%cohort_users_fo%' THEN
    d := replace(d, E'\n  ev AS (', E'\n  ' || coh || 'ev AS (');
    d := replace(d, 'ec.created_at >= win.t_from AND ec.created_at < win.t_to',
                    'ec.user_id IN (SELECT user_id FROM coh) AND ec.created_at <= now()');
    IF d NOT LIKE '%cohort_users_fo%' OR d LIKE '%< win.t_to%' THEN RAISE EXCEPTION 'kpi_paywall_event_users'; END IF;
    EXECUTE d;
  END IF;

  -- kpi_paywall_creatives_audit (ev ed ext)
  d := pg_get_functiondef('public.kpi_paywall_creatives_audit(date,date,timestamptz,timestamptz)'::regprocedure);
  IF d NOT LIKE '%cohort_users_fo%' THEN
    d := replace(d, E'\n  ev AS MATERIALIZED (', E'\n  ' || coh || 'ev AS MATERIALIZED (');
    d := replace(d, 'ec.created_at >= win.t_from AND ec.created_at < win.t_to',
                    'ec.user_id IN (SELECT user_id FROM coh) AND ec.created_at <= now()');
    IF d NOT LIKE '%cohort_users_fo%' OR d LIKE '%< win.t_to%' THEN RAISE EXCEPTION 'kpi_paywall_creatives_audit'; END IF;
    EXECUTE d;
  END IF;
END
$mig$;
