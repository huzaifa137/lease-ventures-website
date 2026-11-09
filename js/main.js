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

  // hero video — loads only when it is safe to, never blocks the page
  var hv = $('#heroVideo'), ht = $('#heroToggle');
  if (hv) {
    var conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var saveData = conn && (conn.saveData || /(^|-)2g$/.test(conn.effectiveType || ''));
    var userPaused = false, inView = true, started = false;

    var setToggle = function (playing) {
      if (!ht) return;
      ht.innerHTML = '<i class="fa-solid ' + (playing ? 'fa-pause' : 'fa-play') + '"></i>';
      ht.setAttribute('aria-label', playing ? 'Pause background video' : 'Play background video');
    };
    var play = function () {
      var p = hv.play();
      if (p && p.catch) p.catch(function () { /* autoplay blocked (e.g. low-power mode): poster stays */ });
    };
    var sync = function () {
      if (!started) return;
      if (!userPaused && inView && !document.hidden) play(); else hv.pause();
    };

    // fade the video in only once frames are really being shown (no black flash)
    hv.addEventListener('playing', function () {
      hv.classList.add('is-playing');
      if (ht) { ht.hidden = false; setToggle(true); }
    });

    if (!reduceMotion && !saveData) {
      var start = function () {
        if (started) return;
        started = true; hv.load(); sync();
      };
      // start after the page has loaded so the video never competes with CSS, fonts or images
      if (document.readyState === 'complete') start();
      else window.addEventListener('load', start);

      // pause when the hero is scrolled away or the tab is hidden: saves CPU, battery and data
      var hero = $('.hero');
      if ('IntersectionObserver' in window && hero) {
        new IntersectionObserver(function (es) {
          inView = es[0].isIntersecting; sync();
        }, { threshold: 0.05 }).observe(hero);
      }
      document.addEventListener('visibilitychange', sync);
    }

    if (ht) ht.addEventListener('click', function () {
      userPaused = !userPaused;
      setToggle(!userPaused);
      sync();
    });

    // subtle pointer parallax (desktop only, transform-only so it stays smooth)
    if (!reduceMotion && window.matchMedia && window.matchMedia('(hover: hover) and (min-width: 1025px)').matches) {
      var heroEl = $('.hero'), raf = 0, tx = 0, ty = 0;
      heroEl.addEventListener('mousemove', function (e) {
        var r = heroEl.getBoundingClientRect();
        tx = ((e.clientX - r.left) / r.width - .5) * -16;
        ty = ((e.clientY - r.top) / r.height - .5) * -10;
        if (!raf) raf = requestAnimationFrame(function () {
          raf = 0;
          hv.style.transform = 'translate3d(' + tx.toFixed(1) + 'px,' + ty.toFixed(1) + 'px,0) scale(1.04)';
        });
      }, { passive: true });
      heroEl.addEventListener('mouseleave', function () {
        hv.style.transform = '';
      });
    }
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
