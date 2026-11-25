// Ritorno da «Collega con Facebook»: Meta mette la chiave nel frammento dell'indirizzo.
// Si toglie subito dall'indirizzo e dalla cronologia e si manda al server, che la mette in cassaforte.
(async () => {
  const KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZpd3NrZHhudGdjcmVkeXBwbHViIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkwMzIxNzAsImV4cCI6MjA2NDYwODE3MH0.W5b8A2zfm0Oeo746SXcANdeRhd2HsAMk5ND9Uc-q7Uo';
  const msg = document.getElementById('msg');
  const p = new URLSearchParams(location.hash.slice(1)), q = new URLSearchParams(location.search);
  history.replaceState(null, '', location.pathname);
  const token = p.get('access_token'), codice = p.get('state') || q.get('state');
  if (!token || !codice) { msg.textContent = q.get('error') || p.get('error') ? 'Permesso non dato. Riprova da Social.' : 'Questa pagina si apre da Social, con «Collega con Facebook».'; return; }
  try {
    const r = await fetch('https://fiwskdxntgcredypplub.supabase.co/functions/v1/social-instagram', { method: 'POST', headers: { apikey: KEY, Authorization: 'Bearer ' + KEY, 'Content-Type': 'application/json' }, body: JSON.stringify({ azione: 'ritorno', token, codice }) });
    const b = await r.json().catch(() => ({}));
    if (!r.ok) { msg.textContent = b.errore || 'Non riuscito. Riprova da Social.'; return; }
    msg.textContent = 'Collegato: @' + (b.username || 'hypemove.app') + (b.avviso ? '. I numeri però non sono arrivati: ' + b.avviso : '.');
  } catch (e) { msg.textContent = 'Connessione interrotta. Riprova da Social.'; }
})();
