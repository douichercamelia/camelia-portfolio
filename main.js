const canvas = document.getElementById("bg-canvas");
const ctx = canvas.getContext("2d");

let W = window.innerWidth;
let H = window.innerHeight;
canvas.width = W;
canvas.height = H;

const TOKENS = [
  "SSH", "TLS", "HTTP", "TCP", "UDP", "DNS", "JWT", "AES",
  "NMAP", "SQL", "XSS", "CSRF", "ROOT", "HASH", "SIEM", "IOC",
  "443", "8080", "22", "AUTH", "KALI", "OSINT", "SOC", "YARA"
];

const COLORS = {
  bg1: "#05070A",
  bg2: "#0B0F14",
  gridMinor: "rgba(124,255,0,0.035)",
  gridMajor: "rgba(255,176,0,0.07)",
  hex: "rgba(124,255,0,0.12)",
  token: "rgba(255,176,0,0.18)",
  tokenAlt: "rgba(255,77,109,0.16)",
  scan: "rgba(124,255,0,0.06)",
  pulse: "rgba(124,255,0,0.7)",
  pulseGlow: "rgba(124,255,0,0.18)",
  hud: "rgba(255,176,0,0.08)",
  alert: "rgba(255,77,109,0.18)"
};

let hexRows = [];
let floatingTokens = [];
let pulses = [];
let scanBars = [];
let hudRects = [];

function rand(min, max) {
  return Math.random() * (max - min) + min;
}

function makeHexRow(y) {
  const chars = "0123456789ABCDEF";
  let text = "";
  const count = Math.floor(W / 22);

  for (let i = 0; i < count; i++) {
    text += chars[Math.floor(Math.random() * chars.length)] + " ";
  }

  return {
    x: rand(-40, 10),
    y,
    text,
    alpha: rand(0.04, 0.12)
  };
}

function makeToken() {
  return {
    text: TOKENS[Math.floor(Math.random() * TOKENS.length)],
    x: rand(0, W),
    y: rand(0, H),
    vx: rand(-0.05, 0.05),
    vy: rand(-0.02, 0.02),
    alpha: rand(0.08, 0.2),
    size: rand(10, 14),
    alt: Math.random() > 0.7
  };
}

function makePulse() {
  const horizontal = Math.random() > 0.35;

  return {
    horizontal,
    x: rand(0, W),
    y: rand(0, H),
    length: rand(18, 90),
    speed: rand(0.7, 1.8),
    thickness: rand(1, 2.5),
    alpha: rand(0.2, 0.7)
  };
}

function makeScanBar() {
  return {
    y: rand(0, H),
    h: rand(30, 90),
    alpha: rand(0.018, 0.04),
    speed: rand(0.08, 0.22)
  };
}

function makeHudRect() {
  return {
    x: rand(20, W - 180),
    y: rand(20, H - 120),
    w: rand(80, 220),
    h: rand(40, 120),
    alpha: rand(0.04, 0.08)
  };
}

function initScene() {
  hexRows = [];
  floatingTokens = [];
  pulses = [];
  scanBars = [];
  hudRects = [];

  const rowCount = Math.floor(H / 80);
  for (let i = 0; i < rowCount; i++) {
    hexRows.push(makeHexRow(50 + i * 80));
  }

  const tokenCount = Math.min(28, Math.floor(W / 55));
  for (let i = 0; i < tokenCount; i++) {
    floatingTokens.push(makeToken());
  }

  const pulseCount = Math.min(38, Math.floor(W / 45));
  for (let i = 0; i < pulseCount; i++) {
    pulses.push(makePulse());
  }

  for (let i = 0; i < 5; i++) {
    scanBars.push(makeScanBar());
  }

  for (let i = 0; i < 8; i++) {
    hudRects.push(makeHudRect());
  }
}

function drawBackground() {
  const grad = ctx.createLinearGradient(0, 0, 0, H);
  grad.addColorStop(0, COLORS.bg2);
  grad.addColorStop(1, COLORS.bg1);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);
}

