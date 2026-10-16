-- Funnel a coorte "primo avvio": un utente appartiene al periodo in cui cade il suo primo first_open
-- e tutto ciò che fa dopo (anche oltre la fine del periodo) conta per quella coorte.
-- Richiede public.cohort_users_fo (20261014120000_cohort_users_fo.sql).
-- Cambia solo l'ancora: firme, tipi, grant, SECURITY e search_path restano quelli live.
-- Resta fuori: gli step 19-21 di kpi_funnel (questionario anonimo), ancorati al primo passo del questionario.

-- ============================================================================================
-- kpi_funnel
-- ============================================================================================
CREATE OR REPLACE FUNCTION public.kpi_funnel(inizio date, fine date, p_start timestamp with time zone DEFAULT NULL::timestamp with time zone, p_end timestamp with time zone DEFAULT NULL::timestamp with time zone)
 RETURNS jsonb
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public', 'auth'
AS $function$
  -- Dashboard interna: solo operatori in public.internal_operators.
  select public.assert_internal_operator();

  WITH excluded_users AS (SELECT user_id AS id FROM public.blocked_users WHERE removed_at IS NULL),
    tok_internal AS (SELECT purchase_token FROM public.play_token_facts WHERE is_test OR is_internal OR owner_user_id IN (SELECT id FROM excluded_users)),
    tok_canon AS (SELECT purchase_token, owner_user_id AS user_id, status, expires_at, payment_state, is_trial FROM public.play_token_facts WHERE purchase_token NOT IN (SELECT purchase_token FROM tok_internal)),
    tok_wastrial AS (SELECT purchase_token, trial_started_at IS NOT NULL AS was_trial FROM public.play_token_facts),
    paying_owners AS (SELECT DISTINCT user_id FROM tok_canon WHERE user_id IS NOT NULL AND expires_at > now() AND status <> 'revoked' AND COALESCE(payment_state, CASE WHEN is_trial THEN 2 ELSE 1 END) = 1),
    trial_owners AS (SELECT DISTINCT tc.user_id FROM tok_canon tc JOIN tok_wastrial tw USING (purchase_token) WHERE tc.user_id IS NOT NULL AND tw.was_trial),
    -- Coorte = utenti il cui PRIMO first_open cade nel periodo. Eventi, allenamenti, prove e acquisti
    -- successivi contano anche dopo la fine del periodo.
    coh_fo AS (SELECT c.user_id AS id, c.first_open_at FROM public.cohort_users_fo(COALESCE(p_start, inizio::timestamptz), COALESCE(p_end, (fine + 1)::timestamptz)) c),
    inst_cov AS (
      SELECT MAX(date) AS covered_to,
             (MAX(date) < fine AND fine <= CURRENT_DATE - 3) AS partial
        FROM google_play_installs
    ),
    s0   AS (SELECT CASE
                      WHEN COUNT(*) = 0                            THEN NULL
                      WHEN (SELECT partial FROM inst_cov) IS TRUE  THEN NULL
                      ELSE COALESCE(SUM(install_events), 0)
                    END AS n
             FROM google_play_installs WHERE date >= inizio AND date <= fine),
    s_fo AS (SELECT CASE
                      WHEN COUNT(*) = 0                            THEN NULL
                      WHEN (SELECT partial FROM inst_cov) IS TRUE  THEN NULL
                      ELSE SUM(first_open_events)
                    END AS n
             FROM google_play_installs WHERE date >= inizio AND date <= fine),
    s1   AS (SELECT COUNT(DISTINCT ai.id) AS n FROM auth.identities ai JOIN public.users u ON u.auth_id = ai.user_id WHERE u.id IN (SELECT id FROM coh_fo)),
    s2   AS (SELECT COUNT(DISTINCT u.id) AS n FROM auth.identities ai JOIN public.users u ON ai.email = u.email WHERE u.id IN (SELECT id FROM coh_fo)),
    s3   AS (SELECT COUNT(DISTINCT ws.user_id) AS n FROM coh_fo c JOIN public.workout_sessions ws ON ws.user_id = c.id AND DATE(ws.started_at) >= DATE(c.first_open_at)),
    first_workouts AS (SELECT DISTINCT ON (ws.user_id) ws.user_id, ws.finished_at::date AS first_workout_date, c.first_open_at AS onboarding_completed_at FROM public.workout_sessions ws JOIN coh_fo c ON c.id = ws.user_id WHERE ws.finished_at IS NOT NULL ORDER BY ws.user_id, ws.finished_at ASC),
    s4   AS (SELECT COUNT(DISTINCT fw.user_id) AS n FROM first_workouts fw JOIN public.workout_sessions ws ON ws.user_id = fw.user_id WHERE ws.finished_at IS NOT NULL AND ws.finished_at >= fw.onboarding_completed_at AND ws.finished_at <= fw.onboarding_completed_at + INTERVAL '24 hours'),
    user_7day_counts AS (SELECT fw.user_id, COUNT(*) AS workouts_in_first_7_days FROM first_workouts fw JOIN public.workout_sessions ws ON ws.user_id = fw.user_id WHERE ws.finished_at IS NOT NULL AND ws.finished_at::date BETWEEN fw.first_workout_date AND fw.first_workout_date + 6 GROUP BY fw.user_id),
    s5   AS (SELECT COUNT(DISTINCT user_id) AS n FROM user_7day_counts WHERE workouts_in_first_7_days >= 2),
    s6   AS (SELECT COUNT(DISTINCT user_id) AS n FROM user_7day_counts WHERE workouts_in_first_7_days >= 3),
    s7   AS (SELECT COUNT(DISTINCT user_id) AS n FROM user_7day_counts WHERE workouts_in_first_7_days >= 5),
    workout_days AS (SELECT DISTINCT fw.user_id, ws.finished_at::date AS workout_day FROM first_workouts fw JOIN public.workout_sessions ws ON ws.user_id = fw.user_id WHERE ws.finished_at IS NOT NULL),
    streak_groups AS (SELECT user_id, workout_day, workout_day - (ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY workout_day))::int AS grp FROM workout_days),
    streaks AS (SELECT user_id, COUNT(*) AS streak_days FROM streak_groups GROUP BY user_id, grp),
    s8   AS (SELECT COUNT(DISTINCT user_id) AS n FROM streaks WHERE streak_days >= 3),
    s9   AS (SELECT COUNT(DISTINCT c.id) AS n FROM coh_fo c WHERE c.id IN (SELECT user_id FROM paying_owners)),
    s_trial AS (SELECT COUNT(DISTINCT c.id) AS n FROM coh_fo c WHERE c.id IN (SELECT user_id FROM trial_owners)),
    cohort AS (SELECT id FROM coh_fo),
    -- Denominatore degli step 4, 10-18 e 22: tutta la coorte del primo avvio (prima erano i registrati
    -- del periodo; ora chi vede paywall o workout non è per forza registrato e il rapporto sfondava il 100%).
    s_coh AS (SELECT COUNT(*) AS n FROM coh_fo),
    ce AS (SELECT ec.user_id, ec.event_name, ec.metadata->>'source' AS source FROM public.events_canonical ec WHERE ec.user_id IN (SELECT id FROM cohort) AND ec.event_name IN ('paywall_step_view','paywall_close','view_Home','view_WorkoutDetail','workout_start','exercise_complete','workout_complete')),
    e_pw_onb      AS (SELECT COUNT(DISTINCT user_id) AS n FROM ce WHERE event_name='paywall_step_view' AND source='onboarding_end'),
    e_pwclose_onb AS (SELECT COUNT(DISTINCT user_id) AS n FROM ce WHERE event_name='paywall_close'     AND source='onboarding_end'),
    -- Step 22: utenti UNICI che hanno visto un paywall, qualunque sia il punto d'ingresso.
    e_pw_any      AS (SELECT COUNT(DISTINCT user_id) AS n FROM ce WHERE event_name='paywall_step_view'),
    e_home        AS (SELECT COUNT(DISTINCT user_id) AS n FROM ce WHERE event_name='view_Home'),
    e_wdetail     AS (SELECT COUNT(DISTINCT user_id) AS n FROM ce WHERE event_name='view_WorkoutDetail'),
    e_wstart      AS (SELECT COUNT(DISTINCT user_id) AS n FROM ce WHERE event_name='workout_start'),
    e_exc         AS (SELECT COUNT(DISTINCT user_id) AS n FROM ce WHERE event_name='exercise_complete'),
    e_wcomp       AS (SELECT COUNT(DISTINCT user_id) AS n FROM ce WHERE event_name='workout_complete'),
    ob_ident AS (
      SELECT COALESCE(ec.user_id::text, 'anon:' || ec.session_id::text) AS identity,
             LEAST(
               MIN(ec.created_at) FILTER (WHERE ec.event_name = 'view_OnboardingName'),
               MIN(ec.created_at) FILTER (WHERE ec.event_name = 'view_OnboardingGoal')
             )                                                                            AS t_start,
             MIN(ec.created_at) FILTER (WHERE ec.event_name = 'onboarding_complete')      AS t_done,
             MIN(ec.created_at) FILTER (WHERE ec.event_name = 'view_OnboardingTrialGift') AS t_gift
      FROM public.events_canonical ec
      WHERE ec.event_name IN ('view_OnboardingName','view_OnboardingGoal','onboarding_complete','view_OnboardingTrialGift')
        AND ec.created_at < COALESCE(p_end, fine + interval '1 day') + interval '90 days'
        AND ec.excl_blocked  IS NOT TRUE
        AND ec.excl_test     IS NOT TRUE
        AND ec.excl_emulator IS NOT TRUE
      GROUP BY 1
    ),
    ob_win AS (
      SELECT * FROM ob_ident
      WHERE t_start >= COALESCE(p_start, inizio)
        AND t_start <  COALESCE(p_end, fine + interval '1 day')
    ),
    s_ob_start AS (SELECT COUNT(*) AS n FROM ob_win),
    s_ob_done  AS (SELECT COUNT(*) AS n FROM ob_win WHERE t_done IS NOT NULL AND t_done >= t_start),
    s_ob_gift  AS (SELECT COUNT(*) AS n FROM ob_win WHERE t_gift IS NOT NULL AND t_gift >= t_start),
    vals AS (SELECT s0.n AS v0, s_fo.n AS v_fo, s1.n AS v1, s2.n AS v2, s3.n AS v3, s4.n AS v4, s5.n AS v5, s6.n AS v6, s7.n AS v7, s8.n AS v8, s9.n AS v9,
                    e_pw_onb.n AS v10, e_pwclose_onb.n AS v11, e_home.n AS v12, e_wdetail.n AS v13, e_wstart.n AS v14, e_exc.n AS v15, e_wcomp.n AS v16, s_trial.n AS v17,
                    s_ob_start.n AS v18, s_ob_done.n AS v19, s_ob_gift.n AS v20, e_pw_any.n AS v21, s_coh.n AS v_coh
             FROM s0, s_fo, s1, s2, s3, s4, s5, s6, s7, s8, s9, e_pw_onb, e_pwclose_onb, e_home, e_wdetail, e_wstart, e_exc, e_wcomp, s_trial, s_ob_start, s_ob_done, s_ob_gift, e_pw_any, s_coh)
  SELECT jsonb_agg(jsonb_build_object('step', step, 'numero', numero, 'conv', conv) ORDER BY ord)
  FROM (
    SELECT 0 AS ord,'0. Installazioni (Google Play)' AS step,v0 AS numero,'—' AS conv FROM vals
    UNION ALL SELECT 1,  '1. First Open (primo avvio)',     v_fo, CASE WHEN v0 IS NULL OR v0=0   THEN '—' ELSE ROUND(v_fo::numeric/v0*100,1)||'%'   END FROM vals
    UNION ALL SELECT 2,  '2. Onboarding iniziato',          v1,   CASE WHEN v_fo IS NULL OR v_fo=0 THEN '—' ELSE ROUND(v1::numeric/v_fo*100,1)||'%'   END FROM vals
    UNION ALL SELECT 3,  '3. Onboarding completato',        v2,   CASE WHEN v1=0   THEN '—' ELSE ROUND(v2::numeric/v1*100,1)||'%'     END FROM vals
    UNION ALL SELECT 4,  '4. Almeno 1 workout',             v3,   CASE WHEN v_coh=0   THEN '—' ELSE ROUND(v3::numeric/v_coh*100,1)||'%'     END FROM vals
    UNION ALL SELECT 5,  '5. Primo workout entro 24h',      v4,   CASE WHEN v3=0   THEN '—' ELSE ROUND(v4::numeric/v3*100,1)||'%'     END FROM vals
    UNION ALL SELECT 6,  '6. >=2 workout prima settimana',  v5,   CASE WHEN v3=0   THEN '—' ELSE ROUND(v5::numeric/v3*100,1)||'%'     END FROM vals
    UNION ALL SELECT 7,  '7. >=3 workout prima settimana',  v6,   CASE WHEN v3=0   THEN '—' ELSE ROUND(v6::numeric/v3*100,1)||'%'     END FROM vals
    UNION ALL SELECT 8,  '8. >=5 workout prima settimana',  v7,   CASE WHEN v3=0   THEN '—' ELSE ROUND(v7::numeric/v3*100,1)||'%'     END FROM vals
    UNION ALL SELECT 9,  '9. 3-day streak',                 v8,   CASE WHEN v3=0   THEN '—' ELSE ROUND(v8::numeric/v3*100,1)||'%'     END FROM vals
    UNION ALL SELECT 10, '10. Premium pagante',             v9,   CASE WHEN v_coh=0   THEN '—' ELSE ROUND(v9::numeric/v_coh*100,1)||'%'     END FROM vals
    UNION ALL SELECT 11, '11. Vede il paywall (fine onboarding)', v10, CASE WHEN v_coh=0 THEN '—' ELSE ROUND(v10::numeric/v_coh*100,1)||'%' END FROM vals
    UNION ALL SELECT 12, '12. Chiude il paywall onboarding',      v11, CASE WHEN v_coh=0 THEN '—' ELSE ROUND(v11::numeric/v_coh*100,1)||'%' END FROM vals
    UNION ALL SELECT 13, '13. Arriva in Home',                    v12, CASE WHEN v_coh=0 THEN '—' ELSE ROUND(v12::numeric/v_coh*100,1)||'%' END FROM vals
    UNION ALL SELECT 14, '14. Apre workout detail',               v13, CASE WHEN v_coh=0 THEN '—' ELSE ROUND(v13::numeric/v_coh*100,1)||'%' END FROM vals
    UNION ALL SELECT 15, '15. Preme Start (inizia workout)',      v14, CASE WHEN v_coh=0 THEN '—' ELSE ROUND(v14::numeric/v_coh*100,1)||'%' END FROM vals
    UNION ALL SELECT 16, '16. Fa >=1 esercizio',                  v15, CASE WHEN v_coh=0 THEN '—' ELSE ROUND(v15::numeric/v_coh*100,1)||'%' END FROM vals
    UNION ALL SELECT 17, '17. Completa workout (evento)',         v16, CASE WHEN v_coh=0 THEN '—' ELSE ROUND(v16::numeric/v_coh*100,1)||'%' END FROM vals
    UNION ALL SELECT 18, '18. Trial iniziato',                    v17, CASE WHEN v_coh=0 THEN '—' ELSE ROUND(v17::numeric/v_coh*100,1)||'%' END FROM vals
    UNION ALL SELECT 19, '19. Inizio questionario (anonimo)',     v18, CASE WHEN v_fo IS NULL OR v_fo=0 THEN '—' ELSE ROUND(v18::numeric/v_fo*100,1)||'%' END FROM vals
    UNION ALL SELECT 20, '20. Onboarding completato (registrato)',v19, CASE WHEN v18=0 THEN '—' ELSE ROUND(v19::numeric/v18*100,1)||'%' END FROM vals
    UNION ALL SELECT 21, '21. Regalo prova ricevuto',             v20, CASE WHEN v19=0 THEN '—' ELSE ROUND(v20::numeric/v19*100,1)||'%' END FROM vals
    UNION ALL SELECT 22, '22. Vede il paywall (qualsiasi)',       v21, CASE WHEN v_coh=0 THEN '—' ELSE ROUND(v21::numeric/v_coh*100,1)||'%' END FROM vals
  ) t;
