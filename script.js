(() => {
'use strict';

/* =========================================================
   Utilitaires
   ========================================================= */
const $  = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const money = n => (n < 0 ? '−' : '') + Math.abs(Number(n) || 0).toLocaleString('fr-FR', {minimumFractionDigits: 2, maximumFractionDigits: 2}) + ' $';
const fmtDate = d => d.toLocaleDateString('fr-FR', {day: 'numeric', month: 'short', year: 'numeric'});
const fmtTime = d => d.toLocaleTimeString('fr-FR', {hour: '2-digit', minute: '2-digit'});
const daysAgo = n => { const d = new Date(); d.setDate(d.getDate() - n); return d; };
const at = (n, h = 14, m = 32) => { const d = daysAgo(n); d.setHours(h, m, 0, 0); return d; };
const ico = (n, cls = '') => `<svg class="ico ${cls}"><use href="#i-${n}"/></svg>`;
const noop = () => {};

const PAL = [['#6c5ce7','#9b8cff'],['#f59e0b','#fb7185'],['#10b981','#34d399'],['#3b82f6','#60a5fa'],['#ec4899','#f472b6'],['#14b8a6','#2dd4bf'],['#ef4444','#fb923c']];
const hash = s => [...String(s)].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 7);
const initials = n => String(n).replace(/\./g, '').trim().split(/\s+/).slice(0, 2).map(w => w[0]).join('').toUpperCase();
const avatar = (n, s = 36) => { const [a, b] = PAL[hash(n) % PAL.length]; return `<span class="av" style="--s:${s}px;--a:${a};--b:${b}">${esc(initials(n))}</span>`; };
const pill = s => `<span class="pill ${{'Payée':'ok','En attente':'wait','Annulée':'ko','Brouillon':'draft','Publié':'ok'}[s] || 'draft'}">${esc(s)}</span>`;

/* =========================================================
   Données de démonstration (en mémoire)
   ========================================================= */
const CAT = {
  'Vidéo & Animation':      {ico: 'play',      c: ['#6c5ce7', '#a29bfe']},
  'Design & Graphisme':     {ico: 'pen',       c: ['#f59e0b', '#fb7185']},
  'Développement web':      {ico: 'code',      c: ['#0ea5e9', '#6366f1']},
  'Marketing digital':      {ico: 'megaphone', c: ['#10b981', '#34d399']},
  'Rédaction & Traduction': {ico: 'file',      c: ['#ec4899', '#f472b6']},
  'Audio & Musique':        {ico: 'music',     c: ['#14b8a6', '#22d3ee']},
  'Autre':                  {ico: 'box',       c: ['#64748b', '#94a3b8']}
};

const METHODS = [
  {id: 'card',   name: 'Carte bancaire', sub: 'Visa, Mastercard, Amex', via: 'Carte bancaire',   ico: 'card',  bg: '#e3edff', fg: '#2563eb'},
  {id: 'momo',   name: 'Mobile Money',   sub: 'MTN, Orange, Airtel…',   via: 'MTN Mobile Money', ico: 'phone', bg: '#fdecc8', fg: '#d98a14'},
  {id: 'paypal', name: 'PayPal',         sub: 'Compte PayPal',          via: 'PayPal',           txt: 'P',     bg: '#e6eefc', fg: '#1d4ed8'}
];

const CLIENTS = ['Amani K.','Moussa D.','Sarah B.','Jean P.','Fatou N.','Kevin M.','Aïcha T.','Daniel O.','Grace L.','Yves R.','Linda S.','Samuel W.']
  .map(name => ({name, email: name.split(' ')[0].toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '') + '@email.com'}));

const PRODUCTS = [
  {id: 1, name: 'Vidéo promotionnelle',        cat: 'Vidéo & Animation',  price: 50,  days: 3, status: 'Publié',    desc: 'Courte vidéo pour promouvoir votre activité.'},
  {id: 2, name: 'Logo professionnel',          cat: 'Design & Graphisme', price: 30,  days: 2, status: 'Publié',    desc: 'Création de logo avec fichiers sources.'},
  {id: 3, name: 'Site vitrine',                cat: 'Développement web',  price: 200, days: 7, status: 'Publié',    desc: 'Site web responsive de 5 pages.'},
  {id: 4, name: 'Vidéo explicative',           cat: 'Vidéo & Animation',  price: 75,  days: 4, status: 'Publié',    desc: 'Animation explicative de 60 secondes.'},
  {id: 5, name: 'Montage vidéo professionnel', cat: 'Vidéo & Animation',  price: 120, days: 5, status: 'Brouillon', desc: 'Montage de vidéos pour projets professionnels, réseaux sociaux et publicités.'}
];

const ORDERS = (() => {
  const base = [
    {id: 1027, client: 'Amani K.',  product: 'Vidéo promotionnelle', amount: 50,  status: 'Payée',      ago: 0},
    {id: 1026, client: 'Moussa D.', product: 'Logo professionnel',   amount: 30,  status: 'En attente', ago: 0},
    {id: 1025, client: 'Sarah B.',  product: 'Site vitrine',         amount: 200, status: 'Payée',      ago: 1},
    {id: 1024, client: 'Jean P.',   product: 'Vidéo explicative',    amount: 75,  status: 'Payée',      ago: 1}
  ];
  for (let i = 0; i < 14; i++) {
    const p = PRODUCTS[i % 4];
    base.push({id: 1023 - i, client: CLIENTS[(i + 4) % 12].name, product: p.name, amount: p.price,
      status: i % 7 === 3 ? 'En attente' : (i % 11 === 5 ? 'Annulée' : 'Payée'), ago: 2 + i});
  }
  return base;
})();