function drawGrid() {
  const minor = 36;
  const major = 144;

  ctx.lineWidth = 1;

  for (let x = 0; x <= W; x += minor) {
    ctx.beginPath();
    ctx.strokeStyle = COLORS.gridMinor;
    ctx.moveTo(x, 0);
    ctx.lineTo(x, H);
    ctx.stroke();
  }

  for (let y = 0; y <= H; y += minor) {
    ctx.beginPath();
    ctx.strokeStyle = COLORS.gridMinor;
    ctx.moveTo(0, y);
    ctx.lineTo(W, y);
    ctx.stroke();
  }

  for (let x = 0; x <= W; x += major) {
    ctx.beginPath();
    ctx.strokeStyle = COLORS.gridMajor;
    ctx.moveTo(x, 0);
    ctx.lineTo(x, H);
    ctx.stroke();
  }

  for (let y = 0; y <= H; y += major) {
    ctx.beginPath();
    ctx.strokeStyle = COLORS.gridMajor;
    ctx.moveTo(0, y);
    ctx.lineTo(W, y);
    ctx.stroke();
  }
}

function drawHexRows() {
  ctx.font = '11px "JetBrains Mono", monospace';
  for (const row of hexRows) {
    ctx.fillStyle = `rgba(124,255,0,${row.alpha})`;
    ctx.fillText(row.text, row.x, row.y);
  }
}

function drawTokens() {
  for (const t of floatingTokens) {
    t.x += t.vx;
    t.y += t.vy;

    if (t.x < -60) t.x = W + 20;
    if (t.x > W + 60) t.x = -20;
    if (t.y < -20) t.y = H + 10;
    if (t.y > H + 20) t.y = -10;

    ctx.font = `${t.size}px "JetBrains Mono", monospace`;
    ctx.fillStyle = t.alt
      ? `rgba(255,77,109,${t.alpha})`
      : `rgba(255,176,0,${t.alpha})`;

    ctx.fillText(t.text, t.x, t.y);
  }
}

function drawPulses() {
  for (const p of pulses) {
    if (p.horizontal) {
      p.x += p.speed;
      if (p.x - p.length > W) {
        p.x = -p.length - rand(20, 120);
        p.y = rand(0, H);
      }

      ctx.beginPath();
      ctx.strokeStyle = `rgba(124,255,0,${p.alpha})`;
      ctx.lineWidth = p.thickness;
      ctx.moveTo(p.x, p.y);
      ctx.lineTo(p.x + p.length, p.y);
      ctx.stroke();

      ctx.fillStyle = COLORS.pulseGlow;
      ctx.fillRect(p.x - 4, p.y - 3, 10, 6);
    } else {
      p.y += p.speed;
      if (p.y - p.length > H) {
        p.y = -p.length - rand(20, 120);
        p.x = rand(0, W);
      }

      ctx.beginPath();
      ctx.strokeStyle = `rgba(255,176,0,${p.alpha * 0.7})`;
      ctx.lineWidth = p.thickness;
      ctx.moveTo(p.x, p.y);
      ctx.lineTo(p.x, p.y + p.length);
      ctx.stroke();

      ctx.fillStyle = "rgba(255,176,0,0.12)";
      ctx.fillRect(p.x - 2, p.y - 2, 5, 8);
    }
  }
}

function drawScanBars() {
  for (const s of scanBars) {
    s.y += s.speed;
    if (s.y > H + 20) {
      s.y = -s.h - 20;
    }

    const grad = ctx.createLinearGradient(0, s.y, 0, s.y + s.h);
    grad.addColorStop(0, "rgba(124,255,0,0)");
    grad.addColorStop(0.5, `rgba(124,255,0,${s.alpha})`);
    grad.addColorStop(1, "rgba(124,255,0,0)");

    ctx.fillStyle = grad;
    ctx.fillRect(0, s.y, W, s.h);
  }
}

function drawHudRects() {
  for (const r of hudRects) {
    ctx.strokeStyle = `rgba(255,176,0,${r.alpha})`;
    ctx.lineWidth = 1;
    ctx.strokeRect(r.x, r.y, r.w, r.h);

    ctx.fillStyle = `rgba(255,176,0,${r.alpha * 0.18})`;
    ctx.fillRect(r.x, r.y, r.w, r.h);

    // coins style HUD
    const c = 10;
    ctx.strokeStyle = `rgba(124,255,0,${r.alpha + 0.03})`;

    ctx.beginPath();
    ctx.moveTo(r.x, r.y + c);
    ctx.lineTo(r.x, r.y);
    ctx.lineTo(r.x + c, r.y);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(r.x + r.w - c, r.y);
    ctx.lineTo(r.x + r.w, r.y);
    ctx.lineTo(r.x + r.w, r.y + c);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(r.x, r.y + r.h - c);
    ctx.lineTo(r.x, r.y + r.h);
    ctx.lineTo(r.x + c, r.y + r.h);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(r.x + r.w - c, r.y + r.h);
    ctx.lineTo(r.x + r.w, r.y + r.h);
    ctx.lineTo(r.x + r.w, r.y + r.h - c);
    ctx.stroke();
  }
}

