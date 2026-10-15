/* Lease Ventures — site scripts. Theme: light by default, choice remembered. */
(function () {
  var KEY = 'lv-theme', root = document.documentElement;
  function apply(t) { root.setAttribute('data-theme', t === 'dark' ? 'dark' : 'light'); }
  function saved() { try { return localStorage.getItem(KEY); } catch (e) { return null; } }
  apply(saved());
  window.addEventListener('storage', function (e) { if (e.key === KEY) apply(e.newValue); });

  document.addEventListener('DOMContentLoaded', function () {
    var $ = function (s, c) { return (c || document).querySelector(s); };
    var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

    /* theme toggle */
    var tg = $('#themeToggle');
    function sync() {
      var d = root.getAttribute('data-theme') === 'dark';
      tg.setAttribute('aria-pressed', d); tg.setAttribute('aria-label', d ? 'Switch to light mode' : 'Switch to dark mode'); tg.title = tg.getAttribute('aria-label');
    }
    if (tg) { sync(); tg.addEventListener('click', function () {
      var n = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      apply(n); try { localStorage.setItem(KEY, n); } catch (e) {} sync();
    }); }

    /* navbar */
    var nav = $('#nav'), links = $('#navLinks'), burger = $('#burger');
    function onScroll() { nav.classList.toggle('scrolled', window.scrollY > 10); }
    onScroll(); window.addEventListener('scroll', onScroll, { passive: true });
    burger.addEventListener('click', function () {
      var o = links.classList.toggle('open'); burger.classList.toggle('open', o); burger.setAttribute('aria-expanded', o);
    });
    $$('.has-dd > button').forEach(function (b) {
      b.addEventListener('click', function (e) {
        var li = b.parentNode, open = !li.classList.contains('open');
        $$('.has-dd.open').forEach(function (x) { x.classList.remove('open'); x.firstElementChild.setAttribute('aria-expanded', 'false'); });
        li.classList.toggle('open', open); b.setAttribute('aria-expanded', open); e.stopPropagation();
      });
    });
    document.addEventListener('click', function (e) { if (!e.target.closest('.has-dd')) $$('.has-dd.open').forEach(function (x) { x.classList.remove('open'); }); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') $$('.has-dd.open').forEach(function (x) { x.classList.remove('open'); }); });
    $$('.nav-links a').forEach(function (a) { a.addEventListener('click', function () { links.classList.remove('open'); burger.classList.remove('open'); }); });

    /* scroll reveal */
    var rv = $$('.reveal');
    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (es) { es.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('visible'); io.unobserve(en.target); } }); }, { threshold: .12 });
      rv.forEach(function (el) { io.observe(el); });
    } else rv.forEach(function (el) { el.classList.add('visible'); });

    /* product filters */
    $$('.filters').forEach(function (f) {
      var items = $$('.product[data-cat]');
      $$('.filter-btn', f).forEach(function (b) { b.addEventListener('click', function () {
        $$('.filter-btn', f).forEach(function (x) { x.classList.remove('active'); }); b.classList.add('active');
        var c = b.getAttribute('data-filter');
        items.forEach(function (it) { it.classList.toggle('hide', c !== 'all' && it.getAttribute('data-cat') !== c); });
      }); });
    });

    /* contact form -> WhatsApp or email */
    var form = $('#contactForm');
    if (form) {
      var q = new URLSearchParams(location.search).get('interest');
      if (q) {
        var sel = form.elements.interest, found = false;
        for (var i = 0; i < sel.options.length; i++) if (sel.options[i].text === q) { sel.selectedIndex = i; found = true; }
        if (!found) { sel.add(new Option(q, q, true, true)); }
      }
      function msg() {
        var f = form.elements;
        return 'Hello Lease Ventures, I would like to make an enquiry.\n\nName: ' + f.name.value + '\nPhone: ' + f.phone.value + (f.email.value ? '\nEmail: ' + f.email.value : '') + '\nInterested in: ' + f.interest.value + '\n\n' + f.message.value;
      }
      function ok() { if (!form.checkValidity()) { form.reportValidity(); return false; } return true; }
      $('#sendWa').addEventListener('click', function () { if (ok()) window.open('https://wa.me/256782140304?text=' + encodeURIComponent(msg()), '_blank', 'noopener'); });
      $('#sendMail').addEventListener('click', function () { if (ok()) location.href = 'mailto:info@leaseventures.co.ug?subject=' + encodeURIComponent('Enquiry: ' + form.elements.interest.value) + '&body=' + encodeURIComponent(msg()); });
      form.addEventListener('submit', function (e) { e.preventDefault(); });
    }
    var y = $('#year'); if (y) y.textContent = new Date().getFullYear();
  });
})();
