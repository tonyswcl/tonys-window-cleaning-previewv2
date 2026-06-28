/* =========================================================
   Tony's Window Cleaning — UI interactions
   Nav, scroll progress, reveals, tilt cards, counters,
   before/after sliders, FAQ. Vanilla JS, no dependencies.
   ========================================================= */
(function () {
  'use strict';
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---- Current year ---- */
  const yearEl = $('#year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---- Navbar scrolled state + scroll progress ---- */
  const nav = $('#nav');
  const progress = $('#scrollProgress');
  function onScroll() {
    const y = window.scrollY;
    if (nav) nav.classList.toggle('scrolled', y > 40);
    if (progress) {
      const h = document.documentElement.scrollHeight - window.innerHeight;
      progress.style.width = (h > 0 ? (y / h) * 100 : 0) + '%';
    }
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---- Mobile menu ---- */
  const toggle = $('#navToggle');
  const links = $('#navLinks');
  if (toggle && links) {
    const close = () => {
      links.classList.remove('open');
      toggle.classList.remove('active');
      toggle.setAttribute('aria-expanded', 'false');
    };
    toggle.addEventListener('click', () => {
      const open = links.classList.toggle('open');
      toggle.classList.toggle('active', open);
      toggle.setAttribute('aria-expanded', String(open));
    });
    $$('a', links).forEach((a) => a.addEventListener('click', close));
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });
  }

  /* ---- Reveal on scroll ---- */
  const reveals = $$('.reveal');
  if ('IntersectionObserver' in window && !reduceMotion) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (en.isIntersecting) {
          en.target.classList.add('in');
          io.unobserve(en.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    reveals.forEach((el) => io.observe(el));
  } else {
    reveals.forEach((el) => el.classList.add('in'));
  }

  /* ---- 3D tilt on service cards (pointer, desktop only) ---- */
  if (!reduceMotion && window.matchMedia('(hover:hover) and (pointer:fine)').matches) {
    $$('[data-tilt]').forEach((card) => {
      const max = 9;
      card.addEventListener('pointermove', (e) => {
        const r = card.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - 0.5;
        const py = (e.clientY - r.top) / r.height - 0.5;
        card.style.transform =
          `perspective(800px) rotateX(${-py * max}deg) rotateY(${px * max}deg) translateY(-6px)`;
      });
      card.addEventListener('pointerleave', () => { card.style.transform = ''; });
    });
  }

  /* ---- Animated counters ---- */
  const counters = $$('[data-count]');
  if (counters.length) {
    const animate = (el) => {
      const target = parseFloat(el.dataset.count);
      const dur = 1400;
      const start = performance.now();
      const step = (now) => {
        const p = Math.min((now - start) / dur, 1);
        const eased = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.round(target * eased).toString();
        if (p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    };
    if ('IntersectionObserver' in window && !reduceMotion) {
      const cio = new IntersectionObserver((entries) => {
        entries.forEach((en) => {
          if (en.isIntersecting) { animate(en.target); cio.unobserve(en.target); }
        });
      }, { threshold: 0.5 });
      counters.forEach((c) => cio.observe(c));
    } else {
      counters.forEach((c) => (c.textContent = c.dataset.count));
    }
  }

  /* ---- Before / After sliders ---- */
  $$('[data-ba]').forEach((ba) => {
    const before = $('.ba-before', ba);
    const handle = $('.ba-handle', ba);
    const range = $('.ba-range', ba);
    const set = (val) => {
      const pct = Math.max(0, Math.min(100, val));
      // before layer clipped from the right so dragging reveals the "after"
      before.style.clipPath = `inset(0 ${100 - pct}% 0 0)`;
      handle.style.left = pct + '%';
    };
    if (range) {
      range.addEventListener('input', () => set(parseFloat(range.value)));
      set(parseFloat(range.value || 50));
    }
  });

  /* ---- Smooth anchor offset for fixed nav ---- */
  $$('a[href^="#"]').forEach((a) => {
    a.addEventListener('click', (e) => {
      const id = a.getAttribute('href');
      if (id.length <= 1) return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      const top = target.getBoundingClientRect().top + window.scrollY - 70;
      window.scrollTo({ top, behavior: reduceMotion ? 'auto' : 'smooth' });
    });
  });

  /* ---- Form: friendly submit feedback (Formspree handles delivery) ---- */
  const form = $('.quote-form');
  if (form) {
    form.addEventListener('submit', () => {
      const btn = $('button[type="submit"]', form);
      if (btn && !form.action.includes('YOUR_FORM_ID')) {
        btn.textContent = 'Sending…';
        btn.disabled = true;
      }
    });
  }
})();
