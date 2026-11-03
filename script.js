(function () {
  'use strict';

  var navbar = document.getElementById('navbar');
  var hamburger = document.getElementById('hamburger');
  var navLinks = document.getElementById('navLinks');
  var navItems = document.querySelectorAll('.nav-link');
  var backToTop = document.getElementById('backToTop');
  var yearEl = document.getElementById('year');
  var ticketForm = document.getElementById('ticketForm');
  var formMsg = document.getElementById('formMsg');

  /* ---------- Navbar ---------- */
  function handleScroll() {
    var y = window.scrollY || window.pageYOffset;

    if (navbar) navbar.classList.toggle('scrolled', y > 40);
    if (backToTop) backToTop.classList.toggle('visible', y > 500);

    var current = '';
    document.querySelectorAll('section[id]').forEach(function (section) {
      if (y >= section.offsetTop - 140) current = section.id;
    });

    navItems.forEach(function (link) {
      link.classList.toggle('active', link.getAttribute('href') === '#' + current);
    });
  }

  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll();

  if (hamburger && navLinks) {
    hamburger.addEventListener('click', function () {
      var open = navLinks.classList.toggle('open');
      hamburger.classList.toggle('active', open);
      hamburger.setAttribute('aria-expanded', String(open));
      document.body.style.overflow = open ? 'hidden' : '';
    });

    navItems.forEach(function (link) {
      link.addEventListener('click', function () {
        navLinks.classList.remove('open');
        hamburger.classList.remove('active');
        hamburger.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      });
    });
  }

  if (backToTop) {
    backToTop.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /* ---------- Countdown ---------- */
  var timer = document.getElementById('timer');
  var daysEl = document.getElementById('days');
  var hoursEl = document.getElementById('hours');
  var minutesEl = document.getElementById('minutes');
  var secondsEl = document.getElementById('seconds');
  var noteEl = document.getElementById('countdownNote');
  var progressEl = document.getElementById('progressBar');

  var target = timer ? new Date(timer.getAttribute('data-target')) : null;
  var campaignStart = new Date(2026, 0, 1, 0, 0, 0);
  var previous = {};
  var interval = null;

  function pad(value, size) {
    return String(value).padStart(size, '0');
  }

  function flip(el, value, key) {
    if (!el || previous[key] === value) return;
    previous[key] = value;
    el.textContent = value;
    el.animate(
      [
        { transform: 'translateY(-18%)', opacity: 0.25, filter: 'blur(4px)' },
        { transform: 'translateY(0)', opacity: 1, filter: 'blur(0)' }
      ],
      { duration: 420, easing: 'cubic-bezier(0.22, 1, 0.36, 1)' }
    );
  }

  function renderCountdown() {
    if (!target) return;

    var now = new Date();
    var diff = target.getTime() - now.getTime();

    if (diff <= 0) {
      flip(daysEl, '000', 'd');
      flip(hoursEl, '00', 'h');
      flip(minutesEl, '00', 'm');
      flip(secondsEl, '00', 's');
      if (noteEl) {
        noteEl.textContent = 'Doomsday is here.';
        noteEl.classList.add('urgent');
      }
      if (progressEl) progressEl.style.width = '100%';
      if (timer) timer.classList.add('is-done');
      if (interval) clearInterval(interval);
      return;
    }

    var totalSeconds = Math.floor(diff / 1000);
    var days = Math.floor(totalSeconds / 86400);
    var hours = Math.floor((totalSeconds % 86400) / 3600);
    var minutes = Math.floor((totalSeconds % 3600) / 60);
    var seconds = totalSeconds % 60;

    flip(daysEl, pad(days, 3), 'd');
    flip(hoursEl, pad(hours, 2), 'h');
    flip(minutesEl, pad(minutes, 2), 'm');
    flip(secondsEl, pad(seconds, 2), 's');

    if (noteEl) {
      if (days === 0) {
        noteEl.textContent = 'The final hours are here.';
        noteEl.classList.add('urgent');
      } else if (days < 30) {
        noteEl.textContent = 'The clock is running out.';
        noteEl.classList.add('urgent');
      } else {
        noteEl.textContent = 'Tick. Tock.';
        noteEl.classList.remove('urgent');
      }
    }

    if (progressEl) {
      var span = target.getTime() - campaignStart.getTime();
      var done = now.getTime() - campaignStart.getTime();
      var pct = Math.min(100, Math.max(0, (done / span) * 100));
      progressEl.style.width = pct.toFixed(2) + '%';
    }
  }

  if (target) {
    renderCountdown();
    interval = setInterval(renderCountdown, 1000);
  }

  /* ---------- Reveal on scroll ---------- */
  var revealEls = document.querySelectorAll('.reveal');

  if ('IntersectionObserver' in window) {
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('in');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.14, rootMargin: '0px 0px -60px 0px' }
    );

    revealEls.forEach(function (el) { observer.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('in'); });
  }

  /* ---------- Embers ---------- */
  var canvas = document.getElementById('embers');
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (canvas && canvas.getContext && !reduceMotion) {
    var ctx = canvas.getContext('2d');
    var particles = [];
    var width = 0;
    var height = 0;
    var dpr = Math.min(window.devicePixelRatio || 1, 2);

    function resizeCanvas() {
      var rect = canvas.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function makeParticle(randomY) {
      return {
        x: Math.random() * width,
        y: randomY ? Math.random() * height : height + 12,
        r: 0.6 + Math.random() * 1.9,
        vy: 0.18 + Math.random() * 0.65,
        vx: (Math.random() - 0.5) * 0.32,
        alpha: 0.15 + Math.random() * 0.55,
        hue: Math.random() > 0.5 ? 145 : 162,
        wobble: Math.random() * Math.PI * 2
      };
    }

    function seed() {
      var count = Math.round(Math.min(110, Math.max(36, width / 14)));
      particles = [];
      for (var i = 0; i < count; i++) particles.push(makeParticle(true));
    }

    function draw() {
      ctx.clearRect(0, 0, width, height);

      for (var i = 0; i < particles.length; i++) {
        var p = particles[i];
        p.wobble += 0.012;
        p.y -= p.vy;
        p.x += p.vx + Math.sin(p.wobble) * 0.28;

        if (p.y < -20) {
          particles[i] = makeParticle(false);
          continue;
        }

        var glow = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 6);
        glow.addColorStop(0, 'hsla(' + p.hue + ', 88%, 62%, ' + p.alpha + ')');
        glow.addColorStop(1, 'hsla(' + p.hue + ', 88%, 50%, 0)');

        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r * 6, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = 'hsla(' + p.hue + ', 95%, 78%, ' + Math.min(1, p.alpha + 0.28) + ')';
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r * 0.7, 0, Math.PI * 2);
        ctx.fill();
      }

      requestAnimationFrame(draw);
    }

    resizeCanvas();
    seed();
    draw();

    var resizeTimer;
    window.addEventListener('resize', function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(function () {
        resizeCanvas();
        seed();
      }, 180);
    });
  }

  /* ---------- Cast photos ---------- */
  document.querySelectorAll('.cast-photo img').forEach(function (img) {
    function markMissing() {
      var holder = img.closest('.cast-photo');
      if (holder) holder.classList.add('no-photo');
    }

    img.addEventListener('error', markMissing);

    if (img.complete && img.naturalWidth === 0) markMissing();
  });

  /* ---------- Ticket form ---------- */
  if (ticketForm && formMsg) {
    ticketForm.addEventListener('submit', function (event) {
      event.preventDefault();

      var name = ticketForm.querySelector('#name');
      var email = ticketForm.querySelector('#email');

      if (!name.value.trim() || !email.value.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
        formMsg.textContent = 'Please enter a valid name and email.';
        formMsg.style.color = '#f0a35e';
        formMsg.classList.add('show');
        return;
      }

      var button = ticketForm.querySelector('button[type="submit"]');
      var label = button.querySelector('span');
      var original = label.textContent;

      label.textContent = 'Seats Reserved';
      button.disabled = true;
      formMsg.style.color = '';
      formMsg.textContent = 'See you on December 18, 2026 at 10:00 AM.';
      formMsg.classList.add('show');

      setTimeout(function () {
        label.textContent = original;
        button.disabled = false;
        formMsg.classList.remove('show');
        ticketForm.reset();
      }, 4200);
    });
  }

  if (yearEl) yearEl.textContent = String(new Date().getFullYear());
})();
