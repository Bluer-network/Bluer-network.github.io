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
        <p>Blue's SMP is a <strong style="color:#fff">Legacy Console Edition</strong> survival server — lag-free, casual, and community-driven.</p>
        <p>Build, explore, and survive with friends on a server that runs around the clock.</p>
        <p style="margin-top:14px;color:#555;font-size:11px;">Running TU19 + Revelations. Check Discord for the latest details.</p>
      `;
    }
  },

  connect: {
    title: 'How to Connect',
    body() {
      return `
        <div class="steps">
          <div class="step"><span class="step-num">1</span><span>Join the Discord server via the button on the main screen</span></div>
          <div class="step"><span class="step-num">2</span><span>Complete verification in <span class="mc-code">#verify</span></span></div>
          <div class="step"><span class="step-num">3</span><span>Post your in-game username in <span class="mc-code">#username-verify</span></span></div>
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
        { name: 'Viper',      role: 'Owner' },
        { name: 'DyDyMiku',       role: 'Administrator' },
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
      const rules = ['No griefing', 'No hacking', 'Respect everyone', 'Have fun'];
      const faqs = [
        { q: 'What versions?',      a: 'TU19 + Revelations. Check Discord for updates.' },
        { q: 'How do I join?',      a: 'Follow the How to Connect guide on the main page.' },
        { q: 'Is it 24/7?',         a: 'Yes, the server runs around the clock.' },
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
  const ip   = 'blues-smp.ddns.net';
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
          <p style="margin-top:12px;color:#444;font-size:10px">Thanks for playing Blue's SMP &#x2764;</p>
        </div>`;
      openModal('secret');
      const restore = () => { MODALS.secret.body = orig; $('modal').removeEventListener('click', restore); };
      $('modal').addEventListener('click', restore);
    }
  });
})();
