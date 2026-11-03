(function(){
  const stato = new URLSearchParams(location.search).get('stato') || 'dati';
  const S12='117f7936-4149-4ce9-9fac-265835b40530', S19='766f4019-7e88-41ab-8cc1-b105ca86dbc2';
  const F = window.__FIX;
  const ok = d => Promise.resolve({ data: d, error: null });
  const chain = () => { const p = new Proxy(function(){}, { get(t,k){ if (k==='then') return (r)=>r({data:[],error:null}); return () => p; }, apply(){ return p; } }); return p; };
  const sb = {
    auth: { getSession: () => ok({ session: { user: { email: 'operatore@hypemove.app', id: 'x' }, access_token: 't' } }),
            getUser: () => ok({ user: { email: 'operatore@hypemove.app' } }), onAuthStateChange: () => ({ data: { subscription: { unsubscribe(){} } } }), signOut: () => ok(null) },
    rpc(name, a) {
      if (name === 'kpi_retention_daily_cohort_sizes') return ok(F.sprints);
      if (name === 'kpi_retention_daily') {
        if (stato === 'carica') return new Promise(()=>{});
        if (stato === 'errore') return Promise.resolve({ data: null, error: { message: 'canceling statement due to statement timeout' } });
        return ok(a.p_start === '2026-09-11' ? F.s12 : F.s19);
      }
      return ok(null);
    },
    from: chain, channel: () => ({ on(){ return this; }, subscribe(){ return this; } }), removeChannel(){}
  };
  window.supabase = { createClient: () => sb };
  window.__boot = () => {
    state.page = 'retention'; state.retView = 'day';
    if (stato === 'vuoto') { fetchRetentionDailySprints().then(render); return; }
    state.retDSprintSel = [S12, S19];
    fetchRetentionDaily();
  };
})();
