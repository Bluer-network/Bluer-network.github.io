'use strict';

const $ = id => document.getElementById(id);


function esc(s) {
  const d = document.createElement('div');
  d.textContent = String(s ?? '');
  return d.innerHTML;
}


const MODALS = {
  about: {
    title: 'About',
    body() {
      return `
        <p>Bluer's Network is a <strong style="color:#fff">Legacy Console Edition</strong> PVP server — lag-free, casual, and community-driven.</p>
        <p>Build, explore, and survive with friends on a server that runs around the clock.</p>
        <p style="margin-top:14px;color:#555;font-size:11px;">Running TU31 + Neolegacy. Check Discord for the latest details.</p>
      `;
    }
  },


  connect: {
    title: 'How to Connect',
    body() {
      return `
        <div class="steps">
          <div class="step"><span class="step-num">1</span><span>Join the Discord server via the button on the main screen</span></div>
          <div class="step"><span class="step-num">2</span><span>Complete verification in <span class="mc-code">#how-to-register</span></span></div>
          <div class="step"><span class="step-num">3</span><span>Post your in-game username in <span class="mc-code">#register-account</span></span></div>
          <div class="step"><span class="step-num">4</span><span>Join at <span class="mc-code">blues-smp.ddns.net</span> and run <span class="mc-code">/verify &lt;code&gt;</span></span></div>
        </div>
      `;
    }
  },


  team: {
    title: 'Server Team',
    body() {
      const members = [
        { name: 'Bluerworker', role: 'Owner & Dev' },
        { name: 'Viper',      role: 'Owner & Dev' },
        { name: 'dydymiku',       role: 'Administrator' },
        { name: 'Vin',     role: 'Administrator' },
        { name: 'Our Community',     role: 'Super Awesome Supporters / Players!' },
      ];
      return `<div class="team-grid">${members.map(m => `
        <div class="team-card">
          <span class="team-name">${esc(m.name)}</span>
          <span class="team-role">${esc(m.role)}</span>
        </div>`).join('')}</div>`;
    }
  },


  info: {
    title: 'Rules & FAQ',
    body() {
      const rules = ['No NSFW', 'No hacking', 'Respect everyone', 'Have fun'];
      const faqs = [
        { q: 'What versions?',      a: 'TU31 + Neo legacy. Check Discord for updates.' },
        { q: 'How do I join?',      a: 'Follow the How to Connect guide on the main page.' },
        { q: 'Is it 24/7?',         a: 'Yes.' },
        { q: 'Is it free to join?', a: 'Yes, join the Discord and verify to get access.' },
      ];
      return `
        <div class="rules-tags">${rules.map(r => `<span class="rule-tag">${esc(r)}</span>`).join('')}</div>
        <div class="faq">${faqs.map(f => `
          <div class="faq-item">
            <span class="faq-q">${esc(f.q)}</span>
            <span class="faq-a">${esc(f.a)}</span>
          </div>`).join('')}</div>`;
    }
  },


  secret: {
    title: '???',
    body() {
      return `
        <div class="secret-body">
          <span class="heart">&#x2764;</span>
          <p>Nothing here...</p>
          <p style="margin-top:10px;color:#2a2a2a">...or is there?</p>
        </div>`;
    }
  }
};


function openModal(key) {
  const def = MODALS[key];
  if (!def) return;
  $('modal-title').textContent = def.title;
  $('modal-body').innerHTML = typeof def.body === 'function' ? def.body() : def.body;
  $('modal').classList.add('open');
  document.body.style.overflow = 'hidden';
  if (typeof def.onOpen === 'function') def.onOpen();
}


function closeModal() {
  $('modal').classList.remove('open');
  document.body.style.overflow = '';
}


$('modal').addEventListener('click', e => { if (e.target === $('modal')) closeModal(); });
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });


window.openModal  = openModal;
window.closeModal = closeModal;


window.copyIP = function(btn) {
  const ip   = 'blues-.ddns.net';
  const orig = btn.innerHTML;
  navigator.clipboard.writeText(ip).then(() => {
    btn.textContent = 'Copied!';
    setTimeout(() => { btn.innerHTML = orig; }, 2000);
  }).catch(() => {
    const inp = document.createElement('input');
    inp.value = ip;
    document.body.appendChild(inp);
    inp.select();
    document.execCommand('copy');
    document.body.removeChild(inp);
    btn.textContent = 'Copied!';
    setTimeout(() => { btn.innerHTML = orig; }, 2000);
  });
};


