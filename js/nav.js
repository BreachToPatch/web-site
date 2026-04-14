/* =====================================================================
   nav.js — hamburger menu toggle for mobile
   ===================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  const toggle = document.querySelector('.nav-toggle');
  const links  = document.querySelector('.nav-links');
  if (!toggle || !links) return;

  toggle.addEventListener('click', () => {
    const isOpen = links.classList.toggle('open');
    toggle.setAttribute('aria-expanded', String(isOpen));
    toggle.innerHTML = isOpen ? '&#x2715;' : '&#x2630;';
  });

  // Close when a link is clicked
  links.addEventListener('click', e => {
    if (e.target.tagName === 'A') {
      links.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
      toggle.innerHTML = '&#x2630;';
    }
  });

  // Close on outside click
  document.addEventListener('click', e => {
    if (!toggle.contains(e.target) && !links.contains(e.target)) {
      links.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
      toggle.innerHTML = '&#x2630;';
    }
  });
});
