/* ============================================
   SMILE BEST DENTAL — MAIN JS
   Lenis, Cursor, Navbar, Loader, WhatsApp
   ============================================ */

// ── LENIS SMOOTH SCROLL ──
let lenis;

function initLenis() {
  try {
    lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      direction: 'vertical',
      gestureDirection: 'vertical',
      smooth: true,
      smoothTouch: false,
      touchMultiplier: 2,
    });

    if (typeof ScrollTrigger !== 'undefined') {
      lenis.on('scroll', ScrollTrigger.update);
    }

    if (typeof gsap !== 'undefined') {
      gsap.ticker.add((time) => {
        lenis.raf(time * 1000);
      });
      gsap.ticker.lagSmoothing(0);
    } else {
      // Fallback RAF loop for Lenis without GSAP
      function raf(time) {
        lenis.raf(time);
        requestAnimationFrame(raf);
      }
      requestAnimationFrame(raf);
    }
  } catch (e) {
    console.warn('Lenis failed to init:', e);
  }
}

// ── CUSTOM CURSOR ──
function initCursor() {
  const dot = document.getElementById('cursor-dot');
  const ring = document.getElementById('cursor-ring');
  if (!dot || !ring) return;

  let mouseX = 0, mouseY = 0;
  let ringX = 0, ringY = 0;

  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    dot.style.left = mouseX + 'px';
    dot.style.top = mouseY + 'px';
  });

  // Ring follows with lag
  function animateRing() {
    ringX += (mouseX - ringX) * 0.12;
    ringY += (mouseY - ringY) * 0.12;
    ring.style.left = ringX + 'px';
    ring.style.top = ringY + 'px';
    requestAnimationFrame(animateRing);
  }
  animateRing();

  // Hover state
  const hoverEls = document.querySelectorAll('a, button, .ba-card, .service-card, .ig-post, .team-card, .specialty-card');
  hoverEls.forEach(el => {
    el.addEventListener('mouseenter', () => ring.classList.add('active'));
    el.addEventListener('mouseleave', () => ring.classList.remove('active'));
  });

  // Magnetic buttons
  document.querySelectorAll('.magnetic').forEach(btn => {
    btn.addEventListener('mousemove', (e) => {
      const rect = btn.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      gsap.to(btn, { x: x * 0.35, y: y * 0.35, duration: 0.4, ease: 'power2.out' });
    });

    btn.addEventListener('mouseleave', () => {
      gsap.to(btn, { x: 0, y: 0, duration: 0.6, ease: 'elastic.out(1.2, 0.4)' });
    });
  });
}

// ── SCROLL PROGRESS BAR ──
function initScrollProgress() {
  const bar = document.getElementById('scroll-progress');
  if (!bar) return;

  lenis && lenis.on('scroll', ({ progress }) => {
    bar.style.height = (progress * 100) + '%';
  });

  window.addEventListener('scroll', () => {
    const docH = document.documentElement.scrollHeight - window.innerHeight;
    const progress = window.scrollY / docH;
    bar.style.height = (progress * 100) + '%';
  });
}

// ── NAVBAR ──
function initNavbar() {
  const nav = document.getElementById('navbar');
  const utility = document.getElementById('nav-utility');
  if (!nav) return;

  let lastY = 0;

  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    nav.classList.toggle('scrolled', y > 60);
    if (utility) {
      utility.classList.toggle('hidden', y > lastY && y > 200);
    }
    lastY = y;

    // Active nav link
    const sections = document.querySelectorAll('[data-section]');
    sections.forEach(section => {
      const rect = section.getBoundingClientRect();
      if (rect.top <= 200 && rect.bottom >= 200) {
        document.querySelectorAll('.nav-links a').forEach(a => a.classList.remove('active'));
        const id = section.dataset.section;
        const activeLink = document.querySelector(`.nav-links a[href="#${id}"]`);
        if (activeLink) activeLink.classList.add('active');
      }
    });
  });

  // Mark current page
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a').forEach(a => {
    const href = a.getAttribute('href');
    if (href && href.includes(currentPage.replace('.html', ''))) {
      a.classList.add('active');
    }
  });

  // Hamburger
  const hamburger = document.querySelector('.hamburger');
  const mobileNav = document.getElementById('mobile-nav');
  if (hamburger && mobileNav) {
    hamburger.addEventListener('click', () => {
      hamburger.classList.toggle('open');
      mobileNav.classList.toggle('open');
      document.body.style.overflow = mobileNav.classList.contains('open') ? 'hidden' : '';
    });

    mobileNav.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => {
        hamburger.classList.remove('open');
        mobileNav.classList.remove('open');
        document.body.style.overflow = '';
      });
    });
  }
}