$function$;

-- ============================================================================================
-- kpi_funnel_step_users
-- ============================================================================================
CREATE OR REPLACE FUNCTION public.kpi_funnel_step_users(p_step integer, inizio date, fine date, p_start timestamp with time zone DEFAULT NULL::timestamp with time zone, p_end timestamp with time zone DEFAULT NULL::timestamp with time zone)
 RETURNS jsonb
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public', 'auth'
AS $function$

  -- Dashboard interna: solo operatori in public.internal_operators.
  select public.assert_internal_operator();
  WITH excluded_users AS (SELECT id FROM public.kpi_excluded_users),
  tok_internal AS (SELECT purchase_token FROM public.play_token_facts WHERE is_test OR is_internal OR owner_user_id IN (SELECT id FROM excluded_users)),
  tok_canon AS (
    SELECT purchase_token, owner_user_id AS user_id, status, expires_at, start_at, payment_state, is_trial, product_id
    FROM public.play_token_facts
    WHERE purchase_token NOT IN (SELECT purchase_token FROM tok_internal)
  ),
  tok_wastrial AS (SELECT purchase_token, trial_started_at IS NOT NULL AS was_trial FROM public.play_token_facts),
  -- Stessa coorte di kpi_funnel: primo first_open nel periodo.
  cohort AS (
    SELECT u.id, u.name, u.username, u.email
    FROM public.cohort_users_fo(COALESCE(p_start, inizio::timestamptz), COALESCE(p_end, (fine + 1)::timestamptz)) c
    JOIN public.users u ON u.id = c.user_id
    WHERE u.id NOT IN (SELECT id FROM excluded_users)
  ),
  step_rows AS (
    SELECT DISTINCT ON (c.id)
      COALESCE(c.name, c.username, '') AS nome,
      c.email,
      CASE WHEN tc.product_id ILIKE '%year%' THEN 'Annuale'
           WHEN tc.product_id ILIKE '%month%' THEN 'Mensile'
           ELSE COALESCE(tc.product_id,'?') END AS piano,
      CASE WHEN tc.product_id ILIKE '%year%' THEN 29.99
           WHEN tc.product_id ILIKE '%month%' THEN 9.90
           ELSE NULL END AS prezzo,
      to_char(tc.start_at AT TIME ZONE 'Europe/Rome','DD/MM/YY') AS inizio,
      to_char(tc.expires_at AT TIME ZONE 'Europe/Rome','DD/MM/YY') AS scadenza
    FROM cohort c
    JOIN tok_canon tc ON tc.user_id = c.id
    LEFT JOIN tok_wastrial tw ON tw.purchase_token = tc.purchase_token
    WHERE ( p_step = 10 AND tc.expires_at > now() AND tc.status <> 'revoked' AND COALESCE(tc.payment_state, CASE WHEN tc.is_trial THEN 2 ELSE 1 END) = 1 )
       OR ( p_step = 18 AND tw.was_trial )
    ORDER BY c.id, tc.expires_at DESC NULLS LAST
  )
  SELECT COALESCE(jsonb_agg(to_jsonb(r) ORDER BY r.nome), '[]'::jsonb) FROM step_rows r;
