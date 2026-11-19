(() => {
  'use strict';

  const header = document.getElementById('siteHeader');
  const navToggle = document.getElementById('navToggle');
  const primaryNav = document.getElementById('primaryNav');
  const dropdownTriggers = document.querySelectorAll('.nav-dropdown-trigger');

  /* ---- Sticky header condense-on-scroll ---- */
  const SCROLL_THRESHOLD = 12;
  let ticking = false;

  function updateHeaderState() {
    header.classList.toggle('is-scrolled', window.scrollY > SCROLL_THRESHOLD);
    ticking = false;
  }

  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(updateHeaderState);
      ticking = true;
    }
  }, { passive: true });

  updateHeaderState();

  /* ---- Mobile menu toggle ---- */
  navToggle.addEventListener('click', () => {
    const isOpen = navToggle.getAttribute('aria-expanded') === 'true';
    navToggle.setAttribute('aria-expanded', String(!isOpen));
    navToggle.setAttribute('aria-label', isOpen ? 'Open menu' : 'Close menu');
    primaryNav.classList.toggle('is-open', !isOpen);
    document.body.style.overflow = isOpen ? '' : 'hidden';
  });

  /* ---- Dropdowns: click-to-open on touch/mobile, hover-friendly on desktop ---- */
  function closeAllDropdowns(except) {
    dropdownTriggers.forEach((trigger) => {
      if (trigger === except) return;
      trigger.setAttribute('aria-expanded', 'false');
      trigger.closest('.nav-item').classList.remove('is-open');
    });
  }

  dropdownTriggers.forEach((trigger) => {
    const navItem = trigger.closest('.nav-item');

    trigger.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = trigger.getAttribute('aria-expanded') === 'true';
      closeAllDropdowns(isOpen ? null : trigger);
      trigger.setAttribute('aria-expanded', String(!isOpen));
      navItem.classList.toggle('is-open', !isOpen);
    });

    // Desktop hover convenience — only above the mobile breakpoint
    navItem.addEventListener('mouseenter', () => {
      if (window.innerWidth <= 900) return;
      closeAllDropdowns(trigger);
      trigger.setAttribute('aria-expanded', 'true');
      navItem.classList.add('is-open');
    });
    navItem.addEventListener('mouseleave', () => {
      if (window.innerWidth <= 900) return;
      trigger.setAttribute('aria-expanded', 'false');
      navItem.classList.remove('is-open');
    });
  });

  /* ---- Close dropdowns on outside click ---- */
  document.addEventListener('click', () => closeAllDropdowns());

  /* ---- Close everything on Escape ---- */
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    closeAllDropdowns();
    if (primaryNav.classList.contains('is-open')) {
      navToggle.click();
    }
  });

  /* ---- Reset mobile menu state on resize past breakpoint ---- */
  window.addEventListener('resize', () => {
    if (window.innerWidth > 900 && primaryNav.classList.contains('is-open')) {
      navToggle.setAttribute('aria-expanded', 'false');
      navToggle.setAttribute('aria-label', 'Open menu');
      primaryNav.classList.remove('is-open');
      document.body.style.overflow = '';
    }
  });
})();
/* ---- Photo spaces: a photo appears only once its file has been added ----
   Elements with data-photo="path.jpg" stay hidden until that file loads, so
   missing photos never leave a gap or a broken-image icon. Add the file with
   the expected name and it appears; the surrounding layout adapts. */
(() => {
  'use strict';

  document.querySelectorAll('[data-photo]').forEach((slot) => {
    const d = slot.dataset;
    const img = new Image();
    img.decoding = 'async';
    img.alt = d.alt || '';
    if (d.class) img.className = d.class;
    if (d.width) img.width = Number(d.width);
    if (d.height) img.height = Number(d.height);
    if (d.priority) img.fetchPriority = d.priority;

    img.addEventListener('load', () => {
      slot.prepend(img);
      if (d.caption) {
        const cap = document.createElement('figcaption');
        cap.textContent = d.caption;
        slot.append(cap);
      }
      // Reveal the space and any hidden wrappers (up to its card / section)
      for (let el = slot; el && el !== document.body && !el.hasAttribute('data-photo-host'); el = el.parentElement) {
        el.hidden = false;
      }
      const host = slot.closest('[data-photo-host]');
      if (host) host.classList.add('has-photo');
    }, { once: true });

    img.src = d.photo;
  });
})();