const SERIES = {
  7: [105, 250, 275, 435, 360, 610, 850],
  30: (() => { let v = 140, s = 7; return Array.from({length: 30}, () => { s = (s * 9301 + 49297) % 233280; v = Math.max(80, v + (s / 233280 - .36) * 110); return Math.round(v); }); })()
};

const state = {
  user: {first: 'Gloire', last: 'Aridi', email: 'gloire.aridi@email.com', role: 'Propriétaire'},
  balance: 856,
  revenue: 1250,
  period: 7,
  query: '',
  fStatus: '',
  txAll: false,
  products: PRODUCTS,
  orders: ORDERS,
  clients: CLIENTS,
  notifs: 3,
  tx: [
    {id: 't3', type: 'recharge', title: 'Rechargement compte',     amount: 100, date: at(0), via: 'MTN Mobile Money',  ref: '#R2003'},
    {id: 't2', type: 'order',    title: 'Paiement commande #1024', amount: -75, date: at(1), via: 'Vidéo explicative', ref: '#1024'},
    {id: 't1', type: 'recharge', title: 'Rechargement compte',     amount: 50,  date: at(4), via: 'Carte bancaire',    ref: '#R2001'}
  ],
  draft: null,
  step: 1
};

/* =========================================================
   Toast / modale / menu
   ========================================================= */
let toastTimer;
function toast(msg) {
  const t = $('#toast');
  t.textContent = msg; t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), 2600);
}
function openModal(html) {
  $('#modal-root').innerHTML = `<div class="modal-bg"><div class="modal" role="dialog" aria-modal="true">${html}</div></div>`;
  document.body.classList.add('lock');
}
function closeModal() { $('#modal-root').innerHTML = ''; document.body.classList.remove('lock'); }
const closeMenu = () => document.body.classList.remove('menu-open');

/* =========================================================
   Graphique des ventes (SVG, courbe lissée + survol)
   ========================================================= */
function smooth(p) {
  const n = p.length;
  if (n < 2) return `M${p[0][0]},${p[0][1]}`;
  const dx = [], m = [], t = new Array(n);
  for (let i = 0; i < n - 1; i++) { dx[i] = p[i + 1][0] - p[i][0]; m[i] = (p[i + 1][1] - p[i][1]) / dx[i]; }
  t[0] = m[0]; t[n - 1] = m[n - 2];
  for (let i = 1; i < n - 1; i++) t[i] = m[i - 1] * m[i] <= 0 ? 0 : (m[i - 1] + m[i]) / 2;
  for (let i = 0; i < n - 1; i++) {
    if (m[i] === 0) { t[i] = t[i + 1] = 0; continue; }
    const a = t[i] / m[i], b = t[i + 1] / m[i], s = a * a + b * b;
    if (s > 9) { const k = 3 / Math.sqrt(s); t[i] = k * a * m[i]; t[i + 1] = k * b * m[i]; }
  }
  let d = `M${p[0][0]},${p[0][1]}`;
  for (let i = 0; i < n - 1; i++) {
    const h = dx[i] / 3;
    d += ` C${p[i][0] + h},${p[i][1] + t[i] * h} ${p[i + 1][0] - h},${p[i + 1][1] - t[i + 1] * h} ${p[i + 1][0]},${p[i + 1][1]}`;
  }
  return d;
}
function niceStep(raw) {
  const mag = 10 ** Math.floor(Math.log10(raw)), n = raw / mag;
  return (n <= 1 ? 1 : n <= 2 ? 2 : n <= 2.5 ? 2.5 : n <= 5 ? 5 : 10) * mag;
}
function drawChart() {
  const host = $('#chart'); if (!host) return;
  const n = state.period, vals = SERIES[n];
  const labels = vals.map((_, i) => daysAgo(n - 1 - i).toLocaleDateString('fr-FR', {day: 'numeric', month: 'short'}).replace('.', ''));
  const W = Math.max(host.clientWidth, 280), H = W < 520 ? 210 : 260;
  const m = {l: 48, r: 16, t: 12, b: 30};
  const step = niceStep(Math.max(...vals) / 4), max = step * 4;
  const x0 = m.l + 10, x1 = W - m.r - 10;
  const X = i => x0 + i * (x1 - x0) / (vals.length - 1);
  const Y = v => m.t + (H - m.t - m.b) * (1 - v / max);
  const pts = vals.map((v, i) => [X(i), Y(v)]);
  const line = smooth(pts), base = Y(0);
  const area = `${line} L${pts[pts.length - 1][0]},${base} L${pts[0][0]},${base}Z`;
  let grid = '';
  for (let k = 0; k <= 4; k++) {
    const v = step * k, y = Y(v);
    grid += `<line x1="${m.l}" x2="${W - m.r}" y1="${y}" y2="${y}" class="gl"/><text x="${m.l - 10}" y="${y + 4}" text-anchor="end" class="gt">${v.toLocaleString('fr-FR')}</text>`;
  }
  const every = Math.ceil(vals.length / 7);
  let xl = '';
  labels.forEach((l, i) => { if ((vals.length - 1 - i) % every === 0) xl += `<text x="${X(i)}" y="${H - 8}" text-anchor="middle" class="gt">${l}</text>`; });
  host.innerHTML = `<svg viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="Évolution des ventes">
    <defs><linearGradient id="ga" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#5b4ff0" stop-opacity=".28"/><stop offset="1" stop-color="#5b4ff0" stop-opacity=".02"/></linearGradient></defs>
    ${grid}<path d="${area}" fill="url(#ga)"/><path d="${line}" fill="none" stroke="#5b4ff0" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>${xl}
    <g id="hv" style="display:none"><line id="hl" y1="${m.t}" y2="${base}" stroke="#5b4ff0" stroke-opacity=".25" stroke-dasharray="4 4"/><circle id="hc" r="5.5" fill="#fff" stroke="#5b4ff0" stroke-width="3"/></g>
    <rect id="hit" x="0" y="0" width="${W}" height="${H}" fill="transparent"/></svg><div class="tip" id="tip"></div>`;
  const hv = $('#hv', host), hl = $('#hl', host), hc = $('#hc', host), tip = $('#tip', host);
  const show = e => {
    const r = host.getBoundingClientRect();
    let i = Math.round((e.clientX - r.left - x0) / ((x1 - x0) / (vals.length - 1)));
    i = Math.max(0, Math.min(vals.length - 1, i));
    hv.style.display = ''; hl.setAttribute('x1', X(i)); hl.setAttribute('x2', X(i));
    hc.setAttribute('cx', X(i)); hc.setAttribute('cy', Y(vals[i]));
    tip.textContent = `${labels[i]} · ${money(vals[i])}`;
    tip.style.left = X(i) + 'px'; tip.style.top = Y(vals[i]) + 'px'; tip.style.opacity = 1;
  };
  const hide = () => { hv.style.display = 'none'; tip.style.opacity = 0; };
  const hit = $('#hit', host);
  hit.addEventListener('pointermove', show); hit.addEventListener('pointerdown', show);
  hit.addEventListener('pointerleave', hide); hit.addEventListener('pointerup', e => { if (e.pointerType !== 'mouse') setTimeout(hide, 1200); });
}