// ── LOADER ──
function revealPage() {
  const loader = document.getElementById('loader');
  const curtainLeft = document.getElementById('curtain-left');
  const curtainRight = document.getElementById('curtain-right');
  if (!loader || loader.style.display === 'none') return;

  loader.style.transition = 'opacity 0.5s ease';
  loader.style.opacity = '0';

  setTimeout(() => {
    loader.style.display = 'none';
    if (curtainLeft) curtainLeft.classList.add('open');
    if (curtainRight) curtainRight.classList.add('open');
    setTimeout(() => {
      if (curtainLeft) curtainLeft.style.display = 'none';
      if (curtainRight) curtainRight.style.display = 'none';
    }, 900);
  }, 500);
}

function initLoader() {
  const loader = document.getElementById('loader');
  if (!loader) return;

  // Counter animation
  const counter = document.getElementById('loader-counter');
  let count = 0;
  const interval = setInterval(() => {
    count += Math.floor(Math.random() * 8) + 3;
    if (count >= 100) {
      count = 100;
      clearInterval(interval);
    }
    if (counter) counter.textContent = count + '%';
  }, 40);

  // Reveal after tooth draws
  setTimeout(revealPage, 2200);

  // Hard fallback — force reveal after 6s no matter what
  setTimeout(revealPage, 6000);
}

// ── MARQUEE ──
function initMarquee() {
  const tracks = document.querySelectorAll('.marquee-track');
  tracks.forEach(track => {
    // Clone for infinite loop
    const clone = track.cloneNode(true);
    track.parentElement.appendChild(clone);
  });
}

// ── MOBILE DEVICE PARALLAX ──
function initDeviceParallax() {
  if (window.innerWidth > 768) return;
  if (!window.DeviceOrientationEvent) return;

  window.addEventListener('deviceorientation', (e) => {
    const elements = document.querySelectorAll('.device-parallax');
    const tiltX = (e.gamma || 0) / 30;
    const tiltY = (e.beta || 0) / 60;

    elements.forEach((el, i) => {
      const depth = (i + 1) * 0.3;
      el.style.transform = `translate(${tiltX * 10 * depth}px, ${tiltY * 5 * depth}px)`;
    });
  });
}

// ── INSTAGRAM GRID ──
function initIGGrid() {
  const grid = document.querySelector('.ig-grid');
  if (!grid) return;

  // Use placeholder gradient images since we can't access IG API
  const placeholders = [
    'linear-gradient(135deg, #1A1A2E, #4A90D9)',
    'linear-gradient(135deg, #0C0C0C, #C9963A)',
    'linear-gradient(135deg, #1A1A2E, #C9963A)',
    'linear-gradient(135deg, #4A90D9, #1A1A2E)',
    'linear-gradient(135deg, #C9963A, #0C0C0C)',
    'linear-gradient(135deg, #0C0C0C, #4A90D9)',
  ];

  // Posts are already in HTML — just ensure overlay works
}