$function$;

-- ============================================================================================
-- kpi_funnel_v2
-- Il default di p_mode è già 'cohort'. In 'cohort' la base sono le identità (utenti e anonimi) il cui
-- primo first_open cade nella finestra, e gli eventi successivi contano senza taglio superiore (solo
-- <= now()). 'absolute' resta com'era.
-- ============================================================================================
CREATE OR REPLACE FUNCTION public.kpi_funnel_v2(inizio date, fine date, p_steps jsonb, p_provider text DEFAULT NULL::text, p_cohort_anchor boolean DEFAULT true, p_include_emulators boolean DEFAULT false, p_start timestamp with time zone DEFAULT NULL::timestamp with time zone, p_end timestamp with time zone DEFAULT NULL::timestamp with time zone, p_include_test boolean DEFAULT false, p_include_blocked boolean DEFAULT false, p_source text DEFAULT NULL::text, p_mode text DEFAULT 'cohort'::text, p_include_bots boolean DEFAULT false)
 RETURNS jsonb
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public', 'auth'
AS $function$
  -- Dashboard interna: solo operatori in public.internal_operators.
  select public.assert_internal_operator();

  WITH RECURSIVE
  steps AS (
    SELECT (a.ordinality - 1)::int AS idx,
           CASE
             WHEN a.s ? 'events' THEN a.s->'events'
             ELSE jsonb_build_array(a.s->>'event')
           END AS events,
           COALESCE(a.s->>'label', a.s->>'event', (a.s->'events'->>0)) AS label,
           CASE
             WHEN a.s ? 'filters' THEN a.s->'filters'
             WHEN NULLIF(a.s->>'source','') IS NOT NULL THEN jsonb_build_object('source', a.s->>'source')
             ELSE '{}'::jsonb
           END AS filters,
           (a.s->>'variant_of')::int AS variant_of,
           -- N-esima occorrenza richiesta (1 = comportamento storico).
           GREATEST(COALESCE((a.s->>'min_count')::int, 1), 1) AS min_count,
           -- Ore dopo ts0 oltre le quali cercare un segno di vita (NULL = step normale).
           NULLIF(GREATEST(COALESCE((a.s->>'active_after_hours')::int, 0), 0), 0) AS active_after_hours
    FROM jsonb_array_elements(p_steps) WITH ORDINALITY AS a(s, ordinality)
  ),
  -- Spina dorsale: step non-variante, rinumerati densi 0..K (ord) per la cascata.
  spine AS (
    SELECT idx AS flat_idx, (row_number() OVER (ORDER BY idx) - 1)::int AS ord,
           min_count, active_after_hours
    FROM steps WHERE variant_of IS NULL
  ),
  -- Gli step di sopravvivenza non hanno un evento da matchare: il loro `event` nel payload è
  -- un segnaposto (il client ne pretende uno) e non deve allargare la lettura di `ev`.
  step_events AS (
    SELECT DISTINCT st.idx, st.filters, e.name AS event_name
    FROM steps st
    CROSS JOIN LATERAL jsonb_array_elements_text(st.events) e(name)
    WHERE st.active_after_hours IS NULL
  ),
  all_events_arr AS (
    SELECT array_agg(DISTINCT event_name) AS arr FROM step_events
  ),
  -- CUTOVER: unica fonte events_canonical, identita' gia' risolta sulla riga (user_id/auth_id).
  -- In 'cohort' nessun taglio superiore (solo <= now()): chi entra nella coorte col primo first_open
  -- porta con sé tutto ciò che fa dopo. In 'absolute' resta la finestra +90gg di prima.
  ev AS MATERIALIZED (
    SELECT COALESCE(ec.user_id::text, 'anon:' || ec.session_id::text) AS identity,
           ec.event_name,
           ec.metadata,
           ec.created_at
    FROM public.events_canonical ec
    WHERE ec.event_name = ANY ((SELECT arr FROM all_events_arr)::text[])
      AND ec.created_at >= COALESCE(p_start, inizio::timestamptz)
      AND ec.created_at <  CASE WHEN COALESCE(p_mode, 'cohort') = 'absolute'
                                THEN COALESCE(p_end, fine::timestamptz + interval '1 day') + interval '90 days'
                                ELSE now() + interval '1 second' END
      AND (p_include_blocked   OR ec.excl_blocked  IS NOT TRUE)
      AND (p_include_test      OR ec.excl_test     IS NOT TRUE)
      AND (p_include_emulators OR ec.excl_emulator IS NOT TRUE)
      AND (p_include_bots      OR ec.excl_bot      IS NOT TRUE)
      AND (p_provider IS NULL OR EXISTS (
            SELECT 1 FROM auth.identities ai
            WHERE ai.user_id = ec.auth_id AND ai.provider = p_provider))
  ),
  -- Primo first_open per identità (utenti e anonimi), con gli stessi filtri di `ev`. Serve solo a
  -- 'cohort': in 'absolute' la CTE resta vuota e non legge nulla.
  fo AS MATERIALIZED (
    SELECT COALESCE(ec.user_id::text, 'anon:' || ec.session_id::text) AS identity,
           min(ec.created_at) AS t
    FROM public.events_canonical ec
    WHERE COALESCE(p_mode, 'cohort') = 'cohort'
      AND ec.event_name = 'first_open'
      AND ec.created_at <= now()
      AND (p_include_blocked   OR ec.excl_blocked  IS NOT TRUE)
      AND (p_include_test      OR ec.excl_test     IS NOT TRUE)
      AND (p_include_emulators OR ec.excl_emulator IS NOT TRUE)
      AND (p_include_bots      OR ec.excl_bot      IS NOT TRUE)
      AND (p_provider IS NULL OR EXISTS (
            SELECT 1 FROM auth.identities ai
            WHERE ai.user_id = ec.auth_id AND ai.provider = p_provider))
    GROUP BY 1
  ),
  cohort_fo AS (
    SELECT fo.identity FROM fo
    WHERE fo.t >= COALESCE(p_start, inizio::timestamptz)
      AND fo.t <  COALESCE(p_end, (fine + interval '1 day')::timestamptz)
  ),
  matched AS MATERIALIZED (
    SELECT se.idx, ev.identity, ev.created_at
    FROM ev
    JOIN step_events se ON se.event_name = ev.event_name
    WHERE NOT EXISTS (
      SELECT 1 FROM jsonb_each_text(se.filters) f
      WHERE ev.metadata->>f.key IS DISTINCT FROM f.value
    )
  ),
  matched_agg AS MATERIALIZED (
    SELECT m.identity, m.idx,
           array_agg(m.created_at ORDER BY m.created_at) AS ts_arr
    FROM matched m
    GROUP BY m.identity, m.idx
  ),
  -- Ultimo segno di vita per identita', da `events` grezzo. Serve solo agli step
  -- `active_after_hours`: il bound costante e' il piu' permissivo fra quelli richiesti, e se
  -- nessuno step lo chiede la subquery e' NULL e qui non entra nessuna riga.
  last_activity AS MATERIALIZED (
    SELECT COALESCE(e.user_id::text, 'anon:' || e.session_id::text) AS identity,
           max(e.created_at) AS ts_last
    FROM public.events e
    WHERE e.created_at >= COALESCE(p_start, inizio::timestamptz)
                          + make_interval(hours => (SELECT min(active_after_hours)
                                                      FROM steps
                                                     WHERE active_after_hours IS NOT NULL))
    GROUP BY 1
  ),
  identity_source AS (
    SELECT 'anon:' || s.session_id::text AS identity,
           CASE
             WHEN s.utm_parsed->>'utm_medium' = 'linkinbio' THEN 'bio'
             WHEN s.install_referrer ILIKE '%fbclid%'
               OR s.install_referrer ILIKE '%apps.facebook.com%'
               OR s.install_referrer ILIKE '%utm_source=facebook%'
               OR s.install_referrer ILIKE '%apps.instagram.com%'
               OR s.utm_parsed->>'utm_source' IN ('facebook','meta','ig') THEN 'meta'
             WHEN s.install_referrer ILIKE '%organic%' THEN 'organic'
             ELSE 'unknown'
           END AS source
    FROM public.anonymous_sessions s
    WHERE s.user_id IS NULL
    UNION ALL
    SELECT linked.identity, linked.source FROM (
      SELECT DISTINCT ON (s.user_id) s.user_id::text AS identity,
             CASE
               WHEN s.utm_parsed->>'utm_medium' = 'linkinbio' THEN 'bio'
             WHEN s.install_referrer ILIKE '%fbclid%'
                 OR s.install_referrer ILIKE '%apps.facebook.com%'
                 OR s.install_referrer ILIKE '%utm_source=facebook%'
                 OR s.install_referrer ILIKE '%apps.instagram.com%'
                 OR s.utm_parsed->>'utm_source' IN ('facebook','meta','ig') THEN 'meta'
               WHEN s.install_referrer ILIKE '%organic%' THEN 'organic'
               ELSE 'unknown'
             END AS source
      FROM public.anonymous_sessions s
      WHERE s.user_id IS NOT NULL
      ORDER BY s.user_id, s.linked_at DESC NULLS LAST
    ) linked
  ),
  -- Cascata greedy sulla SOLA spina (solo p_mode='cohort': in 'absolute' l'anchor e' vuoto
  -- e la ricorsione non parte — zero costo): base = coorte (primo first_open nella finestra,
  -- che abbia l'evento spina[0]; filtro p_source); passo ricorsivo = primo evento spina[ord+1] con ts >= raggiungimento.
  --
  -- ts0    = raggiungimento dello step di testa, propagato invariato lungo tutta la catena
  -- prev_ts = raggiungimento dello step precedente (NULL su ord=0: non esiste un prima)
  -- Viaggiano DENTRO la ricorsione, cosi' Δ e Σ sono sottrazioni locali su ogni riga: niente
  -- window function, niente self-join a valle. La LATERAL impone t >= r.ts, quindi per ogni
  -- identita' i ts sono non decrescenti e Σ e' monotono per costruzione.
  --
  -- Sullo step di TESTA `min_count` e `active_after_hours` sono ignorati: la testa definisce
  -- la coorte e l'ancora ts0, non puo' misurarsi su se stessa.
  step_reach AS (
    SELECT ma.identity, 0 AS ord, x.ts, x.ts AS ts0, NULL::timestamptz AS prev_ts
    FROM spine sp0
    JOIN matched_agg ma ON ma.idx = sp0.flat_idx
    JOIN cohort_fo cf ON cf.identity = ma.identity
    LEFT JOIN identity_source isrc ON isrc.identity = ma.identity
    CROSS JOIN LATERAL (
      SELECT min(t) AS ts FROM unnest(ma.ts_arr) t
    ) x
    WHERE sp0.ord = 0
      AND COALESCE(p_mode, 'cohort') = 'cohort'
      AND x.ts IS NOT NULL
      AND (p_source IS NULL OR p_source = 'all'
           OR COALESCE(isrc.source, 'unknown') = p_source)
    UNION ALL
    -- LEFT JOIN su matched_agg: gli step di sopravvivenza non hanno righe matchate e devono
    -- comunque poter essere valutati. Con ts_arr NULL i due rami a eventi restituiscono NULL
    -- e la riga cade sul WHERE, esattamente come faceva l'INNER JOIN.
    SELECT r.identity, r.ord + 1, x.ts, r.ts0, r.ts
    FROM step_reach r
    JOIN spine sp ON sp.ord = r.ord + 1
    LEFT JOIN matched_agg m ON m.identity = r.identity AND m.idx = sp.flat_idx
    LEFT JOIN last_activity la ON sp.active_after_hours IS NOT NULL AND la.identity = r.identity
    CROSS JOIN LATERAL (
      SELECT CASE
               -- Sopravvivenza: c'e' vita oltre la soglia? Il timestamp e' l'ultima attivita'
               -- osservata (per i tempi lo step e' comunque escluso, vedi spine_times).
               WHEN sp.active_after_hours IS NOT NULL THEN
                 CASE WHEN la.ts_last >= r.ts0 + make_interval(hours => sp.active_after_hours)
                      THEN la.ts_last END
               -- N-esima occorrenza dell'evento contata da ts0 (nessun vincolo di distanza
               -- fra le occorrenze). La guardia `x.ts >= r.ts` sotto tiene la cascata monotona.
               WHEN sp.min_count > 1 THEN
                 (SELECT t FROM unnest(m.ts_arr) t
                   WHERE t >= r.ts0 ORDER BY t OFFSET sp.min_count - 1 LIMIT 1)
               -- Ramo storico, invariato.
               ELSE (SELECT min(t) FROM unnest(m.ts_arr) t WHERE t >= r.ts)
             END AS ts
    ) x
    WHERE x.ts IS NOT NULL
      AND x.ts >= r.ts
  ),
  -- Conteggi spina: per ogni ord, quante identità l'hanno raggiunto → mappato al flat_idx.
  spine_counts AS (
    SELECT sp.flat_idx AS idx, count(*) AS n
    FROM step_reach sr
    JOIN spine sp ON sp.ord = sr.ord
    GROUP BY sp.flat_idx
  ),
  -- Base matura degli step di sopravvivenza: chi, allo step precedente, ha gia' avuto il tempo
  -- di superare la soglia. E' il denominatore onesto della riga — gli altri non sono persi,
  -- sono ancora in volo.
  active_denoms AS (
    SELECT sp.flat_idx AS idx, count(*) AS denom
    FROM spine sp
    JOIN step_reach r ON r.ord = sp.ord - 1
    WHERE sp.active_after_hours IS NOT NULL
      AND r.ts0 + make_interval(hours => sp.active_after_hours) <= now()
    GROUP BY sp.flat_idx
  ),
  -- Tempi spina. percentile_cont ignora i NULL, quindi sullo step di testa il Δ esce NULL da
  -- solo (prev_ts e' NULL per tutti) mentre il Σ esce 0. Un delta di 0 secondi resta 0: e' un
  -- valore osservato (due eventi nello stesso istante), non un'assenza di misura.
  -- Gli step di sopravvivenza sono esclusi: il loro ts e' l'ultima attivita', non un passaggio.
  spine_times AS (
    SELECT sp.flat_idx AS idx,
           percentile_cont(0.5) WITHIN GROUP (
             ORDER BY EXTRACT(EPOCH FROM sr.ts - sr.prev_ts)::double precision) AS t_p50,
           percentile_cont(0.9) WITHIN GROUP (
             ORDER BY EXTRACT(EPOCH FROM sr.ts - sr.prev_ts)::double precision) AS t_p90,
           percentile_cont(0.5) WITHIN GROUP (
             ORDER BY EXTRACT(EPOCH FROM sr.ts - sr.ts0)::double precision) AS c_p50,
           percentile_cont(0.9) WITHIN GROUP (
             ORDER BY EXTRACT(EPOCH FROM sr.ts - sr.ts0)::double precision) AS c_p90
    FROM step_reach sr
    JOIN spine sp ON sp.ord = sr.ord
    WHERE sp.active_after_hours IS NULL
    GROUP BY sp.flat_idx
  ),
  -- Varianti: identità che hanno raggiunto il padre (nella cascata) e hanno emesso l'evento
  -- della variante a partire dal raggiungimento del padre. Fuori dalla catena.
  -- Scissa dai conteggi per riusare le stesse righe anche per i tempi: l'eleggibilità — e
  -- quindi ogni `n` — resta identica a prima della modifica.
  -- `min_count` vale anche qui (stessa semantica: N-esima occorrenza da ts0);
  -- `active_after_hours` su una variante e' ignorato — una variante e' una fetta del padre,
  -- non una condizione di sopravvivenza.
  variant_reach AS (
    SELECT v.idx AS idx, sr.identity, sr.ts0, sr.prev_ts, x.ts AS v_ts
    FROM steps v
    JOIN spine psp ON psp.flat_idx = v.variant_of
    JOIN step_reach sr ON sr.ord = psp.ord
    JOIN matched_agg mv ON mv.identity = sr.identity AND mv.idx = v.idx
    CROSS JOIN LATERAL (
      SELECT CASE
               WHEN v.min_count > 1 THEN
                 (SELECT t FROM unnest(mv.ts_arr) t
                   WHERE t >= sr.ts0 ORDER BY t OFFSET v.min_count - 1 LIMIT 1)
               ELSE (SELECT min(t) FROM unnest(mv.ts_arr) t WHERE t >= sr.ts)
             END AS ts
    ) x
    WHERE v.variant_of IS NOT NULL AND x.ts IS NOT NULL AND x.ts >= sr.ts
  ),
  variant_counts AS (
    SELECT vr.idx, count(DISTINCT vr.identity) AS n
    FROM variant_reach vr
    GROUP BY vr.idx
  ),
  -- Il Δ della variante e' ancorato allo step di spina PRECEDENTE AL PADRE (sr.prev_ts), non al
  -- padre: l'evento variante e' spesso emesso nello stesso istante del padre e un delta ~0 non
  -- direbbe nulla. Cosi' la colonna Δ della variante e' confrontabile con quella del padre.
  -- Variante di uno step in testa: prev_ts e' NULL → Δ NULL, corretto (non esiste un prima).
  variant_times AS (
    SELECT vr.idx,
           percentile_cont(0.5) WITHIN GROUP (
             ORDER BY EXTRACT(EPOCH FROM vr.v_ts - vr.prev_ts)::double precision) AS t_p50,
           percentile_cont(0.9) WITHIN GROUP (
             ORDER BY EXTRACT(EPOCH FROM vr.v_ts - vr.prev_ts)::double precision) AS t_p90,
           percentile_cont(0.5) WITHIN GROUP (
             ORDER BY EXTRACT(EPOCH FROM vr.v_ts - vr.ts0)::double precision) AS c_p50,
           percentile_cont(0.9) WITHIN GROUP (
             ORDER BY EXTRACT(EPOCH FROM vr.v_ts - vr.ts0)::double precision) AS c_p90
    FROM variant_reach vr
    GROUP BY vr.idx
  ),
  all_times AS (
    SELECT idx, t_p50, t_p90, c_p50, c_p90 FROM spine_times
    UNION ALL
    SELECT idx, t_p50, t_p90, c_p50, c_p90 FROM variant_times
  ),
  -- Modalità 'absolute': conteggi indipendenti per step (spina E varianti allo stesso modo),
  -- eventi nella sola finestra richiesta (ev estende +90gg per la cascata: qui si ri-stringe
  -- l'upper bound; il lower è già garantito da ev). Filtro p_source coerente con l'anchor.
  -- Qui step_reach e' vuota, quindi spine_times/variant_times lo sono e i LEFT JOIN a valle
  -- mettono NULL su tutte le chiavi di tempo: senza cascata non c'e' uno step precedente.
  -- `min_count` = almeno N occorrenze nella finestra; gli step di sopravvivenza non hanno
  -- ts0 da cui misurare la soglia e restano fuori (numero 0).
  counts_absolute AS (
    SELECT q.idx, count(*) AS n
    FROM (
      SELECT m.idx, m.identity
      FROM matched m
      JOIN steps st ON st.idx = m.idx
      LEFT JOIN identity_source isrc ON isrc.identity = m.identity
      WHERE COALESCE(p_mode, 'cohort') = 'absolute'
        AND st.active_after_hours IS NULL
        AND m.created_at < COALESCE(p_end, (fine + interval '1 day')::timestamptz)
        AND (p_source IS NULL OR p_source = 'all'
             OR COALESCE(isrc.source, 'unknown') = p_source)
      GROUP BY m.idx, m.identity, st.min_count
      HAVING count(*) >= st.min_count
    ) q
    GROUP BY q.idx
  ),
  -- Esclusi del periodo: utenti di kpi_excluded_users che, senza l'esclusione, sarebbero entrati
  -- nel primo passo (stessa finestra, filtri del passo, p_source e p_provider della coorte; in
  -- 'absolute' vale anche min_count). Legge events solo per gli esclusi (~100 id) e solo nella
  -- finestra: ev non si puo' riusare perche' ha gia' scartato proprio loro.
  -- In 'cohort' valgono gli stessi criteri della coorte: primo first_open nella finestra, nessun
  -- taglio superiore sugli eventi del passo.
  excl_hits AS (
    SELECT x.id, x.reason
    FROM public.kpi_excluded_users x
    JOIN spine sp0 ON sp0.ord = 0
    JOIN step_events se ON se.idx = sp0.flat_idx
    JOIN public.events e ON e.user_id = x.id AND e.event_name = se.event_name
    LEFT JOIN identity_source isrc ON isrc.identity = x.id::text
    WHERE e.created_at >= COALESCE(p_start, inizio::timestamptz)
      AND (COALESCE(p_mode, 'cohort') = 'cohort'
           OR e.created_at < COALESCE(p_end, (fine + interval '1 day')::timestamptz))
      AND (COALESCE(p_mode, 'cohort') = 'absolute'
           OR (SELECT min(f.created_at) FROM public.events f
               WHERE f.user_id = x.id AND f.event_name = 'first_open')
              BETWEEN COALESCE(p_start, inizio::timestamptz)
                  AND COALESCE(p_end, (fine + interval '1 day')::timestamptz) - interval '1 microsecond')
      AND NOT EXISTS (
        SELECT 1 FROM jsonb_each_text(se.filters) f
        WHERE e.metadata->>f.key IS DISTINCT FROM f.value)
      AND (p_source IS NULL OR p_source = 'all'
           OR COALESCE(isrc.source, 'unknown') = p_source)
      AND (p_provider IS NULL OR EXISTS (
            SELECT 1 FROM auth.identities ai
            WHERE ai.user_id = e.auth_id AND ai.provider = p_provider))
    GROUP BY x.id, x.reason, sp0.min_count
    HAVING COALESCE(p_mode, 'cohort') = 'cohort' OR count(*) >= sp0.min_count
  ),
  all_counts AS (
    SELECT idx, n FROM spine_counts
    UNION ALL
    SELECT idx, n FROM variant_counts
    UNION ALL
    SELECT idx, n FROM counts_absolute
  ),
  counts AS (
    SELECT st.idx, st.events, st.label, st.filters,
           COALESCE(ac.n, 0) AS numero,
           -- Valorizzata solo sugli step di sopravvivenza, dove 0 è un valore pieno di senso
           -- ("nessuno ancora giudicabile") e va distinto dal NULL degli step normali.
           CASE WHEN st.active_after_hours IS NOT NULL
                THEN COALESCE(ad.denom, 0) END AS denom_base,
           round(at.t_p50::numeric)::int AS t_p50_sec,
           round(at.t_p90::numeric)::int AS t_p90_sec,
           round(at.c_p50::numeric)::int AS t_cum_p50_sec,
           round(at.c_p90::numeric)::int AS t_cum_p90_sec
    FROM steps st
    LEFT JOIN all_counts   ac ON ac.idx = st.idx
    LEFT JOIN all_times    at ON at.idx = st.idx
    LEFT JOIN active_denoms ad ON ad.idx = st.idx
  )
  SELECT jsonb_build_object(
    'cohort_anchor', true,
    'source', COALESCE(p_source, 'all'),
    'include_emulators', p_include_emulators,
    'include_test', p_include_test,
    'include_blocked', p_include_blocked,
    'include_bots', p_include_bots,
    'cohort_size', CASE WHEN COALESCE(p_mode, 'cohort') = 'absolute'
      THEN COALESCE((SELECT ca.n FROM counts_absolute ca JOIN spine sp ON sp.flat_idx = ca.idx WHERE sp.ord = 0), 0)
      ELSE COALESCE((SELECT n FROM spine_counts sc JOIN spine sp ON sp.flat_idx = sc.idx WHERE sp.ord = 0), 0)
    END,
    'excluded_counts', (SELECT COALESCE(jsonb_object_agg(reason, n), '{}'::jsonb)
                        FROM (SELECT reason, count(*) AS n
                              FROM excl_hits GROUP BY reason) x),
    'steps', COALESCE(
      (SELECT jsonb_agg(
                jsonb_build_object(
                  'idx', idx, 'events', events, 'label', label,
                  'filters', filters, 'numero', numero,
                  'denom_base', denom_base,
                  't_p50_sec', t_p50_sec, 't_p90_sec', t_p90_sec,
                  't_cum_p50_sec', t_cum_p50_sec, 't_cum_p90_sec', t_cum_p90_sec)
                ORDER BY idx)
       FROM counts),
      '[]'::jsonb)
  );
$function$;
