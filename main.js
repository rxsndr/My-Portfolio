/* ─────────────────────────────────────────
   main.js  —  Rexsander Torres Portfolio
   ───────────────────────────────────────── */

'use strict';

// ── 1. Navbar scroll effect ──────────────────────────────────────────────────
const navbar = document.getElementById('navbar');

function onScroll() {
  navbar.classList.toggle('scrolled', window.scrollY > 20);
  highlightActiveSection();
}

window.addEventListener('scroll', onScroll, { passive: true });

// ── 2. Mobile menu toggle ────────────────────────────────────────────────────
const menuBtn   = document.getElementById('menu-btn');
const mobileMenu = document.getElementById('mobile-menu');
const iconOpen  = document.getElementById('icon-open');
const iconClose = document.getElementById('icon-close');

menuBtn.addEventListener('click', () => {
  const isOpen = !mobileMenu.classList.contains('hidden');
  mobileMenu.classList.toggle('hidden', isOpen);
  iconOpen.classList.toggle('hidden', !isOpen);
  iconClose.classList.toggle('hidden', isOpen);
  menuBtn.setAttribute('aria-expanded', String(!isOpen));
});

// Close mobile menu when a link is clicked
document.querySelectorAll('.mobile-link').forEach(link => {
  link.addEventListener('click', () => {
    mobileMenu.classList.add('hidden');
    iconOpen.classList.remove('hidden');
    iconClose.classList.add('hidden');
    menuBtn.setAttribute('aria-expanded', 'false');
  });
});

// ── 3. Active nav link on scroll ────────────────────────────────────────────
const sections  = ['hero', 'about', 'projects', 'studio', 'contact'];
const navLinks  = document.querySelectorAll('.nav-link');
const mobLinks  = document.querySelectorAll('.mobile-link');

function highlightActiveSection() {
  let current = 'hero';

  sections.forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;
    if (window.scrollY >= el.offsetTop - 120) {
      current = id;
    }
  });

  [...navLinks, ...mobLinks].forEach(link => {
    const href = link.getAttribute('href')?.replace('#', '');
    link.classList.toggle('active', href === current);
  });
}

// ── 4. Scroll-reveal (IntersectionObserver) ──────────────────────────────────
const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry, index) => {
      if (entry.isIntersecting) {
        // Stagger cards within the same batch
        const siblings = [...entry.target.parentElement.querySelectorAll('.reveal-card:not(.visible)')];
        const staggerIndex = siblings.indexOf(entry.target);
        const delay = Math.max(0, staggerIndex * 80);

        setTimeout(() => {
          entry.target.classList.add('visible');
        }, delay);

        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
);

document.querySelectorAll('.reveal-card').forEach(el => {
  revealObserver.observe(el);
});

// ── 5. Skill bar animate-in ──────────────────────────────────────────────────
// Bars start at w-0 via JS; CSS targets animate them to their declared width
document.querySelectorAll('.skill-bar > div').forEach(bar => {
  const targetWidth = bar.style.width || bar.className.match(/w-\[([^\]]+)\]/)?.[1];
  bar.style.width = '0%';
  bar.style.transition = 'width 0.9s cubic-bezier(0.4,0,0.2,1)';

  const barObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        // Restore declared inline width or read from Tailwind class
        bar.style.width = targetWidth ?? bar.dataset.width ?? '80%';
        barObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  barObserver.observe(bar);
});

// ── 6. Smooth scroll polyfill for browsers without CSS scroll-smooth ─────────
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', (e) => {
    const target = document.querySelector(anchor.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
});

