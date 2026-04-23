/* ============================================================
   SAMAA AL AJYAD - Main JavaScript
   ============================================================ */

'use strict';

const CONTACT_FORM_ENDPOINT = 'https://script.google.com/macros/s/AKfycbx49KI_V5eo4uJJCoTXddmEzE50DiIo5MpKDKu0HRKB47tHD_kI5JmLybwhF2ZkBtU/exec';

/* Navbar scroll effect */
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  if (window.scrollY > 60) navbar.classList.add('scrolled');
  else navbar.classList.remove('scrolled');
}, { passive: true });

/* Mobile hamburger */
const hamburger = document.getElementById('hamburger');
const navLinks = document.getElementById('navLinks');
if (hamburger && navLinks) {
  hamburger.addEventListener('click', () => {
    navLinks.classList.toggle('open');
    const isOpen = navLinks.classList.contains('open');
    hamburger.setAttribute('aria-expanded', isOpen);
  });

  navLinks.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => navLinks.classList.remove('open'));
  });
}

/* Active nav link */
(function setActiveLink() {
  const path = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a').forEach((link) => {
    const href = link.getAttribute('href');
    if (href === path || (path === '' && href === 'index.html')) {
      link.classList.add('active');
    }
  });
})();

/* Scroll reveal */
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });

document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale')
  .forEach((el) => revealObserver.observe(el));

/* Hero text typewriter effect */
const typeEl = document.getElementById('heroType');
if (typeEl) {
  const phrases = ['General Trading Partner', 'Import & Export Expert', 'Global Sourcing Ally', 'Supply Chain Partner'];
  let phraseIndex = 0;
  let charIndex = 0;
  let deleting = false;
  let pauseCount = 0;

  function type() {
    const phrase = phrases[phraseIndex];
    if (!deleting) {
      typeEl.textContent = phrase.slice(0, ++charIndex);
      if (charIndex === phrase.length) {
        deleting = true;
        pauseCount = 0;
      }
      window.setTimeout(type, 80);
    } else {
      pauseCount += 1;
      if (pauseCount < 18) {
        window.setTimeout(type, 80);
        return;
      }
      typeEl.textContent = phrase.slice(0, --charIndex);
      if (charIndex === 0) {
        deleting = false;
        phraseIndex = (phraseIndex + 1) % phrases.length;
      }
      window.setTimeout(type, 45);
    }
  }

  window.setTimeout(type, 1200);
}

/* Ticker duplicate */
const tickerInner = document.querySelector('.ticker-inner');
if (tickerInner) {
  const clone = tickerInner.innerHTML;
  tickerInner.innerHTML = clone + clone;
}

/* Smooth anchor scroll */
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener('click', function handleAnchorClick(e) {
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      e.preventDefault();
      const offset = 80;
      const top = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  });
});

/* Counter animation */
function animateCounter(el, target, suffix = '') {
  const duration = 1800;
  const start = performance.now();
  const startVal = 0;

  function update(ts) {
    const elapsed = ts - start;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    const val = Math.round(startVal + (target - startVal) * eased);
    el.textContent = val + suffix;
    if (progress < 1) requestAnimationFrame(update);
  }

  requestAnimationFrame(update);
}

const counterObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      const el = entry.target;
      const target = parseInt(el.dataset.target, 10);
      const suffix = el.dataset.suffix || '';
      animateCounter(el, target, suffix);
      counterObserver.unobserve(el);
    }
  });
}, { threshold: 0.5 });

document.querySelectorAll('[data-target]').forEach((el) => counterObserver.observe(el));

/* Contact form */
const contactForm = document.getElementById('contactForm');
if (contactForm) {
  const submitButton = contactForm.querySelector('button[type="submit"]');
  const statusEl = document.getElementById('formStatus');
  const transportFrame = document.getElementById('contactFormTransport');
  const defaultButtonLabel = submitButton ? submitButton.innerHTML : '';
  const configuredEndpoint = (CONTACT_FORM_ENDPOINT || '').trim();

  function setFormStatus(message, state) {
    if (!statusEl) return;
    statusEl.textContent = message;
    statusEl.className = 'form-status';
    if (state) statusEl.classList.add(`is-${state}`);
  }

  function setSubmittingState(isSubmitting) {
    if (!submitButton) return;
    submitButton.disabled = isSubmitting;
    submitButton.innerHTML = isSubmitting ? 'Sending Inquiry...' : defaultButtonLabel;
  }

  function validateContactForm() {
    if (!contactForm.checkValidity()) {
      contactForm.reportValidity();
      return false;
    }

    const consentField = document.getElementById('consent');
    if (consentField && !consentField.checked) {
      setFormStatus('Please confirm the consent checkbox before sending.', 'error');
      consentField.focus();
      return false;
    }

    return true;
  }

  contactForm.addEventListener('submit', (e) => {
    e.preventDefault();

    if (!configuredEndpoint || configuredEndpoint.indexOf('PASTE_YOUR_DEPLOYED') === 0) {
      setFormStatus('Google Sheets endpoint is not configured yet. Paste your deployed Apps Script web app URL into script.js.', 'error');
      return;
    }

    if (!validateContactForm()) {
      return;
    }

    setSubmittingState(true);
    setFormStatus('Sending your inquiry...', 'loading');

    const metadata = {
      sourcePage: window.location.href,
      userAgent: window.navigator.userAgent,
      submittedAt: new Date().toISOString(),
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || ''
    };

    Object.entries(metadata).forEach(([name, value]) => {
      let input = contactForm.querySelector(`input[name="${name}"]`);
      if (!input) {
        input = document.createElement('input');
        input.type = 'hidden';
        input.name = name;
        contactForm.appendChild(input);
      }
      input.value = value;
    });

    const timeoutId = window.setTimeout(() => {
      setSubmittingState(false);
      setFormStatus('The form could not confirm submission in time. Please try again.', 'error');
    }, 12000);

    const handleLoad = () => {
      window.clearTimeout(timeoutId);
      setSubmittingState(false);
      setFormStatus('Your inquiry has been sent successfully.', 'success');
      contactForm.reset();
    };

    if (transportFrame) {
      transportFrame.addEventListener('load', handleLoad, { once: true });
    }

    contactForm.action = configuredEndpoint;
    contactForm.method = 'POST';
    contactForm.target = transportFrame ? 'contactFormTransport' : '_self';
    contactForm.submit();
  });
}

/* Parallax subtle effect */
const parallaxEl = document.querySelector('.hero-geometric');
if (parallaxEl) {
  window.addEventListener('mousemove', (e) => {
    const x = (e.clientX / window.innerWidth - 0.5) * 20;
    const y = (e.clientY / window.innerHeight - 0.5) * 20;
    parallaxEl.style.transform = `translateY(-50%) rotate(${x * 0.5}deg) translate(${x}px, ${y}px)`;
  }, { passive: true });
}

/* Page load animation */
document.addEventListener('DOMContentLoaded', () => {
  document.body.style.opacity = '0';
  document.body.style.transition = 'opacity 0.5s ease';
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      document.body.style.opacity = '1';
    });
  });
});
