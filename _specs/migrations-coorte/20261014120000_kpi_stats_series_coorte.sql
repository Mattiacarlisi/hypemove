-- kpi_stats_series: la scheda «Prove che poi pagano» conta la coorte del primo avvio.
-- Prima: tutte le prove avviate (di chiunque) fra inizio e maturazione dello sprint scelto.
-- Ora: le prove degli utenti il cui primo first_open cade nelle righe del gruppo (stesso numero),
-- con i fati arrivati dopo la maturazione sommati sull'ultimo giorno. Nuova chiave cohort_rows
-- (una serie per riga) per il dettaglio di riga; cohort e cohort_points diventano i totali del gruppo.
do $mig$
declare d text; n text;
begin
  d := pg_get_functiondef('public.kpi_stats_series'::regproc);
  n := regexp_replace(d, '  coh as \(select tr\.\* from tr, sel.*?g\(d\)\n  \),',
$r$  grp as (select x.id sid, x.inizio, x.inizio + x.days - 1 w1 from cx x cross join sel
           where x.id = sel.id or (sel.numero is not null and x.numero = sel.numero)),
  gw as (select min(inizio) w0, max(w1) w1 from grp),
  coh as (select trs.* from trs join grp on grp.sid = trs.sid),
  co0 as (  -- l'ultimo giorno raccoglie anche cio' che arriva dopo la maturazione: resta della coorte
    select grp.sid, g.d::date dd,
      (select count(*) from coh c where c.sid = grp.sid and (c.a_d <= g.d::date or g.d::date = gw.w1)) started,
      (select count(*) from coh c where c.sid = grp.sid and c.state = 'paid' and (c.e_d <= g.d::date or g.d::date = gw.w1)) paid,
      (select count(*) from coh c where c.sid = grp.sid and c.cancelled and (c.e_d <= g.d::date or g.d::date = gw.w1)) cancelled,
      (select count(*) from coh c where c.sid = grp.sid and c.state = 'lost' and not c.cancelled and c.z_d < (select today from cfg)
         and (c.e_d <= g.d::date or g.d::date = gw.w1)) lost
    from grp cross join gw cross join lateral generate_series(gw.w0::timestamp, gw.w1::timestamp, interval '1 day') g(d)
  ),$r$);
  if n = d then raise exception 'kpi_stats_series: blocco coh/co0 non trovato'; end if;
  d := n;
  n := replace(d, $o$'lost', c.lost) order by c.dd) from co0 c), '[]'::jsonb),$o$,
$r$'lost', c.lost) order by c.dd) from (
      select dd, sum(started)::int started, sum(paid)::int paid, sum(cancelled)::int cancelled, sum(lost)::int lost
      from co0 group by dd) c), '[]'::jsonb),
    'cohort_rows', coalesce((select jsonb_agg(jsonb_build_object('id', r.sid, 'points', r.p)) from (
      select sid, jsonb_agg(jsonb_build_object('date', dd, 'started', started, 'paid', paid,
        'cancelled', cancelled, 'lost', lost) order by dd) p from co0 group by sid) r), '[]'::jsonb),$r$);
  if n = d then raise exception 'kpi_stats_series: cohort_points non trovato'; end if;
  execute n;
end $mig$;
