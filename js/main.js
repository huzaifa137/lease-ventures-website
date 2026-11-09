/* Lease Ventures — site behaviour */
(function () {
  var WA = '256782140304';
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  // navbar shadow + back-to-top
  var nav = $('.nav'), top = $('.to-top');
  function onScroll() {
    var y = window.scrollY || 0;
    if (nav) nav.classList.toggle('scrolled', y > 30);
    if (top) top.classList.toggle('visible', y > 600);
  }
  window.addEventListener('scroll', onScroll, { passive: true }); onScroll();
  if (top) top.addEventListener('click', function () { window.scrollTo({ top: 0, behavior: 'smooth' }); });

  // mobile menu + accordions
  var ham = $('#hamburger'), mob = $('#mobileMenu');
  function setMenu(open) {
    mob.classList.toggle('open', open); ham.classList.toggle('open', open);
    ham.setAttribute('aria-expanded', open); document.body.style.overflow = open ? 'hidden' : '';
    if (nav && open) nav.classList.add('scrolled'); else onScroll();
  }
  if (ham && mob) {
    ham.addEventListener('click', function () { setMenu(!mob.classList.contains('open')); });
    $$('.m-toggle', mob).forEach(function (b) {
      b.addEventListener('click', function () { b.parentNode.classList.toggle('open'); });
    });
    $$('a', mob).forEach(function (a) { a.addEventListener('click', function () { setMenu(false); }); });
    window.addEventListener('resize', function () { if (window.innerWidth > 1024) setMenu(false); });
  }

  // reveal on scroll
  var items = $$('.reveal');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('visible'); io.unobserve(e.target); } });
    }, { threshold: .12 });
    items.forEach(function (el) { io.observe(el); });
  } else items.forEach(function (el) { el.classList.add('visible'); });

  // product filters
  $$('.tabs').forEach(function (tabs) {
    var scope = tabs.parentNode;
    $$('.tab', tabs).forEach(function (t) {
      t.addEventListener('click', function () {
        $$('.tab', tabs).forEach(function (x) { x.classList.remove('active'); });
        t.classList.add('active');
        var f = t.getAttribute('data-filter');
        $$('.product', scope).forEach(function (p) {
          p.classList.toggle('hide', f !== 'all' && p.getAttribute('data-cat') !== f);
        });
      });
    });
  });

  // quote form -> WhatsApp
  var form = $('#quoteForm');
  if (form) form.addEventListener('submit', function (e) {
    e.preventDefault();
    var v = function (n) { return (form.elements[n] && form.elements[n].value || '').trim(); };
    var msg = 'Hello Lease Ventures, I would like a quotation.\n\n' +
      'Name: ' + v('name') + '\n' +
      (v('company') ? 'Organisation: ' + v('company') + '\n' : '') +
      'Phone: ' + v('phone') + '\n' +
      'Interested in: ' + v('service') + '\n\n' + v('message');
    window.open('https://wa.me/' + WA + '?text=' + encodeURIComponent(msg), '_blank', 'noopener');
  });
})();