window.toggleMusic = function() {
  const audio = $('bgm');
  const label = $('music-label');
  if (audio.paused) {
    audio.play().catch(() => {});
    label.textContent = 'Pause Music';
  } else {
    audio.pause();
    label.textContent = 'Play Music';
  }
};


async function fetchStatus() {
  const led   = $('status-led');
  const text  = $('status-text');
  const count = $('player-count');
  try {
    const res  = await fetch('/api/players');
    const data = await res.json();
    const now  = Math.floor(Date.now() / 1000);
    if (!data.time || (now - data.time) < 30) {
      led.className     = 'status-led online';
      text.textContent  = 'Online';
      text.className    = 'online';
      count.textContent = data.count ?? 0;
    } else { throw new Error(); }
  } catch {
    if (led)   led.className     = 'status-led offline';
    if (text)  { text.textContent = 'Offline'; text.className = 'offline'; }
    if (count) count.textContent  = '0';
  }
}


fetchStatus();
setInterval(fetchStatus, 10_000);


async function fetchChat(targetId) {
  const box = $(targetId);
  if (!box) return;
  try {
    const res  = await fetch('/api/chat');
    const data = await res.json();
    const msgs = data.messages ?? [];
    if (!msgs.length) { box.innerHTML = '<p class="chat-empty">No messages yet.</p>'; return; }
    box.innerHTML = msgs.map(m => {
      const cls   = m.type === 'join' ? 'chat-join' : m.type === 'quit' ? 'chat-quit' : 'chat-msg';
      const arrow = m.type === 'join' ? '&rarr; ' : m.type === 'quit' ? '&larr; ' : '';
      return `<div class="${cls}"><span class="chat-time">[${esc(m.time)}]</span>${arrow}<span class="chat-player">${esc(m.player)}</span> ${esc(m.message)}</div>`;
    }).join('');
    box.scrollTop = box.scrollHeight;
  } catch {
    if (box) box.innerHTML = '<p class="chat-empty">Could not load chat.</p>';
  }
}


setInterval(() => {
  const box = $('modal-chat-log');
  if (box) fetchChat('modal-chat-log');
}, 4_000);


(function() {
  const KONAMI = ['ArrowUp','ArrowUp','ArrowDown','ArrowDown','ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','b','a'];
  let idx = 0;
  document.addEventListener('keydown', e => {
    idx = (e.key === KONAMI[idx]) ? idx + 1 : 0;
    if (idx === KONAMI.length) {
      idx = 0;
      const orig = MODALS.secret.body;
      MODALS.secret.body = () => `
        <div class="secret-body">
          <span class="heart" style="font-size:54px">&#127918;</span>
          <p style="color:#ffff55;font-size:14px;margin-bottom:8px">&#x2191;&#x2191;&#x2193;&#x2193;&#x2190;&#x2192;&#x2190;&#x2192;BA</p>
          <p style="color:#777;font-size:11px">You found it.</p>
          <p style="margin-top:12px;color:#444;font-size:10px">Thanks for playing Blue's  &#x2764;</p>
        </div>`;
      openModal('secret');
      const restore = () => { MODALS.secret.body = orig; $('modal').removeEventListener('click', restore); };
      $('modal').addEventListener('click', restore);
    }
  });
})();


