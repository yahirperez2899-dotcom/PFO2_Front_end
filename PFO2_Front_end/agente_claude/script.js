/* =====================================================
   NovaSoft Solutions — script.js
===================================================== */

'use strict';

// ---- Utility: debounce ----
function debounce(fn, delay) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

// =====================================================
// 1. HEADER: scroll class + mobile nav
// =====================================================
(function initHeader() {
  const header    = document.querySelector('.header');
  const hamburger = document.querySelector('.hamburger');
  const mobileNav = document.getElementById('mobile-nav');
  const mobileLinks = mobileNav ? mobileNav.querySelectorAll('.mobile-nav__link, .btn') : [];

  // Scrolled state
  const onScroll = debounce(() => {
    header.classList.toggle('header--scrolled', window.scrollY > 20);
  }, 40);
  window.addEventListener('scroll', onScroll, { passive: true });

  // Mobile nav toggle
  if (hamburger && mobileNav) {
    hamburger.addEventListener('click', () => {
      const isOpen = hamburger.classList.toggle('is-open');
      hamburger.setAttribute('aria-expanded', isOpen);
      mobileNav.hidden = !isOpen;
    });

    // Close when a link is clicked
    mobileLinks.forEach(link => {
      link.addEventListener('click', () => {
        hamburger.classList.remove('is-open');
        hamburger.setAttribute('aria-expanded', 'false');
        mobileNav.hidden = true;
      });
    });

    // Close on Escape
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && !mobileNav.hidden) {
        hamburger.classList.remove('is-open');
        hamburger.setAttribute('aria-expanded', 'false');
        mobileNav.hidden = true;
        hamburger.focus();
      }
    });
  }
})();

// =====================================================
// 2. SMOOTH SCROLL for anchor links
// =====================================================
(function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const href = this.getAttribute('href');
      if (href === '#') return;
      const target = document.querySelector(href);
      if (!target) return;
      e.preventDefault();

      const headerH = parseInt(getComputedStyle(document.documentElement)
        .getPropertyValue('--header-h')) || 72;
      const top = target.getBoundingClientRect().top + window.scrollY - headerH;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });
})();

// =====================================================
// 3. SCROLL REVEAL
// =====================================================
(function initReveal() {
  const targets = [
    '.service-card',
    '.why-card',
    '.testimonial-card',
    '.about__pillar',
    '.stat-item',
    '.section-title',
    '.section-label',
    '.section-subtitle',
    '.hero__text',
    '.hero__visual',
    '.about__intro',
    '.about__pillars',
    '.contact__intro',
    '.contact__form-wrap',
  ];

  const elements = document.querySelectorAll(targets.join(', '));
  elements.forEach(el => el.classList.add('reveal'));

  if (!window.IntersectionObserver) {
    // Fallback: just show everything
    elements.forEach(el => el.classList.add('is-visible'));
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  elements.forEach(el => observer.observe(el));
})();

// =====================================================
// 4. ANIMATED STATISTICS COUNTER
// =====================================================
(function initStats() {
  const statValues = document.querySelectorAll('.stat-item__value[data-target]');
  if (!statValues.length) return;

  function animateCounter(el) {
    const target  = parseInt(el.dataset.target, 10);
    const suffix  = el.dataset.suffix || '';
    const duration = 1600; // ms
    const startTime = performance.now();

    // Ease-out cubic
    function easeOut(t) { return 1 - Math.pow(1 - t, 3); }

    function tick(now) {
      const elapsed  = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const value    = Math.round(easeOut(progress) * target);
      el.textContent = value + suffix;
      if (progress < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  if (!window.IntersectionObserver) {
    statValues.forEach(animateCounter);
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  statValues.forEach(el => observer.observe(el));
})();

// =====================================================
// 5. CONTACT FORM (no backend)
// =====================================================
(function initContactForm() {
  const form    = document.querySelector('.contact-form');
  const success = form ? form.querySelector('.form-success') : null;
  if (!form || !success) return;

  function showError(input, msg) {
    const group = input.closest('.form-group');
    let err = group.querySelector('.form-error');
    if (!err) {
      err = document.createElement('span');
      err.className = 'form-error';
      err.setAttribute('role', 'alert');
      err.style.cssText = 'font-size:12px;color:#dc2626;margin-top:4px;display:block;';
      group.appendChild(err);
    }
    err.textContent = msg;
    input.setAttribute('aria-invalid', 'true');
  }

  function clearError(input) {
    const group = input.closest('.form-group');
    const err   = group.querySelector('.form-error');
    if (err) err.remove();
    input.removeAttribute('aria-invalid');
  }

  function validateForm() {
    let valid = true;
    const name    = form.querySelector('#name');
    const email   = form.querySelector('#email');
    const message = form.querySelector('#message');

    [name, email, message].forEach(clearError);

    if (!name.value.trim()) {
      showError(name, 'Please enter your full name.');
      valid = false;
    }
    if (!email.value.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
      showError(email, 'Please enter a valid email address.');
      valid = false;
    }
    if (!message.value.trim() || message.value.trim().length < 10) {
      showError(message, 'Message must be at least 10 characters.');
      valid = false;
    }
    return valid;
  }

  // Live validation on blur
  form.querySelectorAll('.form-input').forEach(input => {
    input.addEventListener('blur', () => {
      if (input.hasAttribute('required')) validateForm();
    });
  });

  form.addEventListener('submit', e => {
    e.preventDefault();
    if (!validateForm()) return;

    const btn = form.querySelector('button[type="submit"]');
    btn.textContent = 'Sending…';
    btn.disabled    = true;

    // Simulate network delay
    setTimeout(() => {
      form.querySelectorAll('.form-input').forEach(i => {
        i.value = '';
        clearError(i);
      });
      success.hidden = false;
      btn.textContent = 'Send message';
      btn.disabled    = false;

      // Hide success after 6 seconds
      setTimeout(() => { success.hidden = true; }, 6000);
    }, 1200);
  });
})();

// =====================================================
// 6. FOOTER YEAR
// =====================================================
(function setFooterYear() {
  const el = document.getElementById('footer-year');
  if (el) el.textContent = new Date().getFullYear();
})();
