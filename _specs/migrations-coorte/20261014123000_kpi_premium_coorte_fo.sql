-- kpi_premium e kpi_premium_step_users: i blocchi "coorte se p_start, calendario altrimenti"
-- diventano sempre coorte per primo avvio (cohort_users_fo). Finestra = [p_start, p_end) se passati,
-- altrimenti [inizio, fine+1 giorno); estremi mancanti = aperti. Nessun taglio sugli eventi successivi.
-- Si parte dalla definizione LIVE e si sostituisce solo l'ancora: firme, grant, SECURITY e
-- search_path restano quelli che ci sono (CREATE OR REPLACE). Idempotente.
DO $mig$
DECLARE
  d text;
  w text := $w$cohort_users_fo(COALESCE(p_start, inizio::timestamptz, '-infinity'::timestamptz), COALESCE(p_end, fine::timestamptz + INTERVAL '1 day', 'infinity'::timestamptz))$w$;
  pat text := $p$\n\s*(AND|WHERE) \(\n\s*\(p_start IS NOT NULL AND ([a-z0-9]+)\.user_id IN \(\n\s*SELECT user_id FROM public\.cohort_users\([^\n]*\n\s*\)\)\n\s*OR\n\s*\(p_start IS NULL(\n\s*AND [^\n]*)+\n\s*\)$p$;
  f text;
BEGIN
  FOREACH f IN ARRAY ARRAY[
    'public.kpi_premium(text,text,text,timestamptz,timestamptz)',
    'public.kpi_premium_step_users(text,text,text,text,text,timestamptz,timestamptz,integer)'
  ] LOOP
    d := pg_get_functiondef(f::regprocedure);
    IF d NOT LIKE '%public.cohort_users(%' THEN CONTINUE; END IF;
    d := regexp_replace(d, pat, E'\n  \\1 \\2.user_id IN (SELECT user_id FROM public.' || replace(w, '\', '\\') || ')', 'g');
    IF d LIKE '%public.cohort_users(%' OR d LIKE '%p_start IS NULL%' THEN
      RAISE EXCEPTION 'sostituzione incompleta in %', f;
    END IF;
    EXECUTE d;
  END LOOP;
END
$mig$;
