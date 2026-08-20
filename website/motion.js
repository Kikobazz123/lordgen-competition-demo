/*
  Interaction polish -- card tilt, magnetic CTAs, scroll reveal. Deliberately
  a separate classic script from hero3d.js (a WebGL failure must never take
  this out) and from app.js (the one file with real, tested demo logic gets
  touched as little as possible). Every effect here is event-driven, not a
  continuous animation loop, so it costs nothing while idle.
*/
(function () {
  const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';
  const COARSE_POINTER_QUERY = '(pointer: coarse)';

  function motionAllowed() {
    return !window.matchMedia(REDUCED_MOTION_QUERY).matches && !window.matchMedia(COARSE_POINTER_QUERY).matches;
  }

  function initPanelTilt() {
    if (!motionAllowed()) return;
    const panels = document.querySelectorAll('.panel');

    panels.forEach((panel) => {
      let ticking = false;
      let lastX = 0;
      let lastY = 0;

      panel.addEventListener('pointermove', (e) => {
        const rect = panel.getBoundingClientRect();
        const px = (e.clientX - rect.left) / rect.width - 0.5;
        const py = (e.clientY - rect.top) / rect.height - 0.5;
        lastX = px;
        lastY = py;
        if (!ticking) {
          ticking = true;
          requestAnimationFrame(() => {
            const rotateY = lastX * 4; // degrees, kept small -- restrained, not gimmicky
            const rotateX = -lastY * 4;
            panel.style.transform = `perspective(900px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
            ticking = false;
          });
        }
      });

      panel.addEventListener('pointerenter', () => {
        panel.style.willChange = 'transform';
      });

      panel.addEventListener('pointerleave', () => {
        panel.style.transform = 'perspective(900px) rotateX(0deg) rotateY(0deg)';
        panel.style.willChange = 'auto';
      });
    });
  }

  function initMagneticButtons() {
    if (!motionAllowed()) return;
    const buttons = document.querySelectorAll('.btn-magnetic');

    buttons.forEach((btn) => {
      btn.addEventListener('pointermove', (e) => {
        const rect = btn.getBoundingClientRect();
        const dx = (e.clientX - rect.left - rect.width / 2) * 0.22;
        const dy = (e.clientY - rect.top - rect.height / 2) * 0.28;
        btn.style.transform = `translate(${dx}px, ${dy}px)`;
      });

      btn.addEventListener('pointerenter', () => {
        btn.style.willChange = 'transform';
      });

      btn.addEventListener('pointerleave', () => {
        btn.style.transform = 'translate(0, 0)';
        btn.style.willChange = 'auto';
      });
    });
  }

  function initScrollReveal() {
    const targets = document.querySelectorAll('[data-reveal]');
    if (!targets.length) return;

    if (!motionAllowed() || !('IntersectionObserver' in window)) return;

    targets.forEach((el) => el.classList.add('reveal-pending'));

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.remove('reveal-pending');
            entry.target.classList.add('reveal-in');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -60px 0px' }
    );

    targets.forEach((el) => observer.observe(el));
  }

  function initMobileNav() {
    const toggle = document.getElementById('navToggle');
    const nav = document.getElementById('headerNav');
    if (!toggle || !nav) return;

    toggle.addEventListener('click', () => {
      const isOpen = nav.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', String(isOpen));
    });

    nav.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
        nav.classList.remove('is-open');
        toggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  function init() {
    initPanelTilt();
    initMagneticButtons();
    initScrollReveal();
    initMobileNav();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