/* =========================================================
   Illustrations
   ========================================================= */
const ROCKET = `<svg viewBox="0 0 64 64" width="64" height="64" aria-hidden="true"><g transform="rotate(45 32 32)">
  <path d="M27 40h10c0 8-3 14-5 17-2-3-5-9-5-17z" fill="#f5a524"/>
  <path d="M23 30c-6 3-9 9-9 15l9-4z" fill="#5b4ff0"/><path d="M41 30c6 3 9 9 9 15l-9-4z" fill="#5b4ff0"/>
  <path d="M32 6c8 7 11 17 9 30H23C21 23 24 13 32 6z" fill="#fff" stroke="#4a3fdc" stroke-width="2.5" stroke-linejoin="round"/>
  <circle cx="32" cy="23" r="4.5" fill="#7c6ff7"/></g></svg>`;
const LAPTOP = `<svg class="hero-art" viewBox="0 0 200 120" aria-hidden="true">
  <rect x="8" y="10" width="38" height="9" rx="4.5" fill="#cfc9ff"/><rect x="20" y="24" width="24" height="9" rx="4.5" fill="#dcd8ff"/>
  <rect x="40" y="18" width="110" height="72" rx="6" fill="#3d34c9"/><rect x="46" y="24" width="98" height="60" rx="3" fill="#efecff"/>
  <polyline points="56,74 76,62 92,68 112,48 136,34" fill="none" stroke="#5b4ff0" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M130 32h8v8" fill="none" stroke="#5b4ff0" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M28 92h134l-8 10H36z" fill="#9b93f5"/>
  <path d="M170 104h24l-3 14h-18z" fill="#6c5ce7"/>
  <ellipse cx="174" cy="90" rx="6" ry="15" fill="#2f9e7c" transform="rotate(-24 174 90)"/><ellipse cx="190" cy="88" rx="6" ry="16" fill="#3dbb8a" transform="rotate(22 190 88)"/>
  <ellipse cx="182" cy="82" rx="6" ry="18" fill="#34b184"/></svg>`;

/* =========================================================
   Vues
   ========================================================= */
const VIEWS = {}, MOUNT = {}, TITLES = {dashboard: 'Tableau de bord', produits: 'Produits / Services', commandes: 'Commandes', clients: 'Clients', paiements: 'Paiements', marketing: 'Marketing', rapports: 'Rapports', profil: 'Paramètres'};
const q = () => state.query.trim().toLowerCase();
const filterOrders = () => state.orders.filter(o => !q() || `${o.client} ${o.product} #${o.id}`.toLowerCase().includes(q()));

