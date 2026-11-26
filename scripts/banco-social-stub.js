// Finto Supabase per il banco del pannello Social (scripts/banco-social.mjs).
// Prende il posto di supabase-js: niente rete, i dati stanno in window.__FX (messi dal banco)
// e le scritture li cambiano davvero, così la pagina si comporta come con il server.
(() => {
  const FX = window.__FX;
  const ok = (data) => Promise.resolve({ data, error: null });
  const ko = (message) => Promise.resolve({ data: null, error: { message } });
  const tab = (t) => (FX.tabelle[t] ??= []);

  function query(t) {
    let filtro = null, campi = null, ordine = null, tipo = 'select';
    const q = {
      select() { return q; },
      order(c) { ordine = c; return q; },
      eq(c, v) { filtro = [c, v]; return q; },
      update(c) { tipo = 'update'; campi = c; return q; },
      insert(r) { tipo = 'insert'; campi = r; return q; },
      then(res, rej) { return esegui().then(res, rej); },
    };
    function esegui() {
      const righe = tab(t);
      if (tipo === 'insert') { righe.push({ id: 'n' + Date.now(), ...campi }); return ok(null); }
      if (tipo === 'update') {
        for (const r of righe.filter((x) => !filtro || x[filtro[0]] === filtro[1])) {
          if (t === 'social_posts' && campi.publish_at && !['approvato', 'pubblicato'].includes(r.stato)) return ko('prima va approvato');
          if (t === 'social_posts' && campi.tt_escluso && r.tt_stato) return ko('violates check constraint "social_posts_tt_escluso_fermo"');
          Object.assign(r, campi);
        }
        return ok(null);
      }
      const out = righe.map((x) => structuredClone(x));
      if (ordine) out.sort((a, b) => (a[ordine] > b[ordine] ? 1 : a[ordine] < b[ordine] ? -1 : 0));
      return ok(out);
    }
    return q;
  }

  function rpc(nome, a = {}) {
    const post = (id) => tab('social_posts').find((p) => p.id === id);
    switch (nome) {
      case 'is_internal_operator': return ok(true);
      case 'social_decidi': { const p = post(a.p_post); p.stato = a.p_stato; if (a.p_stato !== 'approvato') p.publish_at = null; return ok(null); }
      case 'social_link': return ok(FX.rpc.social_link[a.p_piattaforma || 'instagram']);
      case 'social_chiedi_prova': { const p = post(a.p_post); p.reel_prova_chiesto = a.p_si ? new Date().toISOString() : null; return ok(null); }
      default: return ok(FX.rpc[nome] ?? null);
    }
  }

  const sessione = { access_token: 'banco', user: { id: '00000000-0000-0000-0000-000000000000', email: 'banco@hypemove.app' } };
  window.supabase = {
    createClient: () => ({
      auth: { getSession: () => ok({ session: sessione }), signInWithPassword: () => ok({ session: sessione }), signOut: () => ok(null) },
      from: query,
      rpc,
      functions: { invoke: () => ok({ ok: true }) },
    }),
  };

  // Il banco simula il cron: il post esce su Instagram (Facebook lo condivide da solo) e poi su TikTok.
  window.__banco = {
    pubblica(id) {
      // Esce all'ora programmata (come farebbe il cron), così resta nella stessa settimana del calendario.
      const p = tab('social_posts').find((x) => x.id === id), t = p.publish_at || new Date().toISOString();
      Object.assign(p, { stato: 'pubblicato', pubblicato_il: t, ig_media_id: '1800000000000001', permalink: 'https://www.instagram.com/reel/BANCO0001/', pubblicazione: null });
      if (!p.tt_escluso) Object.assign(p, { tt_stato: 'uscito', tt_il: t, tt_post_id: '7400000000000000001', tt_permalink: 'https://www.tiktok.com/@hypemove.app/video/7400000000000000001' });
    },
  };
})();
