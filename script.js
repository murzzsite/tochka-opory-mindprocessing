const LEAD_ENDPOINT = 'https://lead-relay.leestygpt.workers.dev/lead/ZWSAGXV8EL';

(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  const yearEl = $('#year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- Шапка и бургер ---------- */
  const header = $('#header');
  const burger = $('#burger');
  const nav = $('#nav');
  const closeNav = () => {
    burger?.classList.remove('is-open');
    nav?.classList.remove('is-open');
    burger?.setAttribute('aria-expanded', 'false');
  };
  burger?.addEventListener('click', () => {
    const open = burger.classList.toggle('is-open');
    nav.classList.toggle('is-open', open);
    burger.setAttribute('aria-expanded', String(open));
  });
  $$('a', nav).forEach(a => a.addEventListener('click', closeNav));

  /* ---------- Заголовки по словам ---------- */
  const splitEl = el => {
    const lines = $$('.l', el);
    const targets = lines.length ? lines : [el];
    let i = 0;
    targets.forEach(t => {
      const words = t.textContent.trim().split(/\s+/);
      t.textContent = '';
      words.forEach((word, k) => {
        const w = document.createElement('span');
        w.className = 'w';
        w.setAttribute('aria-hidden', 'true');
        const inner = document.createElement('span');
        inner.textContent = word;
        inner.style.setProperty('--i', i++);
        w.appendChild(inner);
        t.appendChild(w);
        if (k < words.length - 1) t.appendChild(document.createTextNode(' '));
      });
    });
    if (!el.hasAttribute('aria-label')) el.setAttribute('aria-label', el.textContent.trim());
  };
  const splits = $$('[data-split]');
  splits.forEach(splitEl);

  /* ---------- Появление при прокрутке ---------- */
  $$('[data-stagger]').forEach(parent => {
    [...parent.children].forEach((child, i) => {
      if (!child.hasAttribute('data-reveal')) child.setAttribute('data-reveal', parent.classList.contains('topics__grid') ? 'roll' : '');
      child.style.setProperty('--d', i * 90 + 'ms');
    });
  });
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      e.target.classList.add('is-in');
      io.unobserve(e.target);
    });
  }, { threshold: 0.14, rootMargin: '0px 0px -6% 0px' });
  $$('[data-reveal], [data-split]').forEach(el => {
    if (el.closest('.hero')) return;
    io.observe(el);
  });

  /* ---------- Hero: сцена, затвор, наклон, параллакс ---------- */
  const stage = $('#stage');
  const heroEls = $$('.hero [data-reveal], .hero [data-split]');
  const heroStart = () => {
    stage?.classList.add('is-ready');
    heroEls.forEach((el, i) => {
      el.style.setProperty('--base', '250ms');
      setTimeout(() => el.classList.add('is-in'), 60 + i * 40);
    });
  };
  if (document.readyState === 'complete') requestAnimationFrame(heroStart);
  else window.addEventListener('load', () => requestAnimationFrame(heroStart));
  setTimeout(heroStart, 1800); // страховка

  const move = $('.stage__move');
  let ticking = false;
  const onScroll = () => {
    header?.classList.toggle('scrolled', window.scrollY > 8);
    if (!reduce && move && !ticking) {
      ticking = true;
      requestAnimationFrame(() => {
        move.style.setProperty('--sy', Math.min(window.scrollY, 900));
        ticking = false;
      });
    }
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  if (!reduce && fine && move) {
    const hero = $('.hero');
    hero.addEventListener('pointermove', e => {
      const r = hero.getBoundingClientRect();
      move.style.setProperty('--mx', (((e.clientX - r.left) / r.width) * 2 - 1).toFixed(3));
      move.style.setProperty('--my', (((e.clientY - r.top) / r.height) * 2 - 1).toFixed(3));
    });
    hero.addEventListener('pointerleave', () => {
      move.style.setProperty('--mx', 0);
      move.style.setProperty('--my', 0);
    });
  }

  /* ---------- Магнитные кнопки ---------- */
  if (!reduce && fine) {
    $$('.btn').forEach(btn => {
      btn.addEventListener('pointermove', e => {
        const r = btn.getBoundingClientRect();
        const x = (e.clientX - r.left - r.width / 2) / r.width;
        const y = (e.clientY - r.top - r.height / 2) / r.height;
        btn.style.transform = `translate(${x * 10}px, ${y * 8}px)`;
      });
      btn.addEventListener('pointerleave', () => { btn.style.transform = ''; });
    });
  }

  /* ---------- Счётчики цен ---------- */
  const counters = $$('[data-count]');
  if (!reduce) counters.forEach(c => { c.textContent = '0'; });
  const countIO = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      const el = e.target;
      const target = parseInt(el.dataset.count, 10);
      countIO.unobserve(el);
      if (reduce) { el.textContent = target.toLocaleString('ru-RU'); return; }
      const dur = 1300, t0 = performance.now();
      const tick = t => {
        const p = Math.min(1, (t - t0) / dur);
        el.textContent = Math.round(target * (1 - Math.pow(1 - p, 4))).toLocaleString('ru-RU');
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    });
  }, { threshold: 0.5 });
  counters.forEach(c => countIO.observe(c));

  /* ---------- Аккордеон «Как проходит работа» ---------- */
  const panels = $$('.acc__p');
  panels.forEach(p => {
    $('.acc__tab', p).addEventListener('click', () => {
      panels.forEach(o => {
        const open = o === p;
        o.classList.toggle('is-open', open);
        $('.acc__tab', o).setAttribute('aria-expanded', String(open));
      });
    });
  });

  /* ---------- FAQ ---------- */
  const cards = $$('.card');
  cards.forEach(card => {
    $('.card__q', card).addEventListener('click', () => {
      const wasOpen = card.classList.contains('is-open');
      cards.forEach(c => {
        c.classList.remove('is-open');
        $('.card__q', c).setAttribute('aria-expanded', 'false');
      });
      if (!wasOpen) {
        card.classList.add('is-open');
        $('.card__q', card).setAttribute('aria-expanded', 'true');
      }
    });
  });

  /* ---------- Живая вещь: стопка опор ---------- */
  const svg = $('#cairnSvg');
  const NS = 'http://www.w3.org/2000/svg';
  const W = [300, 262, 228, 194, 160, 128];
  const H = [78, 72, 66, 60, 54, 48];
  const FILL = ['#f0cfae', '#fbfbf8', '#a9bfa3', '#3f6469', '#e3b68c', '#c5d4c0'];
  const JX = [0, -7, 9, -6, 5, -3];
  const JR = [0, -1.6, 2.1, -2, 1.6, -1];
  const BASE = 498;
  const pebblePath = (w, h) => {
    const a = w / 2, b = h / 2;
    return `M${-a} 0C${-a} ${-b * 1.24} ${-a * .3} ${-b * 1.1} ${a * .08} ${-b * 1.1}` +
      `C${a * .62} ${-b * 1.08} ${a} ${-b * .7} ${a} 0` +
      `C${a} ${b * .95} ${a * .4} ${b} ${-a * .08} ${b}C${-a * .6} ${b} ${-a} ${b * .85} ${-a} 0Z`;
  };
  const slotY = k => {
    let y = BASE;
    for (let j = 0; j < k; j++) y -= H[j] * 0.84;
    return y - H[k] / 2;
  };
  const stones = [];
  if (svg) {
    const sun = document.createElementNS(NS, 'circle');
    sun.setAttribute('class', 'sun');
    sun.setAttribute('cx', 220); sun.setAttribute('cy', 250); sun.setAttribute('r', 84);
    sun.setAttribute('fill', '#f0cfae');
    sun.style.transform = 'translateY(200px)';
    sun.style.opacity = '1';
    svg.appendChild(sun);
    const ground = document.createElementNS(NS, 'path');
    ground.setAttribute('d', pebblePath(420, 40));
    ground.setAttribute('fill', '#b7ccb0');
    ground.style.transform = `translate(220px, ${BASE + 14}px)`;
    svg.appendChild(ground);
    for (let k = 0; k < 6; k++) {
      const gh = document.createElementNS(NS, 'path');
      gh.setAttribute('class', 'ghost');
      gh.setAttribute('d', pebblePath(W[k], H[k]));
      gh.style.transform = `translate(${220 + JX[k]}px, ${slotY(k)}px) rotate(${JR[k]}deg)`;
      svg.appendChild(gh);
    }
    for (let k = 0; k < 6; k++) {
      const g = document.createElementNS(NS, 'path');
      g.setAttribute('class', 'stone');
      g.setAttribute('d', pebblePath(W[k], H[k]));
      g.setAttribute('fill', FILL[k]);
      g.style.transform = 'translate(220px, -160px) rotate(-16deg)';
      g.style.opacity = '0';
      svg.appendChild(g);
      stones.push(g);
    }
    if (reduce) $$('.stone, .sun', svg).forEach(s => { s.style.transition = 'none'; });
  }

  const chips = $$('.chip input');
  const sum = $('#cairnSum');
  const topicsField = $('#f-topics');
  const picked = [];
  const renderCairn = () => {
    stones.forEach((g, k) => {
      if (k < picked.length) {
        g.style.transform = `translate(${220 + JX[k]}px, ${slotY(k)}px) rotate(${JR[k]}deg)`;
        g.style.opacity = '1';
      } else {
        g.style.transform = 'translate(220px, -160px) rotate(-16deg)';
        g.style.opacity = '0';
      }
    });
    const sun = $('.sun', svg);
    if (sun) {
      const n = picked.length;
      sun.style.transform = `translateY(${Math.max(0, 200 - n * 40)}px)`;
    }
    if (svg && !reduce) {
      svg.classList.remove('wobble');
      void svg.getBoundingClientRect();
      svg.classList.add('wobble');
    }
    const labels = picked.map(i => chips[i].value);
    if (sum) {
      sum.textContent = picked.length
        ? `Отмечено: ${picked.length}. Это можно взять в работу на сессии.`
        : 'Отметьте то, что откликается.';
    }
    if (topicsField) topicsField.value = labels.join('; ');
  };
  chips.forEach((c, i) => {
    c.addEventListener('change', () => {
      if (c.checked) picked.push(i);
      else picked.splice(picked.indexOf(i), 1);
      renderCairn();
    });
  });
  if (svg) renderCairn();

  /* ---------- Стопка-прогресс сбоку ---------- */
  const trail = $('#trail');
  if (trail) {
    const tw = [40, 32, 25, 19, 14, 10, 7];
    const tc = ['#e3b68c', '#b7ccb0', '#c9dce0', '#3f6469', '#f0cfae', '#a9bfa3', '#1d2b2e'];
    let y = 0;
    tw.forEach((w, k) => {
      const s = document.createElement('i');
      const h = Math.round(w * 0.46);
      s.style.cssText = `width:${w}px;height:${h}px;bottom:${y}px;background:${tc[k]};--rot:${[0, -3, 4, -4, 3, -2, 0][k]}deg`;
      y += h - 3;
      trail.appendChild(s);
    });
    const dots = $$('i', trail);
    const marks = $$('[data-trail]');
    const trailIO = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (!e.isIntersecting) return;
        const idx = +e.target.dataset.trail;
        dots.forEach((d, k) => { if (k <= idx) d.classList.add('on'); });
      });
    }, { threshold: 0.2 });
    marks.forEach(m => trailIO.observe(m));
  }

  /* ---------- FAB прячется у подвала ---------- */
  const fab = $('.fab');
  const footerEl = $('#footer');
  if (fab && footerEl) {
    new IntersectionObserver(es => es.forEach(e => fab.classList.toggle('is-hidden', e.isIntersecting)), { threshold: 0.15 }).observe(footerEl);
  }

  /* ---------- Выбор тарифа ---------- */
  const planField = $('#f-plan');
  $$('[data-plan]').forEach(a => a.addEventListener('click', () => { if (planField) planField.value = a.dataset.plan; }));

  /* ---------- Форма → Cloudflare Worker → Telegram ---------- */
  const form = $('#leadForm');
  const status = $('#formStatus');
  form?.addEventListener('submit', async e => {
    e.preventDefault();
    const btn = form.querySelector('button[type="submit"]');
    const orig = btn.textContent;

    const fd = new FormData(form);
    const payload = {};
    fd.forEach((v, k) => { payload[k] = typeof v === 'string' ? v.trim() : v; });
    if (payload._gotcha) return;

    $$('.field', form).forEach(f => f.classList.remove('err'));
    const bad = [];
    if (!payload.name) bad.push('name');
    if (!payload.contact) bad.push('contact');
    if (bad.length) {
      bad.forEach(n => form.querySelector(`[name="${n}"]`).closest('.field').classList.add('err'));
      if (status) status.textContent = 'Укажите имя и телефон или ник в мессенджере.';
      return;
    }

    const digits = payload.contact.replace(/\D/g, '');
    if (digits.length >= 10 && !/[a-zа-я@]/i.test(payload.contact)) payload.phone = payload.contact;
    payload.comment = [
      payload.plan && 'Выбрано: ' + payload.plan,
      payload.topics && 'Что откликнулось: ' + payload.topics,
      payload.comment
    ].filter(Boolean).join('\n');
    delete payload.plan;
    delete payload.topics;

    btn.disabled = true;
    btn.textContent = 'Отправляем...';
    if (status) status.textContent = '';
    try {
      const resp = await fetch(LEAD_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!resp.ok) throw new Error('HTTP ' + resp.status);
      btn.textContent = 'Заявка отправлена';
      if (status) status.textContent = 'Спасибо! Я свяжусь с вами и согласую время сессии.';
      form.reset();
      chips.forEach(c => { c.checked = false; });
      picked.length = 0;
      renderCairn();
    } catch (err) {
      console.error(err);
      btn.textContent = 'Ошибка, попробуйте ещё раз';
      if (status) status.textContent = 'Не удалось отправить. Позвоните +7 905 278-76-53 или напишите во ВКонтакте.';
    } finally {
      setTimeout(() => { btn.textContent = orig; btn.disabled = false; }, 3500);
    }
  });
})();
