/* Lease Ventures — light/dark theme (default: light, choice remembered). Loaded in <head> to avoid a flash. */
(function () {
  var KEY = 'lv-theme', root = document.documentElement;
  function apply(t) { root.setAttribute('data-theme', t === 'dark' ? 'dark' : 'light'); }
  function saved() { try { return localStorage.getItem(KEY); } catch (e) { return null; } }
  function save(t) { try { localStorage.setItem(KEY, t); } catch (e) {} }
  apply(saved());
  document.addEventListener('DOMContentLoaded', function () {
    var btn = document.getElementById('themeToggle');
    if (!btn) return;
    function sync() {
      var dark = root.getAttribute('data-theme') === 'dark';
      btn.setAttribute('aria-pressed', dark);
      btn.setAttribute('aria-label', dark ? 'Switch to light mode' : 'Switch to dark mode');
      btn.title = dark ? 'Switch to light mode' : 'Switch to dark mode';
    }
    sync();
    btn.addEventListener('click', function () {
      var next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      apply(next); save(next); sync();
    });
  });
  window.addEventListener('storage', function (e) { if (e.key === KEY) apply(e.newValue); });
})();
