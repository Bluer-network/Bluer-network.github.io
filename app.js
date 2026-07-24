// ===== Bluer Network — dashboard logic =====

const SERVER_IP = "bluer-network.ddns.net";
const SERVER_PORT = "25565";

// ---------- Modal content ----------
// Edit the text inside each string below to update what shows in each popup.
const MODAL_CONTENT = {
  connect: {
    title: "How to Connect",
    body: `
      <h3>Console (LCE)</h3>
      <ol>
        <li>Open Minecraft on your console.</li>
        <li>Go to <strong>Servers</strong> &rarr; <strong>Add Server</strong>.</li>
        <li>Enter the IP: <strong>${SERVER_IP}</strong></li>
        <li>Enter the port: <strong>${SERVER_PORT}</strong></li>
        <li>Save and join!</li>
      </ol>
    `
  },
  about: {
    title: "About",
    body: `
      <p>Bluer Network is a Legacy Console Edition PvP server &mdash; a network of a lot of things! Join the fight, team up, and climb the leaderboard.</p>
    `
  },
  team: {
    title: "Server Team",
    body: `
      <p>Meet the people who run Bluer Network:</p>
      <ul>
        <li>Founder &mdash; <em>add name</em></li>
        <li>Admin &mdash; <em>add name</em></li>
        <li>Moderator &mdash; <em>add name</em></li>
      </ul>
    `
  },
  chat: {
    title: "Live Chat",
    body: `<p>Live chat isn't hooked up yet. Head to our Discord to chat with the community in the meantime.</p>`
  },
  info: {
    title: "Rules & FAQ",
    body: `
      <h3>Rules</h3>
      <ol>
        <li>No cheating / hacked clients.</li>
        <li>No harassment or hate speech.</li>
        <li>No spamming chat.</li>
      </ol>
      <h3>FAQ</h3>
      <p><strong>Is this survival or pure PvP?</strong> PvP-focused.</p>
      <p><strong>Which console platforms work?</strong> Any LCE-supported console.</p>
    `
  },
  secret: {
    title: "???",
    body: `<p>You found the secret button. Nothing here yet &mdash; check back later.</p>`
  }
};

// ---------- Modal open/close ----------
function openModal(key) {
  const data = MODAL_CONTENT[key];
  if (!data) return;
  document.getElementById("modal-title").textContent = data.title;
  document.getElementById("modal-body").innerHTML = data.body;
  document.getElementById("modal").classList.add("open");
}

function closeModal() {
  document.getElementById("modal").classList.remove("open");
}

// close modal on background click
document.getElementById("modal").addEventListener("click", (e) => {
  if (e.target.id === "modal") closeModal();
});

// ---------- Copy IP ----------
function copyIP(btn) {
  const fullAddress = `${SERVER_IP}:${SERVER_PORT}`;
  navigator.clipboard.writeText(fullAddress).then(() => {
    const original = btn.textContent;
    btn.textContent = "Copied!";
    setTimeout(() => { btn.textContent = original; }, 1500);
  });
}

// ---------- Music toggle ----------
function toggleMusic() {
  const audio = document.getElementById("bgm");
  const label = document.getElementById("music-label");
  if (audio.paused) {
    audio.play();
    label.textContent = "Pause Music";
  } else {
    audio.pause();
    label.textContent = "Play Music";
  }
}

// ---------- Server status ----------
// NOTE: there is no public status API for Legacy Console Edition servers,
// so this cannot check "real" online/offline state automatically yet.
// It's left as a manual placeholder you can edit, or wire up later if you
// build your own status endpoint.
function setStatus(online, playerCount) {
  const led = document.getElementById("status-led");
  const text = document.getElementById("status-text");
  const count = document.getElementById("player-count");

  led.classList.remove("online", "offline");
  led.classList.add(online ? "online" : "offline");
  text.textContent = online ? "Online" : "Offline";
  count.textContent = online ? playerCount : "-";
}

// Placeholder call — edit these two values manually for now,
// or replace with a real fetch() to your own status endpoint later.
setStatus(true, 0);
