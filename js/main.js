
(function () {
  const root = document.documentElement;
  const body = document.body;
  const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  const savedTheme = localStorage.getItem('ttepo1-theme');
  const savedScale = parseFloat(localStorage.getItem('ttepo1-font-scale') || '1');

  if (savedTheme) {
    body.setAttribute('data-theme', savedTheme);
  } else if (prefersDark) {
    body.setAttribute('data-theme', 'dark');
  } else {
    body.setAttribute('data-theme', 'light');
  }

  if (!isNaN(savedScale)) {
    root.style.setProperty('--font-scale', savedScale.toString());
  }

  function setTheme(next) {
    body.setAttribute('data-theme', next);
    localStorage.setItem('ttepo1-theme', next);
  }

  function adjustFont(delta) {
    const current = parseFloat(getComputedStyle(root).getPropertyValue('--font-scale')) || 1;
    const next = Math.min(1.4, Math.max(0.85, current + delta));
    root.style.setProperty('--font-scale', next.toString());
    localStorage.setItem('ttepo1-font-scale', String(next));
  }

  let speaking = false;
  function toggleTTS() {
    if (!('speechSynthesis' in window)) {
      alert('Tu navegador no soporta narración de texto.');
      return;
    }
    const synth = window.speechSynthesis;
    if (speaking) {
      synth.cancel();
      speaking = false;
      return;
    }
    const main = document.getElementById('main-content');
    if (!main) return;
    const text = main.innerText.trim();
    if (!text) return;
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = document.documentElement.lang || 'es-ES';
    utter.rate = 1;
    utter.onend = () => { speaking = false; };
    speaking = true;
    synth.speak(utter);
  }

  function toggleLang() {
    const current = document.documentElement.getAttribute('data-lang') || 'es';
    const next = current === 'es' ? 'en' : 'es';
    document.documentElement.setAttribute('data-lang', next);
    document.querySelectorAll('[data-lang]').forEach(el => {
      const elLang = el.getAttribute('data-lang');
      if (!elLang) return;
      el.classList.toggle('hidden', elLang !== next);
    });
  }

  function focusKpsi() {
    const panel = document.getElementById('kpsi-panel');
    if (panel) {
      panel.scrollIntoView({ behavior: 'smooth', block: 'center' });
      panel.classList.add('highlight-kpsi');
      setTimeout(() => panel.classList.remove('highlight-kpsi'), 800);
    }
  }

  function bindSearch() {
    const input = document.getElementById('searchInput');
    const btn = document.getElementById('searchBtn');
    const status = document.getElementById('searchStatus');
    if (!input || !btn) return;

    function doSearch() {
      if (!status) return;
      const term = input.value.trim().toLowerCase();
      if (!term) {
        status.textContent = 'Escribe una palabra clave para buscar.';
        return;
      }
      const main = document.getElementById('main-content');
      if (!main) return;
      const text = main.innerText.toLowerCase();
      const idx = text.indexOf(term);
      if (idx === -1) {
        status.textContent = `No se encontraron coincidencias para "${term}".`;
      } else {
        status.textContent = `Se encontró al menos una coincidencia para "${term}" en el contenido.`;
        window.getSelection().removeAllRanges();
      }
    }
    btn.addEventListener('click', doSearch);
    input.addEventListener('keydown', (ev) => {
      if (ev.key === 'Enter') doSearch();
    });
  }

  function focusSearch() {
    const input = document.getElementById('searchInput');
    if (input) {
      input.focus();
      input.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }

  document.addEventListener('click', (ev) => {
    const target = ev.target;
    if (!(target instanceof HTMLElement)) return;
    const action = target.dataset.action;
    if (!action) return;
    if (action === 'toggle-theme') {
      const current = body.getAttribute('data-theme') || 'dark';
      setTheme(current === 'dark' ? 'light' : 'dark');
    } else if (action === 'font-inc') {
      adjustFont(0.08);
    } else if (action === 'font-dec') {
      adjustFont(-0.08);
    } else if (action === 'toggle-tts') {
      toggleTTS();
    } else if (action === 'toggle-lang') {
      toggleLang();
    } else if (action === 'focus-kpsi') {
      focusKpsi();
    } else if (action === 'focus-search') {
      focusSearch();
    }
  });

  document.addEventListener('DOMContentLoaded', () => {
    bindSearch();

    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('./service-worker.js').catch(() => {});
    }
  });
})();