// ── LIGHTBOX ──
function initLightbox() {
  const lightbox = document.getElementById('lightbox');
  if (!lightbox) return;

  const cards = document.querySelectorAll('.ba-card[data-lightbox]');
  let currentIndex = 0;

  const transformations = Array.from(cards).map(card => ({
    before: card.dataset.before || card.querySelector('.ba-before img')?.src,
    after: card.dataset.after || card.querySelector('.ba-after img')?.src,
    treatment: card.dataset.treatment || '',
    duration: card.dataset.duration || '',
    name: card.dataset.name || '',
  }));

  function openLightbox(index) {
    currentIndex = index;
    const t = transformations[index];
    if (!t) return;

    lightbox.querySelector('.lb-before').src = t.before || '';
    lightbox.querySelector('.lb-after').src = t.after || '';
    lightbox.querySelector('.lb-treatment').textContent = t.treatment;
    lightbox.querySelector('.lb-duration').textContent = t.duration;
    lightbox.querySelector('.lb-name').textContent = t.name;

    lightbox.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    lightbox.classList.remove('open');
    document.body.style.overflow = '';
  }

  cards.forEach((card, i) => {
    card.addEventListener('click', () => openLightbox(i));
  });

  lightbox.querySelector('.lightbox-close')?.addEventListener('click', closeLightbox);
  lightbox.addEventListener('click', (e) => { if (e.target === lightbox) closeLightbox(); });

  lightbox.querySelector('.lightbox-nav.prev')?.addEventListener('click', () => {
    openLightbox((currentIndex - 1 + transformations.length) % transformations.length);
  });

  lightbox.querySelector('.lightbox-nav.next')?.addEventListener('click', () => {
    openLightbox((currentIndex + 1) % transformations.length);
  });

  document.addEventListener('keydown', (e) => {
    if (!lightbox.classList.contains('open')) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') openLightbox((currentIndex - 1 + transformations.length) % transformations.length);
    if (e.key === 'ArrowRight') openLightbox((currentIndex + 1) % transformations.length);
  });
}

// ── TRANSFORMATION FILTERS ──
function initFilters() {
  const tabs = document.querySelectorAll('.filter-tab');
  const cards = document.querySelectorAll('.ba-card[data-category]');
  if (!tabs.length) return;

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      const cat = tab.dataset.filter;
      cards.forEach(card => {
        const show = cat === 'all' || card.dataset.category === cat;
        gsap.to(card, {
          opacity: show ? 1 : 0,
          scale: show ? 1 : 0.95,
          duration: 0.4,
          ease: 'power2.inOut',
          onComplete: () => {
            card.style.display = show ? '' : 'none';
          }
        });
        if (show) card.style.display = '';
      });
    });
  });
}

// ── CONTACT FORM ──
function initContactForm() {
  const form = document.getElementById('contact-form');
  if (!form) return;

  // Floating labels fix for select
  form.querySelectorAll('select').forEach(sel => {
    sel.addEventListener('change', () => {
      sel.classList.toggle('has-value', sel.value !== '');
    });
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = form.querySelector('[type="submit"]');
    btn.textContent = 'Sending...';

    try {
      const res = await fetch(form.action, {
        method: 'POST',
        body: new FormData(form),
        headers: { Accept: 'application/json' },
      });

      if (res.ok) {
        btn.textContent = 'Message Sent!';
        btn.style.background = '#25D366';
        form.reset();
      } else {
        btn.textContent = 'Try Again';
      }
    } catch {
      btn.textContent = 'Try Again';
    }

    setTimeout(() => {
      btn.textContent = 'Book My Appointment';
      btn.style.background = '';
    }, 4000);
  });
}

// ── INIT ALL ──
document.addEventListener('DOMContentLoaded', () => {
  // Loader must run first — before anything else that could throw
  initLoader();
  try { initLenis(); } catch(e) { console.warn('Lenis:', e); }
  try { initCursor(); } catch(e) {}
  try { initScrollProgress(); } catch(e) {}
  try { initNavbar(); } catch(e) {}
  try { initMarquee(); } catch(e) {}
  try { initDeviceParallax(); } catch(e) {}
  try { initLightbox(); } catch(e) {}
  try { initFilters(); } catch(e) {}
  try { initContactForm(); } catch(e) {}
});