/* ----- Tableau de bord ----- */
VIEWS.dashboard = () => {
  const rows = filterOrders().slice(0, 4);
  let today = new Date().toLocaleDateString('fr-FR', {weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'});
  today = today.charAt(0).toUpperCase() + today.slice(1);
  const first = esc(state.user.first);
  return `
  <section class="hero">
    <div class="hero-l">${ROCKET}<div><h1>Bonjour ${first} !</h1><p>Voici un aperçu de votre activité aujourd’hui.</p></div></div>
    <div class="hero-right">
      <div class="hero-date"><span class="d">${ico('calendar')}${today}</span><em>« Les grandes réalisations commencent par une bonne gestion. »</em></div>
      ${LAPTOP}
    </div>
  </section>
  <section class="greet"><h1>Bonjour ${first} !</h1><p>Voici un aperçu de votre activité.</p></section>

  <section class="stats">
    <div class="card stat rev"><div class="stat-ico" style="background:#2fb67c">${ico('wallet')}</div><div class="stat-b"><div class="lbl">Revenus totaux</div><div class="val-row"><div class="val">${money(state.revenue)}</div><span class="up">${ico('up-right')}+12%</span></div><div class="sub">par rapport au mois dernier</div></div></div>
    <div class="card stat"><div class="stat-ico" style="background:#3b82f6">${ico('bag')}</div><div class="stat-b"><div class="lbl">Commandes</div><div class="val">${state.orders.length}</div><span class="up">${ico('up-right')}+20%</span><div class="sub">par rapport au mois dernier</div></div></div>
    <div class="card stat"><div class="stat-ico" style="background:#8b45f0">${ico('users')}</div><div class="stat-b"><div class="lbl">Clients</div><div class="val">${state.clients.length}</div><span class="up">${ico('up-right')}+9%</span><div class="sub">par rapport au mois dernier</div></div></div>
    <div class="card stat bal4"><div class="stat-ico" style="background:#fdecc8;color:#e49a2b">${ico('wallet')}</div><div class="stat-b"><div class="lbl">Solde du compte</div><div class="val">${money(state.balance)}</div><button class="btn btn-amber" data-act="recharge">Recharger</button></div></div>
  </section>

  <section class="split">
    <div class="card">
      <div class="card-h"><h2>Évolution des ventes</h2>
        <select class="sel" id="period" aria-label="Période"><option value="7" ${state.period === 7 ? 'selected' : ''}>7 derniers jours</option><option value="30" ${state.period === 30 ? 'selected' : ''}>30 derniers jours</option></select></div>
      <div class="chart-pad"><div id="chart"></div></div>
    </div>
    <a class="btn btn-amber btn-block mobile-cta" href="#/produits/nouveau">Créer un produit / service</a>
    <div class="card">
      <div class="card-h"><h2>Commandes récentes</h2><a class="link" href="#/commandes">Voir tout</a></div>
      <div class="tbl-wrap"><table class="tbl"><thead><tr><th>Client</th><th class="col-prod">Produit</th><th>Montant</th><th>Statut</th></tr></thead><tbody>
        ${rows.length ? rows.map(o => `<tr data-go="commandes"><td><div class="who">${avatar(o.client, 34)}${esc(o.client)}</div></td><td class="col-prod">${esc(o.product)}</td><td>${money(o.amount)}</td><td>${pill(o.status)}</td></tr>`).join('') : '<tr><td colspan="4" class="empty">Aucun résultat</td></tr>'}
      </tbody></table></div>
    </div>
  </section>`;
};
MOUNT.dashboard = drawChart;

/* ----- Produits / Services ----- */
VIEWS.produits = () => {
  const list = state.products.filter(p => !q() || `${p.name} ${p.cat}`.toLowerCase().includes(q()));
  return `
  <div class="page-h"><div><h1>Produits / Services</h1><p>${state.products.length} offre${state.products.length > 1 ? 's' : ''} dans votre catalogue</p></div>
    <a class="btn btn-amber" href="#/produits/nouveau">${ico('plus')}Créer un produit / service</a></div>
  ${list.length ? `<div class="pgrid">${list.map(p => {
    const c = CAT[p.cat] || CAT['Autre'];
    return `<article class="card pc"><div class="pthumb" style="--a:${c.c[0]};--b:${c.c[1]}">${p.img ? `<img src="${p.img}" alt="">` : ico(c.ico)}</div>
      <div class="pbody"><h3>${esc(p.name)}</h3><span class="cat">${esc(p.cat)}</span>${pill(p.status)}
      <div class="pfoot"><strong>${money(p.price)}${p.unit === 'À l’heure' ? ' <small>/ h</small>' : ''}</strong><button class="ico-btn" data-act="del-product" data-id="${p.id}" aria-label="Supprimer ${esc(p.name)}">${ico('trash')}</button></div></div></article>`;
  }).join('')}</div>` : '<div class="card empty-big">' + ico('box') + '<h3>Aucun produit trouvé</h3><p>Modifiez votre recherche ou créez une nouvelle offre.</p></div>'}`;
};

/* ----- Commandes ----- */
VIEWS.commandes = () => {
  const list = filterOrders().filter(o => !state.fStatus || o.status === state.fStatus);
  return `
  <div class="page-h"><div><h1>Commandes</h1><p>${state.orders.length} commandes au total</p></div>
    <select class="sel" id="fstatus" aria-label="Filtrer par statut">${['', 'Payée', 'En attente', 'Annulée'].map(s => `<option value="${s}" ${state.fStatus === s ? 'selected' : ''}>${s || 'Tous les statuts'}</option>`).join('')}</select></div>
  <div class="card"><div class="tbl-wrap"><table class="tbl"><thead><tr><th>N°</th><th>Client</th><th class="col-prod">Produit</th><th class="col-date">Date</th><th>Montant</th><th>Statut</th></tr></thead><tbody>
    ${list.length ? list.map(o => `<tr><td>#${o.id}</td><td><div class="who">${avatar(o.client, 32)}${esc(o.client)}</div></td><td class="col-prod">${esc(o.product)}</td><td class="col-date">${fmtDate(daysAgo(o.ago))}</td><td>${money(o.amount)}</td><td>${pill(o.status)}</td></tr>`).join('') : '<tr><td colspan="6" class="empty">Aucune commande trouvée</td></tr>'}
  </tbody></table></div></div>`;
};

/* ----- Clients ----- */
VIEWS.clients = () => {
  const list = state.clients.filter(c => !q() || `${c.name} ${c.email}`.toLowerCase().includes(q()));
  return `
  <div class="page-h"><div><h1>Clients</h1><p>${state.clients.length} clients enregistrés</p></div></div>
  <div class="card"><div class="tbl-wrap"><table class="tbl"><thead><tr><th>Client</th><th>Commandes</th><th>Total payé</th></tr></thead><tbody>
    ${list.length ? list.map(c => {
      const mine = state.orders.filter(o => o.client === c.name);
      const spent = mine.filter(o => o.status === 'Payée').reduce((s, o) => s + o.amount, 0);
      return `<tr><td><div class="who">${avatar(c.name, 36)}<div>${esc(c.name)}<small>${esc(c.email)}</small></div></div></td><td>${mine.length}</td><td>${money(spent)}</td></tr>`;
    }).join('') : '<tr><td colspan="3" class="empty">Aucun client trouvé</td></tr>'}
  </tbody></table></div></div>`;
};

/* ----- Marketing / Rapports (bientôt) ----- */
const soon = (t, txt, i) => () => `<div class="page-h"><div><h1>${t}</h1></div></div><div class="card empty-big">${ico(i)}<h3>Bientôt disponible</h3><p>${txt}</p></div>`;
VIEWS.marketing = soon('Marketing', 'Campagnes, codes promo et réseaux sociaux : cette section arrive bientôt.', 'megaphone');
VIEWS.rapports  = soon('Rapports', 'Analyses détaillées de vos ventes et de vos clients : cette section arrive bientôt.', 'chart');

/* ----- Assistant « Créer un produit / service » ----- */
const STEPS = ['Informations', 'Prix', 'Médias', 'Publication'];
const emptyDraft = () => ({name: '', desc: '', cat: '', img: '', price: '', days: '', unit: 'Prix fixe', gallery: [], video: '', publish: true});

VIEWS['produits/nouveau'] = () => `
  <a class="back" href="#/produits">${ico('left')}Retour aux produits</a>
  <div class="page-h"><div><h1>Créer un produit / service</h1><p>Renseignez votre offre en 4 étapes.</p></div></div>
  <div class="card wizard"><div class="steps" id="steps"></div><div class="wiz-body" id="wiz"></div></div>`;
MOUNT['produits/nouveau'] = () => { if (!state.draft) { state.draft = emptyDraft(); state.step = 1; } wizRender(); };

function stepInfo(d) { return `
  <h2 class="wiz-t">Informations du produit</h2>
  <div class="field" data-f="name"><label>Nom du produit <i>*</i></label><input class="in" data-k="name" maxlength="80" placeholder="Ex. Montage vidéo professionnel" value="${esc(d.name)}"><span class="errmsg">Saisissez un nom d’au moins 3 caractères.</span></div>
  <div class="field" data-f="desc"><label>Description <i>*</i></label><textarea class="in" data-k="desc" rows="4" maxlength="600" placeholder="Décrivez ce que vous proposez…">${esc(d.desc)}</textarea><span class="errmsg">Ajoutez une description d’au moins 10 caractères.</span></div>
  <div class="field" data-f="cat"><label>Catégorie <i>*</i></label><select class="in" data-k="cat"><option value="">Choisir une catégorie</option>${Object.keys(CAT).map(c => `<option ${c === d.cat ? 'selected' : ''}>${c}</option>`).join('')}</select><span class="errmsg">Choisissez une catégorie.</span></div>
  <div class="field" data-f="img"><label>Image principale <i>*</i></label>
    <div class="drop" id="drop" tabindex="0" role="button">${d.img ? `<img src="${d.img}" alt="Aperçu"><span>Cliquez pour changer l’image</span>` : `${ico('image')}<span>Cliquez pour télécharger</span><small>ou glissez votre image ici</small>`}</div>
    <input type="file" id="file" accept="image/*" hidden><span class="errmsg">Ajoutez une image principale.</span></div>`; }

function stepPrice(d) { return `
  <h2 class="wiz-t">Tarification</h2>
  <div class="field"><label>Type de tarif</label><div class="chips">${['Prix fixe', 'À l’heure'].map(u => `<button type="button" class="chip ${d.unit === u ? 'on' : ''}" data-unit="${u}">${u}</button>`).join('')}</div></div>
  <div class="field" data-f="price"><label>Prix en dollars ($) <i>*</i></label><input class="in" type="number" min="1" step="0.01" inputmode="decimal" data-k="price" value="${esc(d.price)}" placeholder="Ex. 50"><span class="errmsg">Saisissez un prix supérieur à 0.</span></div>
  <div class="field" data-f="days"><label>Délai de livraison (jours) <i>*</i></label><input class="in" type="number" min="1" step="1" inputmode="numeric" data-k="days" value="${esc(d.days)}" placeholder="Ex. 3"><span class="errmsg">Indiquez un délai d’au moins 1 jour.</span></div>`; }

function stepMedia(d) { return `
  <h2 class="wiz-t">Médias</h2>
  <div class="field"><label>Galerie <small>(jusqu’à 4 images, facultatif)</small></label>
    <div class="gal">${d.gallery.map((g, i) => `<div class="gi"><img src="${g}" alt=""><button type="button" class="gx" data-rm="${i}" aria-label="Retirer l’image">${ico('x')}</button></div>`).join('')}${d.gallery.length < 4 ? `<button type="button" class="gadd" id="gadd">${ico('plus')}Ajouter</button>` : ''}</div>
    <input type="file" id="gfile" accept="image/*" multiple hidden></div>
  <div class="field" data-f="video"><label>Lien vidéo <small>(facultatif)</small></label><input class="in" data-k="video" placeholder="https://…" value="${esc(d.video)}"><span class="errmsg">Saisissez une adresse valide commençant par https://</span></div>`; }

function stepPublish(d) { return `
  <h2 class="wiz-t">Publication</h2>
  <div class="recap"><div class="rthumb">${d.img ? `<img src="${d.img}" alt="">` : ''}</div>
    <div><b>${esc(d.name)}</b><span>${esc(d.cat)}</span><strong>${money(parseFloat(d.price) || 0)}${d.unit === 'À l’heure' ? ' <small>/ heure</small>' : ''}</strong><span>Livraison en ${esc(d.days)} jour(s)</span></div></div>
  <label class="switch"><input type="checkbox" data-k="publish" ${d.publish ? 'checked' : ''}><span class="sw"></span><span><b>Publier immédiatement</b><small>Désactivé, l’offre est enregistrée comme brouillon.</small></span></label>`; }

function wizRender() {
  const d = state.draft, s = state.step;
  $('#steps').innerHTML = STEPS.map((t, i) => `<div class="step ${i + 1 === s ? 'on' : ''} ${i + 1 < s ? 'done' : ''}"><span class="n">${i + 1 < s ? ico('check') : i + 1}</span><span>${t}</span></div>`).join('');
  $('#wiz').innerHTML = [stepInfo, stepPrice, stepMedia, stepPublish][s - 1](d) +
    `<div class="wiz-actions">${s > 1 ? '<button class="btn btn-ghost" data-act="wiz-back">Retour</button>' : ''}<button class="btn btn-primary" data-act="wiz-next">${s < 4 ? 'Suivant ' + ico('arrow-right') : 'Publier'}</button></div>`;
  wizBind();
}

// Redimensionne l'image côté navigateur pour garder des données légères
function readImage(file, cb) {
  if (!file || !file.type.startsWith('image/')) { toast('Veuillez choisir un fichier image.'); return; }
  if (file.size > 8 * 1024 * 1024) { toast('Image trop lourde (8 Mo maximum).'); return; }
  const fr = new FileReader();
  fr.onload = () => {
    const im = new Image();
    im.onload = () => {
      const k = Math.min(1, 900 / Math.max(im.width, im.height));
      const c = document.createElement('canvas');
      c.width = Math.round(im.width * k); c.height = Math.round(im.height * k);
      c.getContext('2d').drawImage(im, 0, 0, c.width, c.height);
      cb(c.toDataURL('image/jpeg', .85));
    };
    im.onerror = () => toast('Impossible de lire cette image.');
    im.src = fr.result;
  };
  fr.readAsDataURL(file);
}

function wizBind() {
  const w = $('#wiz');
  $$('[data-k]', w).forEach(el => {
    el.addEventListener(el.type === 'checkbox' || el.tagName === 'SELECT' ? 'change' : 'input', () => {
      state.draft[el.dataset.k] = el.type === 'checkbox' ? el.checked : el.value;
      el.closest('.field')?.classList.remove('bad');
    });
  });
  $$('[data-unit]', w).forEach(b => b.addEventListener('click', () => {
    state.draft.unit = b.dataset.unit;
    $$('[data-unit]', w).forEach(x => x.classList.toggle('on', x === b));
  }));
  const drop = $('#drop', w), file = $('#file', w);
  if (drop) {
    const pick = f => readImage(f, url => { state.draft.img = url; wizRender(); });
    drop.onclick = () => file.click();
    drop.onkeydown = e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); file.click(); } };
    drop.ondragover = e => { e.preventDefault(); drop.classList.add('over'); };
    drop.ondragleave = () => drop.classList.remove('over');
    drop.ondrop = e => { e.preventDefault(); drop.classList.remove('over'); pick(e.dataTransfer.files[0]); };
    file.onchange = () => pick(file.files[0]);
  }
  const gadd = $('#gadd', w), gfile = $('#gfile', w);
  if (gfile) {
    if (gadd) gadd.onclick = () => gfile.click();
    gfile.onchange = () => [...gfile.files].slice(0, 4 - state.draft.gallery.length).forEach(f => readImage(f, url => { if (state.draft.gallery.length < 4) { state.draft.gallery.push(url); wizRender(); } }));
    $$('[data-rm]', w).forEach(b => b.onclick = () => { state.draft.gallery.splice(+b.dataset.rm, 1); wizRender(); });
  }
}

