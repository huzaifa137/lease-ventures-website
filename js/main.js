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

  // hero video — two clips that crossfade into each other forever; loads only when it is safe to
  var hv = $('#heroVideo'), hv2 = $('#heroVideo2'), ht = $('#heroToggle');
  if (hv) {
    var clips = hv2 ? [hv, hv2] : [hv];
    var FADE = 1000; // ms — keep in sync with the opacity transition in css/style.css (.hero-video)
    var conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var saveData = conn && (conn.saveData || /(^|-)2g$/.test(conn.effectiveType || ''));
    var userPaused = false, inView = true, started = false, cur = 0, switching = false;

    var setToggle = function (playing) {
      if (!ht) return;
      ht.innerHTML = '<i class="fa-solid ' + (playing ? 'fa-pause' : 'fa-play') + '"></i>';
      ht.setAttribute('aria-label', playing ? 'Pause background video' : 'Play background video');
    };
    var safePlay = function (v) {
      var p = v.play();
      if (p && p.catch) p.catch(function () { /* autoplay blocked (e.g. low-power mode): poster stays */ });
    };
    var sync = function () {
      if (!started) return;
      if (!userPaused && inView && !document.hidden) safePlay(clips[cur]);
      else clips.forEach(function (v) { v.pause(); });
    };

    // fade the first clip in only once frames are really being shown (no black flash)
    hv.addEventListener('playing', function () {
      hv.classList.add('is-playing');
      if (ht) { ht.hidden = false; setToggle(true); }
    });

    // crossfade to the other clip when the current one is about to end
    var goNext = function () {
      var to = (cur + 1) % clips.length, from = clips[cur], next = clips[to];
      switching = true;
      next.currentTime = 0;
      safePlay(next);
      if (to === 1) next.classList.add('is-playing');           // 2nd clip sits above: fade it in
      else clips[1].classList.remove('is-playing');             // back to the 1st: fade the 2nd out
      cur = to;
      setTimeout(function () {                                   // after the fade, stop the hidden clip
        from.pause();
        try { from.currentTime = 0; } catch (e) { }
        switching = false;
        sync();
      }, FADE + 50);
    };
    var onTime = function () {
      var v = clips[cur];
      if (switching || !v.duration || userPaused) return;
      if (v.duration - v.currentTime > FADE / 1000 + 0.3) return;
      var next = clips[(cur + 1) % clips.length];
      if (next !== v && next.readyState >= 3) goNext(); // not buffered yet? keep looping this clip and retry
    };
    clips.forEach(function (v) { v.addEventListener('timeupdate', function () { if (v === clips[cur]) onTime(); }); });

    if (!reduceMotion && !saveData) {
      var start = function () {
        if (started) return;
        started = true; hv.load(); sync();
        // fetch the second clip only after the first is on screen, so the two never compete
        if (hv2) hv.addEventListener('playing', function once() {
          hv.removeEventListener('playing', once);
          setTimeout(function () { hv2.preload = 'auto'; hv2.load(); }, 800);
        });
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
      var move = function (t) { clips.forEach(function (v) { v.style.transform = t; }); };
      heroEl.addEventListener('mousemove', function (e) {
        var r = heroEl.getBoundingClientRect();
        tx = ((e.clientX - r.left) / r.width - .5) * -16;
        ty = ((e.clientY - r.top) / r.height - .5) * -10;
        if (!raf) raf = requestAnimationFrame(function () {
          raf = 0;
          move('translate3d(' + tx.toFixed(1) + 'px,' + ty.toFixed(1) + 'px,0) scale(1.04)');
        });
      }, { passive: true });
      heroEl.addEventListener('mouseleave', function () { move(''); });
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
