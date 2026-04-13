/* ══════════════════════════════════════════════════
   Vaidyagrama — Shared Animation Engine
   ══════════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isMobile = window.matchMedia('(pointer: coarse)').matches;

  const ANIM_SELECTORS = '.anim-fade-up, .anim-fade-in-left, .anim-fade-in-right, .anim-scale-up, .anim-fade-in';

  // ── 1. Scroll Reveal Observer ──────────────────────
  let revealObserver = null;
  if (!prefersReduced) {
    revealObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });

    document.querySelectorAll(ANIM_SELECTORS).forEach(el => revealObserver.observe(el));
    // Backward compat with index.html's existing .fade-up class
    document.querySelectorAll('.fade-up').forEach(el => revealObserver.observe(el));
  } else {
    // Instantly show everything for reduced-motion users
    document.querySelectorAll(ANIM_SELECTORS + ', .fade-up').forEach(el => {
      el.classList.add('visible');
    });
  }

  // ── 2. Auto-Stagger for Grids ─────────────────────
  // Container: data-anim-stagger="0.1"  → children get sequential delays
  document.querySelectorAll('[data-anim-stagger]').forEach(container => {
    const delay = parseFloat(container.dataset.animStagger) || 0.1;
    const children = container.querySelectorAll(ANIM_SELECTORS);
    children.forEach((child, i) => {
      child.style.transitionDelay = (i * delay) + 's';
    });
  });

  // ── 3. Counter Animation ──────────────────────────
  const counters = document.querySelectorAll('.counter');
  if (counters.length) {
    if (prefersReduced) {
      counters.forEach(el => {
        el.textContent = el.dataset.target + (el.dataset.suffix || '');
      });
    } else {
      const DURATION = 2000;
      const counterObserver = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if (!entry.isIntersecting) return;
          const el = entry.target;
          const target = +el.dataset.target;
          const suffix = el.dataset.suffix || '';
          if (isNaN(target)) { el.textContent = el.dataset.target + suffix; return; }
          let start = 0;
          const step = target / (DURATION / 16);
          const timer = setInterval(() => {
            start += step;
            if (start >= target) {
              el.textContent = target + suffix;
              clearInterval(timer);
              return;
            }
            el.textContent = Math.floor(start) + suffix;
          }, 16);
          counterObserver.unobserve(el);
        });
      }, { threshold: 0.3 });
      counters.forEach(c => counterObserver.observe(c));
    }
  }

  // ── 4. Vanilla-Tilt Auto-Init (desktop only) ──────
  if (typeof VanillaTilt !== 'undefined' && !prefersReduced && !isMobile) {
    VanillaTilt.init(document.querySelectorAll('.tilt-card'), {
      max: 8,
      speed: 400,
      glare: true,
      'max-glare': 0.15,
      scale: 1.02,
    });
  }

  // ── 5. Flip Card Tap Handler (mobile) ─────────────
  if (isMobile) {
    document.querySelectorAll('.flip-card').forEach(card => {
      card.addEventListener('click', () => {
        card.classList.toggle('flipped');
      });
    });
  }

  // ── 6. MutationObserver for Alpine-rendered content
  // Watches for new elements added by Alpine.js x-for loops
  if (!prefersReduced) {
    const dynamicObserver = new MutationObserver(mutations => {
      mutations.forEach(mutation => {
        mutation.addedNodes.forEach(node => {
          if (node.nodeType !== 1) return;
          // Check if the added node itself needs observation
          if (node.matches && node.matches(ANIM_SELECTORS)) {
            revealObserver.observe(node);
          }
          // Check children of the added node
          const children = node.querySelectorAll ? node.querySelectorAll(ANIM_SELECTORS) : [];
          children.forEach(child => revealObserver.observe(child));
        });
      });
    });

    // Only watch if there's a revealObserver (not reduced motion)
    if (revealObserver) {
      dynamicObserver.observe(document.body, { childList: true, subtree: true });
      // Clean up after Alpine is done initializing (5s timeout)
      setTimeout(() => dynamicObserver.disconnect(), 5000);
    }
  }
});