function validate(s) {
  const d = state.draft, bad = [];
  if (s === 1) {
    if (d.name.trim().length < 3) bad.push('name');
    if (d.desc.trim().length < 10) bad.push('desc');
    if (!d.cat) bad.push('cat');
    if (!d.img) bad.push('img');
  }
  if (s === 2) {
    if (!(parseFloat(d.price) > 0)) bad.push('price');
    if (!(parseInt(d.days, 10) > 0)) bad.push('days');
  }
  if (s === 3 && d.video.trim() && !/^https?:\/\/\S+\.\S+/.test(d.video.trim())) bad.push('video');
  $$('#wiz .field').forEach(f => f.classList.toggle('bad', bad.includes(f.dataset.f)));
  if (bad.length) $(`#wiz .field[data-f="${bad[0]}"]`)?.scrollIntoView({block: 'center', behavior: 'smooth'});
  return !bad.length;
}

function publish() {
  const d = state.draft;
  state.products.unshift({id: Date.now(), name: d.name.trim(), desc: d.desc.trim(), cat: d.cat, price: parseFloat(d.price), days: parseInt(d.days, 10),
    unit: d.unit, img: d.img, gallery: d.gallery, video: d.video.trim(), status: d.publish ? 'Publié' : 'Brouillon'});
  const msg = d.publish ? 'Produit publié avec succès' : 'Brouillon enregistré';
  state.draft = null; state.step = 1;
  toast(msg);
  location.hash = '#/produits';
}