function drawAlerts(time) {
  for (let i = 0; i < 4; i++) {
    const x = 120 + i * (W / 4.8) + Math.sin(time * 0.0004 + i) * 30;
    const y = 140 + Math.cos(time * 0.0007 + i) * 40;

    ctx.fillStyle = "rgba(255,77,109,0.08)";
    ctx.fillRect(x, y, 28, 10);

    ctx.strokeStyle = "rgba(255,77,109,0.18)";
    ctx.strokeRect(x, y, 28, 10);
  }
}

function drawScanlines() {
  for (let y = 0; y < H; y += 4) {
    ctx.fillStyle = "rgba(255,255,255,0.012)";
    ctx.fillRect(0, y, W, 1);
  }
}

function animate(time = 0) {
  drawBackground();
  drawGrid();
  drawScanBars();
  drawHudRects();
  drawHexRows();
  drawPulses();
  drawTokens();
  drawAlerts(time);
  drawScanlines();

  requestAnimationFrame(animate);
}

window.addEventListener("resize", () => {
  W = window.innerWidth;
  H = window.innerHeight;
  canvas.width = W;
  canvas.height = H;
  initScene();
});

initScene();
animate();

const terminalInput = document.getElementById("terminal-input");
const terminalOutput = document.getElementById("output");

const terminalCommands = {
  help: `
<span class="t-green">Commandes disponibles :</span><br>
- help<br>
- whoami<br>
- skills<br>
- projects<br>
- avenir<br>
- contact<br>
- clear
`,

  whoami: `
<span class="t-green">Douicher Camelia</span><br>
Étudiante en BUT Réseaux et Télécommunications<br>
parcours Cybersécurité.<br><br>

Je construis, sécurise et optimise des<br>
infrastructures réseau avec un fort intérêt pour le<br>
pentesting, la sécurité réseau, les télécommunications<br>
radio et l'analyse de vulnérabilités.
`,

  skills: `
<span class="t-green">Compétences principales :</span><br>
- Réseaux<br>
- Télécommunications<br>
- Programmation<br>
- Cybersécurité<br><br>

<span class="t-yellow">Voir la section "Compétences" pour plus de détails.</span>
`,

  projects: `
<span class="t-green">Projets réalisés :</span><br>
- Application Web Tirelire<br>
- Réseau multi-sites sécurisé<br>
- Architecture réseau d'entreprise<br>
- Fibre optique<br>
- Télécommunications radio<br>
- Pentesting & analyse de vulnérabilités<br><br>

<span class="t-yellow">Voir la section "Projets" pour plus de détails.</span>
`,

  avenir: `
<span class="t-green">Perspectives :</span><br>
- Évoluer vers un métier en cybersécurité<br>
- Renforcer mes compétences en réseau et sécurité<br>
- Poursuivre vers un Master orienté cybersécurité<br>
- Développer une ouverture vers l’intelligence artificielle<br><br>

<span class="t-yellow">Voir la section "Perspectives" pour plus de détails.</span>
`,

  contact: `
<span class="t-green">Contact :</span><br>
Email : camelia@example.com<br>
GitHub : github.com/camelia<br>
LinkedIn : linkedin.com/in/camelia
`
};

function printToTerminal(text, className = "") {
  const line = document.createElement("div");
  line.className = className;
  line.innerHTML = text;
  terminalOutput.appendChild(line);
  terminalOutput.scrollTop = terminalOutput.scrollHeight;
}

function runCommand(command) {
  const cmd = command.trim().toLowerCase();

  if (cmd === "") return;

  printToTerminal(`<span class="t-yellow">$&gt; ${command}</span>`);

  if (cmd === "clear") {
    terminalOutput.innerHTML = "";
    return;
  }

  if (terminalCommands[cmd]) {
    printToTerminal(terminalCommands[cmd]);
  } else {
    printToTerminal(
      `<span style="color:#ff6b6b;">Commande inconnue :</span> ${cmd}<br><span class="t-yellow">Tape "help" pour voir les commandes disponibles.</span>`
    );
  }
}

if (terminalInput) {
  terminalInput.addEventListener("keydown", function (e) {
    if (e.key === "Enter") {
      const command = terminalInput.value;
      runCommand(command);
      terminalInput.value = "";
    }
  });
}