window.triggerBreakingEffect = function() {
  const overlay = $('crack-overlay');
  const canvas  = $('crack-canvas');
  if (!canvas || overlay.classList.contains('active')) return;

  const ctx = canvas.getContext('2d');
  const dpr = window.devicePixelRatio || 1;
  const w   = window.innerWidth;
  const h   = window.innerHeight;

  canvas.width  = w * dpr;
  canvas.height = h * dpr;
  ctx.scale(dpr, dpr);

  const cx = w / 2;
  const cy = h / 2;
  const maxDist = Math.hypot(cx, cy);

  const stages = Array.from({ length: 10 }, () => []);
  const numBranches = 8 + Math.floor(Math.random() * 5);

  for (let b = 0; b < numBranches; b++) {
    const baseAngle = (b / numBranches) * Math.PI * 2 + (Math.random() - 0.5) * 0.4;
    let angle = baseAngle;
    let x = cx, y = cy;
    const segs = 4 + Math.floor(Math.random() * 6);

    for (let s = 0; s < segs; s++) {
      angle += (Math.random() - 0.5) * 0.7;
      const len = 12 + Math.random() * 35;
      const nx = x + Math.cos(angle) * len;
      const ny = y + Math.sin(angle) * len;
      const dist = Math.hypot(nx - cx, ny - cy);
      const stageIdx = Math.min(9, Math.floor((dist / maxDist) * 12));

      stages[stageIdx].push([{ x, y }, { x: nx, y: ny }]);

      if (Math.random() < 0.35) {
        const subAngle = angle + (Math.random() - 0.5) * 1.4;
        const subLen   = 6 + Math.random() * 18;
        const sx = x + Math.cos(subAngle) * subLen;
        const sy = y + Math.sin(subAngle) * subLen;
        stages[Math.min(9, stageIdx + 1)].push([{ x, y }, { x: sx, y: sy }]);
      }

      x = nx;
      y = ny;
    }
  }

  let drawnLines = [];
  let stage = 0;

  function drawAll() {
    ctx.clearRect(0, 0, w, h);
    for (const line of drawnLines) {
      ctx.beginPath();
      ctx.strokeStyle = `rgba(0, 0, 0, ${0.45 + Math.random() * 0.25})`;
      ctx.lineWidth   = 1 + Math.random() * 2;
      ctx.lineCap     = 'round';
      ctx.lineJoin    = 'round';
      ctx.moveTo(line[0].x, line[0].y);
      for (let i = 1; i < line.length; i++) {
        ctx.lineTo(line[i].x, line[i].y);
      }
      ctx.stroke();
    }
  }

  overlay.classList.add('active');
  document.body.classList.add('shaking');
  document.body.style.setProperty('--shake-speed', '0.1s');

  const interval = setInterval(() => {
    drawnLines = drawnLines.concat(stages[stage]);
    drawAll();
    stage++;

    if (stage > 5) {
      document.body.style.setProperty('--shake-speed', '0.06s');
    }
    if (stage >= 10) {
      clearInterval(interval);
      setTimeout(() => shatterAndReveal(), 400);
    }
  }, 200);

  function shatterAndReveal() {
    overlay.classList.remove('active');

    const flash = $('break-flash');
    flash.classList.remove('flash');
    void flash.offsetWidth;
    flash.classList.add('flash');

    const screen    = document.querySelector('.screen');
    const rect      = screen.getBoundingClientRect();
    const container = $('shatter-container');

    const cols  = 8;
    const rows  = 10;
    const fragW = rect.width / cols;
    const fragH = rect.height / rows;

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const frag = document.createElement('div');
        frag.className = 'shatter-fragment';
        frag.style.left   = `${rect.left + c * fragW}px`;
        frag.style.top    = `${rect.top + r * fragH}px`;
        frag.style.width  = `${fragW + 1}px`;
        frag.style.height = `${fragH + 1}px`;

        const fragCx = rect.left + c * fragW + fragW / 2;
        const fragCy = rect.top + r * fragH + fragH / 2;
        const awayX  = (fragCx - (rect.left + rect.width / 2)) * 0.8;
        const awayY  = (fragCy - (rect.top + rect.height / 2)) * 0.6;
        const delay  = Math.random() * 300 + r * 30;
        const rotX   = (Math.random() - 0.5) * 300;
        const rotZ   = (Math.random() - 0.5) * 200;
        const transX = awayX + (Math.random() - 0.5) * 200;
        const transY = awayY + 150 + Math.random() * 350;

        frag.style.transitionDelay = `${delay}ms`;
        container.appendChild(frag);

        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            frag.style.transform = `translateY(${transY}px) translateX(${transX}px) rotateX(${rotX}deg) rotateZ(${rotZ}deg)`;
            frag.style.opacity   = '0';
          });
        });
      }
    }

    screen.style.transition = 'opacity 0.3s ease-out';
    screen.style.opacity    = '0';

    setTimeout(() => {
      document.body.classList.remove('shaking');
      $('secret-reveal').classList.add('visible');
    }, 800);
  }
};


window.resetBreakingEffect = function() {
  $('crack-overlay').classList.remove('active');
  $('break-flash').classList.remove('flash');
  $('shatter-container').innerHTML = '';
  $('secret-reveal').classList.remove('visible');
  document.querySelector('.screen').style.opacity = '1';
  document.body.classList.remove('shaking');
  const canvas = $('crack-canvas');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }
};