/* ----- Paiements ----- */
const mIcon = m => `<span class="mi" style="background:${m.bg};color:${m.fg}">${m.txt ? `<b>${m.txt}</b>` : ico(m.ico)}</span>`;

VIEWS.paiements = () => {
  const list = state.txAll ? state.tx : state.tx.slice(0, 6);
  return `
  <div class="page-h"><div><h1>Paiements</h1><p>Gérez votre solde et vos transactions</p></div></div>
  <div class="pay-grid">
    <div class="stack">
      <div class="card" style="padding:14px"><div class="bal"><span class="stat-ico">${ico('wallet')}</span><div><small>Solde du compte</small><b>${money(state.balance)}</b></div><button class="btn btn-amber sm" data-act="recharge">Recharger</button></div></div>
      <div class="card"><h3 class="sec">Méthodes de paiement</h3>
        ${METHODS.map(m => `<button class="row" data-act="recharge" data-m="${m.id}">${mIcon(m)}<span class="t"><b>${m.name}</b><small>${m.sub}</small></span>${ico('right')}</button>`).join('')}</div>
    </div>
    <div class="card"><div class="card-h"><h2>Historique des transactions</h2>${state.tx.length > 6 ? `<a class="link" href="#/paiements" data-act="tx-all">${state.txAll ? 'Réduire' : 'Voir tout'}</a>` : ''}</div>
      <div style="height:8px"></div>
      ${list.map(t => `<a class="row" href="#/paiements/${t.id}"><span class="mi" style="background:${t.amount > 0 ? 'var(--green-l)' : 'var(--red-l)'};color:${t.amount > 0 ? 'var(--green)' : 'var(--red)'}">${ico(t.type === 'recharge' ? 'wallet' : 'bag')}</span>
        <span class="t"><b>${esc(t.title)}</b><small>${fmtDate(t.date)} • ${esc(t.via)}</small></span><span class="amt ${t.amount > 0 ? 'pos' : 'neg'}">${t.amount > 0 ? '+' : '−'} ${money(Math.abs(t.amount))}</span></a>`).join('')}
    </div>
  </div>`;
};