// ── 8. Feast of Legends — screenshot carousel ─────────────────────────────
(function () {
  const TOTAL = 9;
  const LABELS = [
    'Main Menu',
    'Tutorial Stage',
    'Stage Clear',
    'Lava Dungeon — Combat',
    'Lava Dungeon — Fire Enemy',
    'Lava Dungeon — Multiple Enemies',
    'Lava Dungeon — Fireballs',
    'Lava Dungeon — Fireball Storm',
    'Lava Dungeon — Crescent Fire',
  ];

  const slides   = document.getElementById('fol-slides');
  const dotsWrap = document.getElementById('fol-dots');
  const thumbWrap = document.getElementById('fol-thumbs');
  const counter  = document.getElementById('fol-counter');
  const prevBtn  = document.querySelector('.fol-prev');
  const nextBtn  = document.querySelector('.fol-next');
  const expandBtn = document.querySelector('.fol-expand');

  if (!slides) return;

  let current = 0;
  let autoTimer = null;

  function startAuto() {
    clearInterval(autoTimer);
    autoTimer = setInterval(() => goTo(current + 1), 4000);
  }

  function stopAuto() {
    clearInterval(autoTimer);
  }

  // Build dots
  const dots = Array.from({ length: TOTAL }, (_, i) => {
    const d = document.createElement('button');
    d.className = 'fol-dot' + (i === 0 ? ' active' : '');
    d.setAttribute('aria-label', `Go to screenshot ${i + 1}`);
    d.addEventListener('click', () => { stopAuto(); goTo(i, true); startAuto(); });
    dotsWrap.appendChild(d);
    return d;
  });

  // Build thumbnails
  const thumbs = Array.from({ length: TOTAL }, (_, i) => {
    const img = document.createElement('img');
    img.src = `images/feast-of-legends/ss${i + 1}.png`;
    img.alt = LABELS[i];
    img.className = 'fol-thumb' + (i === 0 ? ' active' : '');
    img.setAttribute('role', 'listitem');
    img.addEventListener('click', () => {
      stopAuto();
      goTo(i, true);
      openLightbox(i);
    });
    thumbWrap.appendChild(img);
    return img;
  });

  function goTo(n, scrollThumb = false) {
    current = (n + TOTAL) % TOTAL;
    slides.style.transform = `translateX(-${current * 100}%)`;
    counter.textContent = `${current + 1} / ${TOTAL}`;
    dots.forEach((d, i) => d.classList.toggle('active', i === current));
    thumbs.forEach((t, i) => t.classList.toggle('active', i === current));
    // Scroll active thumb into view only on manual interaction
    if (scrollThumb) thumbs[current].scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });
  }

  prevBtn.addEventListener('click', (e) => { e.stopPropagation(); stopAuto(); goTo(current - 1, true); startAuto(); });
  nextBtn.addEventListener('click', (e) => { e.stopPropagation(); stopAuto(); goTo(current + 1, true); startAuto(); });
  expandBtn.addEventListener('click', (e) => { e.stopPropagation(); openLightbox(current); });
  document.getElementById('fol-carousel').addEventListener('click', () => openLightbox(current));

  // Swipe support on carousel
  let touchStartX = 0;
  slides.addEventListener('touchstart', (e) => { touchStartX = e.touches[0].clientX; }, { passive: true });
  slides.addEventListener('touchend', (e) => {
    const diff = touchStartX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) { stopAuto(); goTo(current + (diff > 0 ? 1 : -1), true); startAuto(); }
  });

  startAuto();

  // ── Lightbox ──────────────────────────────────────────────────
  const lightbox  = document.getElementById('fol-lightbox');
  const lbImg     = document.getElementById('lb-img');
  const lbCaption = document.getElementById('lb-caption');
  const lbDotsWrap = document.getElementById('lb-dots');
  const lbClose   = document.getElementById('lb-close');
  const lbPrev    = document.getElementById('lb-prev');
  const lbNext    = document.getElementById('lb-next');

  let lbIndex = 0;

  // Build lightbox dots
  const lbDots = Array.from({ length: TOTAL }, (_, i) => {
    const d = document.createElement('button');
    d.className = 'lb-dot' + (i === 0 ? ' active' : '');
    d.setAttribute('aria-label', `Go to screenshot ${i + 1}`);
    d.addEventListener('click', () => lbGoTo(i));
    lbDotsWrap.appendChild(d);
    return d;
  });

  function lbGoTo(n) {
    lbIndex = (n + TOTAL) % TOTAL;
    lbImg.classList.add('loading');
    const src = `images/feast-of-legends/ss${lbIndex + 1}.png`;
    const tmp = new Image();
    tmp.onload = () => {
      lbImg.src = src;
      lbImg.alt = LABELS[lbIndex];
      lbImg.classList.remove('loading');
    };
    tmp.src = src;
    lbCaption.textContent = `${LABELS[lbIndex]}  (${lbIndex + 1} / ${TOTAL})`;
    lbDots.forEach((d, i) => d.classList.toggle('active', i === lbIndex));
    // Sync main carousel
    goTo(lbIndex);
  }

  function openLightbox(n) {
    lbIndex = n;
    lbImg.src = `images/feast-of-legends/ss${lbIndex + 1}.png`;
    lbImg.alt = LABELS[lbIndex];
    lbCaption.textContent = `${LABELS[lbIndex]}  (${lbIndex + 1} / ${TOTAL})`;
    lbDots.forEach((d, i) => d.classList.toggle('active', i === lbIndex));
    lightbox.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
    stopAuto();
  }

  function closeLightbox() {
    lightbox.classList.add('hidden');
    document.body.style.overflow = '';
    startAuto();
  }

  lbClose.addEventListener('click', closeLightbox);
  lbPrev.addEventListener('click', () => lbGoTo(lbIndex - 1));
  lbNext.addEventListener('click', () => lbGoTo(lbIndex + 1));
  lightbox.addEventListener('click', (e) => { if (e.target === lightbox) closeLightbox(); });

  // Keyboard navigation
  document.addEventListener('keydown', (e) => {
    if (lightbox.classList.contains('hidden')) return;
    if (e.key === 'ArrowLeft')  lbGoTo(lbIndex - 1);
    if (e.key === 'ArrowRight') lbGoTo(lbIndex + 1);
    if (e.key === 'Escape')     closeLightbox();
  });

  // Swipe in lightbox
  let lbTouchX = 0;
  lightbox.addEventListener('touchstart', (e) => { lbTouchX = e.touches[0].clientX; }, { passive: true });
  lightbox.addEventListener('touchend', (e) => {
    const diff = lbTouchX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) lbGoTo(lbIndex + (diff > 0 ? 1 : -1));
  });
})();

