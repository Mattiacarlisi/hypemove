-- Coorte per primo avvio: un utente appartiene alla finestra in cui cade il suo primo first_open.
CREATE OR REPLACE FUNCTION public.cohort_users_fo(p_start timestamptz, p_end timestamptz)
 RETURNS TABLE(user_id uuid, first_open_at timestamptz)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT fo.user_id, fo.t
  FROM (
    SELECT e.user_id, min(e.created_at) t
    FROM public.events e
    WHERE e.event_name = 'first_open' AND e.user_id IS NOT NULL
    GROUP BY e.user_id
  ) fo
  WHERE fo.t >= p_start AND fo.t < p_end
    AND NOT EXISTS (SELECT 1 FROM public.kpi_excluded_users x WHERE x.id = fo.user_id);
$function$;

REVOKE EXECUTE ON FUNCTION public.cohort_users_fo(timestamptz, timestamptz) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.cohort_users_fo(timestamptz, timestamptz) TO service_role;