VIEWS['paiements/detail'] = id => {
  const t = state.tx.find(x => x.id === id);
  if (!t) return notFound();
  const rec = t.type === 'recharge';
  return `
  <a class="back" href="#/paiements">${ico('left')}Paiements</a>
  <div class="page-h"><div><h1>Détails du paiement</h1></div></div>
  <div class="card success"><div class="ok-ring">${ico('check')}</div>
    <h2>Paiement réussi !</h2><p>${rec ? 'Votre compte a été rechargé.' : 'Votre commande a été confirmée.'}</p>
    <div class="ok-amt">${money(Math.abs(t.amount))}</div><div class="ok-ref">Référence : ${esc(t.ref)}</div>
    <div class="ok-date">${fmtDate(t.date)} • ${fmtTime(t.date)}</div>
    <a class="btn btn-primary btn-block" href="#/${rec ? 'paiements' : 'commandes'}">${rec ? 'Retour aux paiements' : 'Voir ma commande'}</a></div>`;
};

function openRecharge(pre = 'card') {
  openModal(`<div class="m-h"><h3>Recharger mon compte</h3><button class="x" data-act="modal-close" aria-label="Fermer">${ico('x')}</button></div>
    <div class="field" data-f="amt"><label>Montant ($)</label><input class="in" id="amt" type="number" min="1" step="1" inputmode="decimal" placeholder="Ex. 50"><span class="errmsg">Saisissez un montant supérieur à 0.</span>
      <div class="chips mt">${[10, 25, 50, 100].map(v => `<button type="button" class="chip" data-amt="${v}">${v} $</button>`).join('')}</div></div>
    <div class="field"><label>Méthode de paiement</label><div class="mlist">${METHODS.map(m => `<label class="mopt"><input type="radio" name="meth" value="${m.id}" ${m.id === pre ? 'checked' : ''}>${mIcon(m)}<span><b>${m.name}</b><small>${m.sub}</small></span></label>`).join('')}</div></div>
    <button class="btn btn-amber btn-block" data-act="recharge-ok">Confirmer le rechargement</button>`);
  setTimeout(() => $('#amt')?.focus(), 50);
}

/* ----- Profil ----- */
VIEWS.profil = () => {
  const u = state.user, full = `${u.first} ${u.last}`;
  const item = (act, i, label) => `<button class="row" data-act="${act}">${ico(i, 'lead')}<span class="t"><b>${label}</b></span>${ico('right')}</button>`;
  return `
  <div class="page-h"><div><h1>Mon profil</h1></div></div>
  <div class="card prof"><div class="prof-top"><div class="prof-av">${avatar(full, 84)}<button class="prof-edit" data-act="edit-profile" aria-label="Modifier le profil">${ico('edit')}</button></div>
    <h2>${esc(full)}</h2><small>${esc(u.email)}</small></div>
    ${item('edit-profile', 'user', 'Informations personnelles')}${item('security', 'lock', 'Sécurité')}${item('notifs', 'bell', 'Notifications')}${item('prefs', 'sliders', 'Préférences')}
    <button class="row danger" data-act="logout">${ico('logout')}<span class="t"><b>Se déconnecter</b></span></button></div>`;
};

function notFound() { return `<div class="card empty-big">${ico('search')}<h3>Page introuvable</h3><p>Cette page n’existe pas.</p><a class="btn btn-primary" href="#/dashboard" style="margin-top:10px">Retour au tableau de bord</a></div>`; }

/* =========================================================
   Routeur
   ========================================================= */