// ── 9. Crownless Knight — screenshot carousel ─────────────────────────────
(function () {
  const TOTAL = 8;
  const LABELS = [
    'Arena — Low-poly Blockout',
    'Forest Arena — Top View',
    'Cathedral Ruins Arena',
    'Main Menu',
    'Online Lobby',
    'Wave 2 — Plains Gameplay',
    'Shop Screen',
    'Wave 4 — Horde',
  ];

  const slides    = document.getElementById('ck-slides');
  const dotsWrap  = document.getElementById('ck-dots');
  const thumbWrap = document.getElementById('ck-thumbs');
  const counter   = document.getElementById('ck-counter');
  const prevBtn   = document.querySelector('.ck-prev');
  const nextBtn   = document.querySelector('.ck-next');
  const expandBtn = document.querySelector('.ck-expand');

  if (!slides) return;

  let current = 0;
  let autoTimer = null;

  function startAuto() {
    clearInterval(autoTimer);
    autoTimer = setInterval(() => goTo(current + 1), 4000);
  }

  function stopAuto() {
    clearInterval(autoTimer);
  }

  // Build dots
  const dots = Array.from({ length: TOTAL }, (_, i) => {
    const d = document.createElement('button');
    d.className = 'fol-dot' + (i === 0 ? ' active' : '');
    d.setAttribute('aria-label', `Go to screenshot ${i + 1}`);
    d.addEventListener('click', () => { stopAuto(); goTo(i, true); startAuto(); });
    dotsWrap.appendChild(d);
    return d;
  });

  // Build thumbnails
  const thumbs = Array.from({ length: TOTAL }, (_, i) => {
    const img = document.createElement('img');
    img.src = `images/crownless-knight/ss${i + 1}.png`;
    img.alt = LABELS[i];
    img.className = 'fol-thumb' + (i === 0 ? ' active' : '');
    img.setAttribute('role', 'listitem');
    img.addEventListener('click', () => {
      stopAuto();
      goTo(i, true);
      openLightbox(i);
    });
    thumbWrap.appendChild(img);
    return img;
  });

  function goTo(n, scrollThumb = false) {
    current = (n + TOTAL) % TOTAL;
    slides.style.transform = `translateX(-${current * 100}%)`;
    counter.textContent = `${current + 1} / ${TOTAL}`;
    dots.forEach((d, i) => d.classList.toggle('active', i === current));
    thumbs.forEach((t, i) => t.classList.toggle('active', i === current));
    // Scroll active thumb into view only on manual interaction
    if (scrollThumb) thumbs[current].scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });
  }

  prevBtn.addEventListener('click', (e) => { e.stopPropagation(); stopAuto(); goTo(current - 1, true); startAuto(); });
  nextBtn.addEventListener('click', (e) => { e.stopPropagation(); stopAuto(); goTo(current + 1, true); startAuto(); });
  expandBtn.addEventListener('click', (e) => { e.stopPropagation(); openLightbox(current); });
  document.getElementById('ck-carousel').addEventListener('click', () => openLightbox(current));

  // Swipe on carousel
  let touchStartX = 0;
  slides.addEventListener('touchstart', (e) => { touchStartX = e.touches[0].clientX; }, { passive: true });
  slides.addEventListener('touchend', (e) => {
    const diff = touchStartX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) { stopAuto(); goTo(current + (diff > 0 ? 1 : -1), true); startAuto(); }
  });

  startAuto();

  // ── Lightbox ──────────────────────────────────────────────────
  const lightbox   = document.getElementById('ck-lightbox');
  const lbImg      = document.getElementById('cklb-img');
  const lbCaption  = document.getElementById('cklb-caption');
  const lbDotsWrap = document.getElementById('cklb-dots');
  const lbClose    = document.getElementById('cklb-close');
  const lbPrev     = document.getElementById('cklb-prev');
  const lbNext     = document.getElementById('cklb-next');

  let lbIndex = 0;

  const lbDots = Array.from({ length: TOTAL }, (_, i) => {
    const d = document.createElement('button');
    d.className = 'lb-dot' + (i === 0 ? ' active' : '');
    d.setAttribute('aria-label', `Go to screenshot ${i + 1}`);
    d.addEventListener('click', () => lbGoTo(i));
    lbDotsWrap.appendChild(d);
    return d;
  });

  function lbGoTo(n) {
    lbIndex = (n + TOTAL) % TOTAL;
    lbImg.classList.add('loading');
    const src = `images/crownless-knight/ss${lbIndex + 1}.png`;
    const tmp = new Image();
    tmp.onload = () => {
      lbImg.src = src;
      lbImg.alt = LABELS[lbIndex];
      lbImg.classList.remove('loading');
    };
    tmp.src = src;
    lbCaption.textContent = `${LABELS[lbIndex]}  (${lbIndex + 1} / ${TOTAL})`;
    lbDots.forEach((d, i) => d.classList.toggle('active', i === lbIndex));
    goTo(lbIndex);
  }

  function openLightbox(n) {
    lbIndex = n;
    lbImg.src = `images/crownless-knight/ss${lbIndex + 1}.png`;
    lbImg.alt = LABELS[lbIndex];
    lbCaption.textContent = `${LABELS[lbIndex]}  (${lbIndex + 1} / ${TOTAL})`;
    lbDots.forEach((d, i) => d.classList.toggle('active', i === lbIndex));
    lightbox.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
    stopAuto();
  }

  function closeLightbox() {
    lightbox.classList.add('hidden');
    document.body.style.overflow = '';
    startAuto();
  }

  lbClose.addEventListener('click', closeLightbox);
  lbPrev.addEventListener('click', () => lbGoTo(lbIndex - 1));
  lbNext.addEventListener('click', () => lbGoTo(lbIndex + 1));
  lightbox.addEventListener('click', (e) => { if (e.target === lightbox) closeLightbox(); });

  document.addEventListener('keydown', (e) => {
    if (lightbox.classList.contains('hidden')) return;
    if (e.key === 'ArrowLeft')  lbGoTo(lbIndex - 1);
    if (e.key === 'ArrowRight') lbGoTo(lbIndex + 1);
    if (e.key === 'Escape')     closeLightbox();
  });

  let lbTouchX = 0;
  lightbox.addEventListener('touchstart', (e) => { lbTouchX = e.touches[0].clientX; }, { passive: true });
  lightbox.addEventListener('touchend', (e) => {
    const diff = lbTouchX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) lbGoTo(lbIndex + (diff > 0 ? 1 : -1));
  });
})();
