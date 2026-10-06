/* Alpha Padel · maqueta de venta · comportamientos propios (medidos en Aleric, escritos desde cero) */
(function () {
  'use strict';
  var d = document, w = window, h = d.documentElement;
  h.classList.add('js');
  var $ = function (s, r) { return (r || d).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || d).querySelectorAll(s)); };
  var reduce = w.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fino = w.matchMedia('(min-width:1024px) and (hover:hover)').matches;

  /* aparición al entrar */
  var io = 'IntersectionObserver' in w ? new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('on'); io.unobserve(e.target); } });
  }, { threshold: .12, rootMargin: '0px 0px -6% 0px' }) : null;
  $$('.rev').forEach(function (e) { io ? io.observe(e) : e.classList.add('on'); });

  /* cabecera que baja de 80 a 68 */
  var cab = $('.cab');
  /* menú lateral móvil */
  var panel = $('.panel'), mb = $('.menu-b');
  function menu(a) {
    panel.classList.toggle('abierto', a);
    mb.setAttribute('aria-expanded', a);
    if (a) { $('.cerrar', panel).focus(); } else { mb.focus(); }
  }
  if (mb && panel) {
    mb.addEventListener('click', function () { menu(true); });
    $('.cerrar', panel).addEventListener('click', function () { menu(false); });
    d.addEventListener('keydown', function (e) { if (e.key === 'Escape' && panel.classList.contains('abierto')) menu(false); });
    $$('a', panel).forEach(function (a) { a.addEventListener('click', function () { menu(false); }); });
  }

  /* barra fija móvil: aparece pasada la portada, se esconde sobre el pie */
  var barra = $('.barra'), portada = $('.portada,.port-i'), pie = $('.pie');

  /* banda que crece / pie que avanza */
  var bandas = $$('.banda'), pa = $('.pie-a img');
  function clamp(v) { return Math.max(0, Math.min(1, v)); }
  var vh = w.innerHeight;
  function scroll() {
    var y = w.scrollY || 0;
    if (cab) cab.classList.toggle('baja', y > 40);
    if (barra && portada) {
      var fin = portada.offsetTop + portada.offsetHeight - 80;
      var sobrePie = pie ? pie.getBoundingClientRect().top < vh - 120 : false;
      barra.classList.toggle('vis', y > fin && !sobrePie);
    }
    if (!reduce) {
      bandas.forEach(function (b) {
        var r = b.getBoundingClientRect();
        var p = clamp((vh - r.top) / (vh + r.height * .3));
        var f = b.querySelector('.foto'); if (f) f.style.setProperty('--g', (0.82 + 0.18 * clamp(p * 1.5)).toFixed(3));
      });
      if (pa) {
        var rp = pa.parentNode.getBoundingClientRect();
        var q = clamp((vh - rp.top) / (vh * .9));
        var max = Math.max(0, pa.parentNode.clientWidth - pa.clientWidth - 2 * 24);
        pa.style.setProperty('--pa', Math.round(q * max * .85) + 'px');
      }
      var py = Math.min(y, vh * 1.2);
      $$('.tira .foto').forEach(function (f, i) { f.style.setProperty('--py', (-py * (0.05 + i * 0.05)).toFixed(1) + 'px'); });
      var pf = $('.port-i > .cont > .foto'); if (pf) pf.style.setProperty('--py', (-py * 0.08).toFixed(1) + 'px');
      if (pie) { var rr = pie.getBoundingClientRect(); pie.style.setProperty('--pt', Math.round(clamp((vh - rr.top) / vh) * 160) + 'px'); }
      enciende();
      pozoScroll();
    }
  }
  /* entradilla que se enciende palabra a palabra (solo ordenador) */
  var enc = $$('[data-enciende]');
  if (enc.length && fino) {
    enc.forEach(function (e) {
      e.innerHTML = e.textContent.trim().split(/\s+/).map(function (t) { return '<span class="w">' + t + '</span>'; }).join(' ');
    });
  }
  function enciende() {
    if (!fino) return;
    enc.forEach(function (e) {
      var r = e.getBoundingClientRect(), p = clamp((vh * 0.85 - r.top) / (vh * 0.45)), ws = $$('.w', e), n = Math.round(p * ws.length);
      ws.forEach(function (w, i) { w.classList.toggle('on', i < n); });
    });
  }
  var tick = false;
  w.addEventListener('scroll', function () { if (!tick) { tick = true; requestAnimationFrame(function () { tick = false; scroll(); }); } }, { passive: true });
  w.addEventListener('resize', function () { vh = w.innerHeight; scroll(); });

  /* contadores */
  function cuenta(e) {
    var fin = +e.getAttribute('data-n'); if (reduce) { e.textContent = fin; return; }
    var t0 = null, dur = 1400;
    function paso(t) { if (!t0) t0 = t; var p = clamp((t - t0) / dur); e.textContent = Math.round(fin * (1 - Math.pow(1 - p, 3))); if (p < 1) requestAnimationFrame(paso); }
    requestAnimationFrame(paso);
  }
  if (io) {
    var ioc = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { cuenta(e.target); ioc.unobserve(e.target); } }); }, { threshold: .6 });
    $$('[data-n]').forEach(function (e) { e.textContent = '0'; ioc.observe(e); });
    /* marcas que se dibujan */
    var iom = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('on'); iom.unobserve(e.target); } }); }, { threshold: .4 });
    $$('.marcas').forEach(function (e) { iom.observe(e); });
  }

  /* cinta con pausa */
  $$('.cinta').forEach(function (c) {
    var b = $('.pausa-b', c); if (!b) return;
    b.addEventListener('click', function () { var p = c.classList.toggle('pausa'); b.setAttribute('aria-pressed', p); b.textContent = p ? 'Seguir' : 'Pausa'; b.setAttribute('aria-label', p ? 'Seguir: reanudar la cinta' : 'Pausa: detener la cinta'); });
  });

  /* B/N → color al pasar por pantalla (solo con JS) */
  var iob = new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) { setTimeout(function () { e.target.classList.add('on'); }, 250); iob.unobserve(e.target); } });
  }, { threshold: .55 });
  $$('.foto-bn').forEach(function (e) { iob.observe(e); });

  /* estado abierto/cerrado a hora de Madrid (horario de la ficha: L-V 10-24, S-D 9-23) */
  var est = $$('.estado');
  if (est.length) {
    var p = new Intl.DateTimeFormat('es-ES', { timeZone: 'Europe/Madrid', weekday: 'short', hour: 'numeric', minute: 'numeric', hour12: false }).formatToParts(new Date());
    var g = {}; p.forEach(function (x) { g[x.type] = x.value; });
    var fs = /^(s|d)/i.test(g.weekday), hh = (+g.hour % 24) + (+g.minute) / 60;
    var ab = fs ? (hh >= 9 && hh < 23) : (hh >= 10 && hh < 24);
    est.forEach(function (e) {
      var l = $('.est-l', e), pr = $('.par', e); if (!l) return;
      $('.t', l).textContent = ab ? 'Abierto ahora' : 'Cerrado ahora';
      pr.classList.toggle('cerr', !ab);
    });
  }

  /* carruseles: flechas, contador y arrastre */
  $$('[data-carr]').forEach(function (c) {
    var pista = $('.carr', c), n = $('.cont-n', c), items = pista ? pista.children : [];
    if (!pista) return;
    function paso() { var a = items[1] ? items[1].offsetLeft - items[0].offsetLeft : 400; return a || 400; }
    function act() { var i = Math.round(pista.scrollLeft / paso()) + 1; if (n) n.textContent = ('0' + Math.min(i, items.length)).slice(-2) + ' / ' + ('0' + items.length).slice(-2); }
    $$('[data-dir]', c).forEach(function (b) { b.addEventListener('click', function () { pista.scrollBy({ left: +b.getAttribute('data-dir') * paso(), behavior: reduce ? 'auto' : 'smooth' }); }); });
    pista.addEventListener('scroll', act, { passive: true }); act();
    var dn = false, x0 = 0, s0 = 0;
    pista.addEventListener('pointerdown', function (e) { if (e.pointerType !== 'mouse') return; dn = true; x0 = e.clientX; s0 = pista.scrollLeft; pista.style.scrollSnapType = 'none'; pista.style.cursor = 'grabbing'; });
    w.addEventListener('pointermove', function (e) { if (dn) pista.scrollLeft = s0 - (e.clientX - x0); });
    w.addEventListener('pointerup', function () { if (dn) { dn = false; pista.style.scrollSnapType = ''; pista.style.cursor = ''; } });
    /* foto centrada a color */
    var ioi = new IntersectionObserver(function (es) { es.forEach(function (e) { e.target.classList.toggle('on', e.isIntersecting); }); }, { root: pista, threshold: .7 });
    $$('.foto-bn', pista).forEach(function (f) { ioi.observe(f); });
  });

  /* ===== el pozo que sube y baja ===== */
  var pozo = $('.pozo');
  var fichaT, filas = [], estado = { fila: 3, partido: 0, b: 0, boc: false, paso: 0, fin: false };
  var lenta = null, timers = [];
  function pintar() {
    if (!pozo) return;
    var f = $('.ficha', pozo); f.style.setProperty('--fila', estado.fila);
    $$('.fil-p', pozo).forEach(function (r, i) { r.classList.toggle('act', i === estado.fila); });
    $$('.ind i', pozo).forEach(function (m, i) { m.classList.toggle('l', i < estado.partido); });
    var pt = $('.ind .t', pozo); if (pt) pt.textContent = 'Partido ' + Math.max(1, estado.partido) + ' de 6';
    $('.barra15 i', pozo).style.setProperty('--b', estado.b);
    $('.boc', pozo).classList.toggle('on', estado.boc);
    $$('.paso', pozo).forEach(function (p, i) { p.classList.toggle('act', i === estado.paso); });
    pozo.classList.toggle('fin', estado.fin);
    var et = $('.ficha-et', pozo); if (et) et.style.opacity = estado.paso === 0 ? 1 : 0;
  }
  function fijar(e) { for (var k in e) estado[k] = e[k]; pintar(); }
  /* guion: 0-25 % filas entran y ficha en la 4; 25-50 barra + bocina; 50-75 gana; 75-100 pierde */
  function porProgreso(p) {
    if (p < .25) fijar({ fila: 3, partido: 0, b: 0, boc: false, paso: 0, fin: false });
    else if (p < .5) { var b = clamp((p - .25) / .2); fijar({ fila: 3, partido: 1, b: b, boc: p > .46, paso: 1, fin: false }); }
    else if (p < .75) fijar({ fila: 2, partido: 1, b: 1, boc: false, paso: 2, fin: false, ganas: true });
    else if (p < .98) fijar({ fila: 4, partido: Math.min(6, 1 + Math.floor((p - .75) / .25 * 6)), b: 1, boc: false, paso: 2, fin: false });
    else fijar({ fila: 3, partido: 6, b: 1, boc: false, paso: 2, fin: true });
  }
  function pozoScroll() {
    if (!pozo || !pozo.classList.contains('clav') || !fino) return;
    var r = pozo.getBoundingClientRect(), tot = pozo.offsetHeight - vh;
    var p = clamp(-r.top / tot);
    porProgreso(p);
  }
  function parar() { timers.forEach(clearTimeout); timers = []; }
  function t(ms, fn) { timers.push(setTimeout(fn, ms)); }
  function guion(res) {
    parar();
    var ms = reduce ? 0 : 1;
    fijar({ fila: 3, partido: 1, b: 0, boc: false, paso: 0, fin: false });
    var T = reduce ? 0 : 1;
    t(T * 1200, function () { fijar({ paso: 1, b: 1 }); });
    t(T * 2600, function () { fijar({ boc: true }); });
    t(T * 3400, function () { fijar({ boc: false, paso: 2, fila: res === 'gano' ? 2 : 4 }); });
    t(T * 5200, function () { fijar({ fin: true, partido: 6 }); });
  }
  if (pozo) {
    var clav = pozo.classList.contains('clav') && fino;
    if (!clav) pozo.classList.remove('clav');
    pintar();
    if (clav) {
      porProgreso(0);
      $$('[data-res]', pozo).forEach(function (b) {
        b.addEventListener('click', function () {
          $$('[data-res]', pozo).forEach(function (x) { x.setAttribute('aria-pressed', x === b); });
          var tot = pozo.offsetHeight - vh, top = pozo.getBoundingClientRect().top + (w.scrollY || 0);
          w.scrollTo({ top: top + tot * (b.getAttribute('data-res') === 'gano' ? .62 : .88), behavior: reduce ? 'auto' : 'smooth' });
        });
      });
    }
    else {
      var iop = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { guion('gano'); iop.unobserve(e.target); } }); }, { threshold: .5 });
      iop.observe($('.esc', pozo));
      $$('[data-res]', pozo).forEach(function (b) {
        b.addEventListener('click', function () {
          $$('[data-res]', pozo).forEach(function (x) { x.setAttribute('aria-pressed', x === b); });
          if (b.getAttribute('data-res') === 'otra') guion('gano'); else guion(b.getAttribute('data-res'));
        });
      });
    }
  }
  /* tira corta de la home */
  var tira = $('.tira-pozo');
  if (tira && io) {
    var iot = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('on'); iot.unobserve(e.target); } }); }, { threshold: .5 });
    iot.observe(tira);
  }

  /* mapa con pátina azul: se revela al llegar al centro de la pantalla, al pasar el ratón o al hacer clic */
  var mapas = $$('[data-velo]');
  mapas.forEach(function (m) {
    m.addEventListener('click', function (ev) { if (ev.target.closest('a')) return; m.classList.add('act'); });
    m.addEventListener('mouseleave', function () { m.classList.remove('act'); });
  });
  function velos() {
    mapas.forEach(function (m) {
      var r = m.getBoundingClientRect();
      var d = Math.abs((r.top + r.height / 2) - vh / 2) / (vh / 2);
      m.style.setProperty('--rv-s', clamp((0.75 - d) / 0.4).toFixed(3));
    });
  }
  if (mapas.length) {
    w.addEventListener('scroll', function () { requestAnimationFrame(velos); }, { passive: true });
    w.addEventListener('resize', velos);
    velos();
  }

  scroll();
})();