function parse() {
  const h = location.hash.replace(/^#\/?/, '').replace(/\/$/, '') || 'dashboard';
  const parts = h.split('/');
  if (parts[0] === 'paiements' && parts[1]) return {key: 'paiements/detail', nav: 'paiements', arg: parts[1]};
  return {key: VIEWS[h] ? h : null, nav: parts[0], arg: null};
}
const SEARCHABLE = ['dashboard', 'produits', 'commandes', 'clients'];

function render(soft) {
  const r = parse();
  if (!soft) { state.query = ''; $('#q').value = ''; }
  $('#view').innerHTML = r.key ? VIEWS[r.key](r.arg) : notFound();
  (MOUNT[r.key] || noop)(r.arg);
  $$('.nav a, .bnav a').forEach(a => a.classList.toggle('active', a.dataset.nav === r.nav));
  document.title = `${TITLES[r.nav] || 'MonBusiness'} — MonBusiness`;
  if (!soft) { window.scrollTo(0, 0); closeMenu(); closeModal(); }
}

function renderUser() {
  const u = state.user, full = `${u.first} ${u.last}`;
  $('#user').innerHTML = `${avatar(full, 40)}<span class="meta"><b>${esc(full)}</b><small>${esc(u.role)}</small></span>${ico('down', 'chev')}`;
}

/* =========================================================
   Actions (délégation d'événements)
   ========================================================= */
const actions = {
  'menu':        () => document.body.classList.toggle('menu-open'),
  'menu-close':  closeMenu,
  'modal-close': closeModal,
  'offers':      () => { closeMenu(); toast('Les offres Pro arrivent bientôt.'); },
  'recharge':    t => openRecharge(t.dataset.m || 'card'),
  'recharge-ok': () => {
    const input = $('#amt'), v = parseFloat(input.value);
    if (!(v > 0)) { input.closest('.field').classList.add('bad'); input.focus(); return; }
    const m = METHODS.find(x => x.id === $('input[name=meth]:checked').value);
    const id = 't' + Date.now();
    // Simulation : à remplacer par l'appel à votre passerelle de paiement (Stripe, Flutterwave, Mobile Money…)
    state.balance += v;
    state.tx.unshift({id, type: 'recharge', title: 'Rechargement compte', amount: v, date: new Date(), via: m.via, ref: '#R' + (2000 + state.tx.length + 1)});
    closeModal();
    location.hash = '#/paiements/' + id;
  },
  'tx-all':      (t, e) => { e.preventDefault(); state.txAll = !state.txAll; render(true); },
  'del-product': t => {
    const p = state.products.find(x => String(x.id) === t.dataset.id);
    if (!p) return;
    openModal(`<div class="m-h"><h3>Supprimer ce produit ?</h3><button class="x" data-act="modal-close" aria-label="Fermer">${ico('x')}</button></div>
      <p style="color:var(--muted);margin-bottom:18px">« ${esc(p.name)} » sera retiré de votre catalogue.</p>
      <div class="wiz-actions"><button class="btn btn-ghost" data-act="modal-close">Annuler</button><button class="btn btn-primary" style="background:var(--red);box-shadow:none" data-act="del-ok" data-id="${p.id}">Supprimer</button></div>`);
  },
  'del-ok':      t => { state.products = state.products.filter(x => String(x.id) !== t.dataset.id); closeModal(); render(true); toast('Produit supprimé'); },
  'wiz-next':    () => { if (!validate(state.step)) return; if (state.step < 4) { state.step++; wizRender(); window.scrollTo(0, 0); } else publish(); },
  'wiz-back':    () => { state.step = Math.max(1, state.step - 1); wizRender(); window.scrollTo(0, 0); },
  'bell':        () => {
    const items = [
      ['bag', 'Nouvelle commande', 'Amani K. a commandé « Vidéo promotionnelle ».', '#e3edff', '#2563eb'],
      ['wallet', 'Paiement reçu', 'Sarah B. a réglé 200,00 $ pour « Site vitrine ».', 'var(--green-l)', 'var(--green)'],
      ['bell', 'Commande en attente', 'Moussa D. n’a pas encore finalisé son paiement.', '#fdecc8', '#d98a14']
    ];
    openModal(`<div class="m-h"><h3>Notifications</h3><button class="x" data-act="modal-close" aria-label="Fermer">${ico('x')}</button></div>` +
      items.map(n => `<div class="notif"><span class="mi" style="background:${n[3]};color:${n[4]}">${ico(n[0])}</span><span><b>${n[1]}</b><small>${n[2]}</small></span></div>`).join(''));
    state.notifs = 0; $('#badge').style.display = 'none';
  },
  'edit-profile': () => {
    const u = state.user;
    openModal(`<div class="m-h"><h3>Informations personnelles</h3><button class="x" data-act="modal-close" aria-label="Fermer">${ico('x')}</button></div>
      <div class="field" data-f="first"><label>Prénom</label><input class="in" id="pf" value="${esc(u.first)}"><span class="errmsg">Le prénom est requis.</span></div>
      <div class="field"><label>Nom</label><input class="in" id="pl" value="${esc(u.last)}"></div>
      <div class="field" data-f="email"><label>E-mail</label><input class="in" id="pe" type="email" value="${esc(u.email)}"><span class="errmsg">Saisissez une adresse e-mail valide.</span></div>
      <button class="btn btn-primary btn-block" data-act="save-profile">Enregistrer</button>`);
  },
  'save-profile': () => {
    const f = $('#pf').value.trim(), l = $('#pl').value.trim(), e = $('#pe').value.trim();
    const okF = !!f, okE = /^\S+@\S+\.\S+$/.test(e);
    $('#pf').closest('.field').classList.toggle('bad', !okF);
    $('#pe').closest('.field').classList.toggle('bad', !okE);
    if (!okF || !okE) return;
    Object.assign(state.user, {first: f, last: l, email: e});
    closeModal(); renderUser(); render(true); toast('Profil mis à jour');
  },
  'security':    () => toast('Paramètres de sécurité : bientôt disponibles.'),
  'notifs':      () => toast('Préférences de notifications : bientôt disponibles.'),
  'prefs':       () => toast('Préférences : bientôt disponibles.'),
  'logout':      () => toast('Déconnexion simulée (démo).')
};

document.addEventListener('click', e => {
  if (e.target.classList.contains('modal-bg')) { closeModal(); return; }
  const chip = e.target.closest('[data-amt]');
  if (chip) { $('#amt').value = chip.dataset.amt; $('#amt').closest('.field').classList.remove('bad'); return; }
  const a = e.target.closest('[data-act]');
  if (a && actions[a.dataset.act]) { actions[a.dataset.act](a, e); return; }
  const go = e.target.closest('[data-go]');
  if (go) location.hash = '#/' + go.dataset.go;
});
document.addEventListener('change', e => {
  if (e.target.id === 'period') { state.period = +e.target.value; drawChart(); }
  if (e.target.id === 'fstatus') { state.fStatus = e.target.value; render(true); }
});
$('#q').addEventListener('input', e => {
  state.query = e.target.value;
  if (SEARCHABLE.includes(parse().key)) render(true);
});
document.addEventListener('keydown', e => { if (e.key === 'Escape') { closeModal(); closeMenu(); } });
window.addEventListener('hashchange', () => render());
let rz; window.addEventListener('resize', () => { cancelAnimationFrame(rz); rz = requestAnimationFrame(drawChart); });

/* =========================================================
   Démarrage
   ========================================================= */
renderUser();
render();
})();
