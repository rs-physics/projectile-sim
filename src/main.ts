/**
 * Projectile Motion — a self-contained Vite + vanilla TypeScript simulation.
 *
 * Setup:
 * 1. Create a Vite "Vanilla TypeScript" project in WebStorm.
 * 2. Replace src/main.ts with this file.
 * 3. Run `npm install` (if needed), then `npm run dev`.
 *
 * No external libraries, CSS file or image assets are required.
 * Assumes the standard Vite index.html containing <div id="app"></div>.
 */

type VectorKey = 'vx' | 'vy' | 'v';

const root = document.querySelector<HTMLDivElement>('#app');
if (!root) throw new Error('Cannot find #app. Check your index.html.');

root.innerHTML = `
  <style>
    :root { font-family: Inter, "Segoe UI", Arial, sans-serif; color: #1e293b; background: #f4f7fb; }
    * { box-sizing: border-box; }
    body { margin: 0; }
    button, input, select { font: inherit; }
    button { cursor: pointer; }
    .shell { max-width: 1120px; margin: 0 auto; padding: 26px 18px 50px; }
    header { margin-bottom: 17px; }
    h1 { font-size: clamp(1.65rem, 3vw, 2.2rem); letter-spacing: -.04em; margin: 0 0 8px; }
    .subtitle { font-size: .94rem; line-height: 1.5; margin: 0; color: #64748b; }
    .panel { background: #fff; border: 1px solid #e2e8f0; border-radius: 16px; box-shadow: 0 7px 28px #0f172a08; }
    .plot-panel { padding: 12px 14px 13px; }
    .plot-heading { display: flex; align-items: center; justify-content: space-between; gap: 12px; flex-wrap: wrap; padding: 3px 5px 11px; }
    .plot-heading strong { font-size: .91rem; }
    .legend { display: flex; align-items: center; gap: 14px; flex-wrap: wrap; font-size: .8rem; color: #475569; }
    .legend span { display: inline-flex; align-items: center; gap: 6px; }
    .swatch { display: inline-block; width: 17px; height: 3px; border-radius: 99px; }
    canvas { display: block; width: 100%; height: 420px; border: 1px solid #e8edf5; border-radius: 10px; background: #fcfdff; }
    .controls { display: flex; flex-wrap: wrap; align-items: center; gap: 8px; margin-top: 14px; }
    .btn { border: 1px solid #cbd5e1; background: #fff; color: #1e293b; border-radius: 9px; min-height: 39px; padding: 8px 13px; font-weight: 600; font-size: .87rem; }
    .btn:hover { background: #f1f5f9; }
    .btn:focus-visible, input:focus-visible, select:focus-visible { outline: 2px solid #3b82f6; outline-offset: 3px; }
    .btn.primary { background: #2563eb; border-color: #2563eb; color: #fff; min-width: 103px; }
    .btn.primary:hover { background: #1d4ed8; }
    .speed-label { font-size: .83rem; color: #475569; margin-left: 7px; }
    select { border: 1px solid #cbd5e1; border-radius: 8px; min-height: 39px; padding: 5px 10px; background: #fff; }
    .scrub-row { display: flex; align-items: center; gap: 13px; margin: 13px 2px 1px; }
    .scrub-row input { flex: 1; min-width: 0; accent-color: #2563eb; cursor: pointer; }
    .scrub-row output { width: 112px; text-align: right; color: #475569; font-variant-numeric: tabular-nums; font-size: .84rem; }
    .under-grid { display: grid; grid-template-columns: 1.08fr .92fr; gap: 15px; margin-top: 15px; }
    .settings, .data { padding: 20px 22px; }
    h2 { font-size: .99rem; margin: 0 0 15px; }
    .setting { display: grid; grid-template-columns: 133px minmax(60px, 1fr) 75px; align-items: center; gap: 12px; margin-bottom: 14px; }
    .setting label { font-size: .86rem; color: #475569; }
    .setting input { width: 100%; accent-color: #2563eb; }
    .setting output { font-size: .87rem; text-align: right; font-variant-numeric: tabular-nums; }
    .toggles { display: flex; flex-wrap: wrap; gap: 10px 18px; padding-top: 5px; }
    .toggles label { display: inline-flex; align-items: center; gap: 7px; font-size: .83rem; cursor: pointer; }
    .toggles input { accent-color: #2563eb; }
    .readings { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 14px 24px; margin: 0; }
    .readings div { min-width: 0; }
    dt { color: #64748b; font-size: .79rem; margin-bottom: 4px; }
    dd { margin: 0; font-weight: 650; font-size: 1.03rem; font-variant-numeric: tabular-nums; }
    .formula { border-top: 1px solid #e2e8f0; margin: 17px 0 0; padding-top: 12px; font-size: .79rem; color: #64748b; line-height: 1.6; }
    .note { margin-top: 12px; font-size: .8rem; line-height: 1.5; color: #64748b; }
    @media (max-width: 760px) {
      .under-grid { grid-template-columns: 1fr; }
      .shell { padding: 17px 10px 36px; }
      canvas { height: 325px; }
      .plot-panel { padding: 10px; }
      .plot-heading { align-items: flex-start; }
      .setting { grid-template-columns: 122px minmax(50px, 1fr) 67px; gap: 8px; }
      .settings, .data { padding: 17px; }
    }
  </style>

  <main class="shell">
    <header>
      <h1>Projectile Motion</h1>
      <p class="subtitle">Explore horizontal and vertical velocity as a projectile travels through the air. Air resistance is ignored.</p>
    </header>

    <section class="panel plot-panel" aria-label="Animated projectile motion">
      <div class="plot-heading">
        <strong>Trajectory and velocity vectors</strong>
        <div class="legend" aria-label="Vector colours">
          <span><i class="swatch" style="background:#139b71"></i>Horizontal</span>
          <span><i class="swatch" style="background:#287cdd"></i>Vertical</span>
          <span><i class="swatch" style="background:#e88b28"></i>Resultant</span>
        </div>
      </div>
      <canvas id="trajectory" aria-label="Projectile trajectory with velocity vector arrows"></canvas>
      <div class="controls" role="group" aria-label="Animation controls">
        <button id="play" class="btn primary" type="button">▶ Play</button>
        <button id="reset" class="btn" type="button" title="Return to launch">↺ Reset</button>
        <button id="back" class="btn" type="button" title="Step backward by one twentieth of the flight">◀ Step</button>
        <button id="forward" class="btn" type="button" title="Step forward by one twentieth of the flight">Step ▶</button>
        <label for="speed" class="speed-label">Playback</label>
        <select id="speed" aria-label="Playback speed">
          <option value="0.25">0.25×</option>
          <option value="0.5">0.5×</option>
          <option value="1" selected>1×</option>
          <option value="2">2×</option>
        </select>
      </div>
      <div class="scrub-row">
        <label for="timeline" style="font-size:.83rem; color:#475569">Time</label>
        <input id="timeline" type="range" min="0" max="1000" value="0" step="1" aria-label="Scrub through the flight" />
        <output id="timelineLabel">0.00 / 0.00 s</output>
      </div>
    </section>

    <div class="under-grid">
      <section class="panel settings" aria-label="Simulation settings">
        <h2>Initial conditions</h2>
        <div class="setting"><label for="initialSpeed">Launch speed</label><input id="initialSpeed" type="range" min="10" max="40" step="1" value="24"><output id="initialSpeedLabel">24 m/s</output></div>
        <div class="setting"><label for="angle">Launch angle</label><input id="angle" type="range" min="15" max="75" step="1" value="45"><output id="angleLabel">45°</output></div>
        <div class="setting"><label for="gravity">Gravity</label><input id="gravity" type="range" min="1" max="20" step="0.1" value="9.8"><output id="gravityLabel">9.8 m/s²</output></div>
        <h2 style="margin-top:24px">Display</h2>
        <div class="toggles">
          <label><input id="showVx" type="checkbox" checked> <span style="color:#087e5a">vₓ</span></label>
          <label><input id="showVy" type="checkbox" checked> <span style="color:#2369c3">vᵧ</span></label>
          <label><input id="showV" type="checkbox"> <span style="color:#b7650b">Resultant v</span></label>
          <label><input id="showSamples" type="checkbox">Vectors at 5 positions</label>
        </div>
      </section>
      <section class="panel data" aria-label="Live motion values">
        <h2>Measurements</h2>
        <dl class="readings">
          <div><dt>Time elapsed</dt><dd id="tValue">—</dd></div>
          <div><dt>Distance, x</dt><dd id="xValue">—</dd></div>
          <div><dt>Height, y</dt><dd id="yValue">—</dd></div>
          <div><dt>Horizontal velocity, vₓ</dt><dd id="vxValue">—</dd></div>
          <div><dt>Vertical velocity, vᵧ</dt><dd id="vyValue">—</dd></div>
          <div><dt>Resultant speed, |v|</dt><dd id="vValue">—</dd></div>
          <div><dt>Total flight time</dt><dd id="flightValue">—</dd></div>
          <div><dt>Maximum height</dt><dd id="heightValue">—</dd></div>
          <div><dt>Horizontal range</dt><dd id="rangeValue">—</dd></div>
        </dl>
        <p class="formula">x = (u cos θ)t &nbsp; · &nbsp; y = (u sin θ)t − ½gt²<br>
          vₓ = u cos θ &nbsp; · &nbsp; vᵧ = u sin θ − gt</p>
      </section>
    </div>
    <p class="note">Tip: Pause and drag the time slider to investigate the vectors at any point, including the apex. The arrow lengths represent velocity components (not displacement).</p>
  </main>
`;

// All query selectors live in one place to catch accidental changes to the UI IDs.
function el<T extends HTMLElement>(id: string): T {
  const element = document.getElementById(id);
  if (!element) throw new Error(`Missing element #${id}`);
  return element as T;
}

const canvas = el<HTMLCanvasElement>('trajectory');
const context = canvas.getContext('2d');
if (!context) throw new Error('Your browser does not support Canvas 2D.');
const ctx: CanvasRenderingContext2D = context;

const playButton = el<HTMLButtonElement>('play');
const timeline = el<HTMLInputElement>('timeline');
const speedSelect = el<HTMLSelectElement>('speed');
const initialSpeedInput = el<HTMLInputElement>('initialSpeed');
const angleInput = el<HTMLInputElement>('angle');
const gravityInput = el<HTMLInputElement>('gravity');
const showVxInput = el<HTMLInputElement>('showVx');
const showVyInput = el<HTMLInputElement>('showVy');
const showVInput = el<HTMLInputElement>('showV');
const showSamplesInput = el<HTMLInputElement>('showSamples');

const colours: Record<VectorKey, string> = {
  vx: '#139b71',
  vy: '#287cdd',
  v: '#e88b28',
};

let launchSpeed = Number(initialSpeedInput.value); // m/s
let launchAngle = Number(angleInput.value) * Math.PI / 180; // radians
let gravity = Number(gravityInput.value); // m/s²
let elapsed = 0; // seconds
let playing = false;
let playbackRate = 1;
let rafId: number | null = null;
let previousFrame = 0;

const initialVx = () => launchSpeed * Math.cos(launchAngle);
const initialVy = () => launchSpeed * Math.sin(launchAngle);
const flightDuration = () => 2 * initialVy() / gravity;
const flightRange = () => initialVx() * flightDuration();
const maximumHeight = () => initialVy() ** 2 / (2 * gravity);

type Motion = { x: number; y: number; vx: number; vy: number; speed: number };

function motionAt(time: number): Motion {
  const t = Math.max(0, Math.min(time, flightDuration()));
  const vx = initialVx();
  const vy = initialVy() - gravity * t;
  return {
    x: vx * t,
    y: Math.max(0, initialVy() * t - 0.5 * gravity * t * t),
    vx,
    vy,
    speed: Math.hypot(vx, vy),
  };
}

function niceTick(rough: number): number {
  if (rough <= 0) return 1;
  const power = 10 ** Math.floor(Math.log10(rough));
  const factor = rough / power;
  return (factor <= 1 ? 1 : factor <= 2 ? 2 : factor <= 5 ? 5 : 10) * power;
}

function drawArrow(x: number, y: number, dx: number, dy: number, colour: string, name: string, opacity = 1, label = true): void {
  const length = Math.hypot(dx, dy);
  if (length < 1.5) {
    if (label) {
      ctx.save();
      ctx.fillStyle = colour;
      ctx.font = 'bold 12px "Segoe UI", Arial, sans-serif';
      ctx.fillText(`${name} = 0`, x + 11, y - 12);
      ctx.restore();
    }
    return;
  }
  const tipX = x + dx;
  const tipY = y + dy;
  const angle = Math.atan2(dy, dx);
  const headLength = Math.min(11, Math.max(6, length * 0.3));
  ctx.save();
  ctx.globalAlpha = opacity;
  ctx.strokeStyle = colour;
  ctx.fillStyle = colour;
  ctx.lineWidth = label ? 3 : 2;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(tipX, tipY);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(tipX, tipY);
  ctx.lineTo(tipX - headLength * Math.cos(angle - Math.PI / 6), tipY - headLength * Math.sin(angle - Math.PI / 6));
  ctx.lineTo(tipX - headLength * Math.cos(angle + Math.PI / 6), tipY - headLength * Math.sin(angle + Math.PI / 6));
  ctx.closePath();
  ctx.fill();
  if (label) {
    ctx.font = 'bold 12px "Segoe UI", Arial, sans-serif';
    const textX = tipX + (dx < -0.5 ? -23 : 7);
    const textY = tipY + (dy < -1 ? -6 : dy > 1 ? 16 : -9);
    ctx.fillText(name, textX, textY);
  }
  ctx.restore();
}

function draw(): void {
  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();
  const width = rect.width;
  const height = rect.height;
  if (width <= 0 || height <= 0) return;
  const pixelWidth = Math.round(width * dpr);
  const pixelHeight = Math.round(height * dpr);
  if (canvas.width !== pixelWidth || canvas.height !== pixelHeight) {
    canvas.width = pixelWidth;
    canvas.height = pixelHeight;
  }
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, width, height);

  // Use the same physical scale on both axes, so the trajectory has an honest shape.
  // Reserve room above / to the right of the flight for velocity arrows.
  const narrow = width < 520;
  const left = narrow ? 41 : 62;
  const right = narrow ? 93 : 158;
  const ground = height - (narrow ? 48 : 58);
  const topMargin = narrow ? 70 : 95;
  const range = flightRange();
  const peak = maximumHeight();
  const scale = Math.min((width - left - right) / range, (ground - topMargin) / Math.max(peak, 0.001));
  const px = (metres: number) => left + metres * scale;
  const py = (metres: number) => ground - metres * scale;

  // Grid and axis labels.
  ctx.font = '11px "Segoe UI", Arial, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';
  const xTick = niceTick(range / 6);
  for (let x = 0; x <= range + 0.0001; x += xTick) {
    const loc = px(x);
    ctx.strokeStyle = '#e9edf4';
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(loc, topMargin - 15); ctx.lineTo(loc, ground); ctx.stroke();
    ctx.fillStyle = '#8491a4';
    ctx.fillText(`${Number(x.toFixed(2))}`, loc, ground + 18);
  }
  const yTick = niceTick(peak / 3);
  ctx.textAlign = 'right';
  for (let y = yTick; y <= peak + yTick * 0.6; y += yTick) {
    const loc = py(y);
    if (loc < 22) continue;
    ctx.strokeStyle = '#e9edf4';
    ctx.beginPath(); ctx.moveTo(left, loc); ctx.lineTo(width - 12, loc); ctx.stroke();
    ctx.fillStyle = '#8491a4';
    ctx.fillText(`${Number(y.toFixed(2))}`, left - 8, loc + 4);
  }
  ctx.fillStyle = '#64748b';
  ctx.textAlign = 'center';
  ctx.fillText('Horizontal distance / m', (left + width - right) / 2, height - 11);
  ctx.save();
  ctx.translate(16, (ground + topMargin) / 2);
  ctx.rotate(-Math.PI / 2);
  ctx.fillText('Height / m', 0, 0);
  ctx.restore();

  // Ground line.
  ctx.strokeStyle = '#475569';
  ctx.lineWidth = 1.6;
  ctx.beginPath(); ctx.moveTo(left - 4, ground); ctx.lineTo(width - 10, ground); ctx.stroke();

  // Complete trajectory (dashed), with the travelled section highlighted.
  const duration = flightDuration();
  function tracePath(endFraction: number): void {
    const steps = Math.max(1, Math.ceil(180 * endFraction));
    ctx.beginPath();
    for (let i = 0; i <= steps; i++) {
      const m = motionAt(duration * endFraction * i / steps);
      if (i === 0) ctx.moveTo(px(m.x), py(m.y));
      else ctx.lineTo(px(m.x), py(m.y));
    }
  }
  tracePath(1);
  ctx.setLineDash([6, 6]);
  ctx.strokeStyle = '#91a0b4';
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.setLineDash([]);
  if (elapsed > 0) {
    tracePath(elapsed / duration);
    ctx.strokeStyle = '#f5b44f';
    ctx.lineWidth = 3;
    ctx.stroke();
  }

  ctx.textAlign = 'left';
  ctx.font = '11px "Segoe UI", Arial, sans-serif';
  ctx.fillStyle = '#475569';
  ctx.fillText('Launch', left + 5, ground - 9);
  ctx.textAlign = 'right';
  ctx.fillText('Landing', px(range) - 5, ground - 9);

  // Velocity arrows: lengths are proportional to the magnitude in m/s.
  const vectorScale = Math.max(1.6, Math.min(3.5, width / 270));
  const vectors = (m: Motion, alpha: number, labels: boolean) => {
    const x = px(m.x), y = py(m.y);
    if (showVxInput.checked) drawArrow(x, y, m.vx * vectorScale, 0, colours.vx, 'vₓ', alpha, labels);
    if (showVyInput.checked) drawArrow(x, y, 0, -m.vy * vectorScale, colours.vy, 'vᵧ', alpha, labels);
    if (showVInput.checked) drawArrow(x, y, m.vx * vectorScale, -m.vy * vectorScale, colours.v, 'v', alpha, labels);
  };
  if (showSamplesInput.checked) {
    for (const fraction of [0, 0.25, 0.5, 0.75, 1]) {
      const m = motionAt(duration * fraction);
      vectors(m, 0.28, false);
      ctx.beginPath();
      ctx.arc(px(m.x), py(m.y), 3, 0, 2 * Math.PI);
      ctx.fillStyle = '#94a3b8';
      ctx.fill();
    }
  }

  const current = motionAt(elapsed);
  vectors(current, 1, true);
  ctx.beginPath();
  ctx.arc(px(current.x), py(current.y), 7, 0, Math.PI * 2);
  ctx.fillStyle = '#f59e0b';
  ctx.fill();
  ctx.strokeStyle = '#fff';
  ctx.lineWidth = 2.5;
  ctx.stroke();
}

const metres = (n: number) => `${n.toFixed(2)} m`;
const velocity = (n: number) => `${n.toFixed(2)} m/s`;

function updateDisplay(): void {
  const m = motionAt(elapsed);
  const duration = flightDuration();
  el<HTMLOutputElement>('timelineLabel').textContent = `${elapsed.toFixed(2)} / ${duration.toFixed(2)} s`;
  timeline.value = String(Math.round(1000 * elapsed / duration));
  el<HTMLElement>('tValue').textContent = `${elapsed.toFixed(2)} s`;
  el<HTMLElement>('xValue').textContent = metres(m.x);
  el<HTMLElement>('yValue').textContent = metres(m.y);
  el<HTMLElement>('vxValue').textContent = velocity(m.vx);
  el<HTMLElement>('vyValue').textContent = velocity(m.vy);
  el<HTMLElement>('vValue').textContent = velocity(m.speed);
  el<HTMLElement>('flightValue').textContent = `${duration.toFixed(2)} s`;
  el<HTMLElement>('heightValue').textContent = metres(maximumHeight());
  el<HTMLElement>('rangeValue').textContent = metres(flightRange());
  draw();
}

function pause(): void {
  playing = false;
  playButton.textContent = '▶ Play';
  if (rafId !== null) cancelAnimationFrame(rafId);
  rafId = null;
}

function frame(timestamp: number): void {
  if (!playing) return;
  // Cap huge jumps when the browser tab was in the background.
  const dt = Math.min((timestamp - previousFrame) / 1000, 0.1);
  previousFrame = timestamp;
  elapsed = Math.min(flightDuration(), elapsed + dt * playbackRate);
  updateDisplay();
  if (elapsed >= flightDuration()) {
    pause();
  } else {
    rafId = requestAnimationFrame(frame);
  }
}

playButton.addEventListener('click', () => {
  if (playing) {
    pause();
    return;
  }
  if (elapsed >= flightDuration()) elapsed = 0;
  playing = true;
  playButton.textContent = '❚❚ Pause';
  previousFrame = performance.now();
  rafId = requestAnimationFrame(frame);
  updateDisplay();
});

el<HTMLButtonElement>('reset').addEventListener('click', () => {
  pause();
  elapsed = 0;
  updateDisplay();
});

function step(fraction: number): void {
  pause();
  elapsed = Math.max(0, Math.min(flightDuration(), elapsed + flightDuration() * fraction));
  updateDisplay();
}
el<HTMLButtonElement>('back').addEventListener('click', () => step(-0.05));
el<HTMLButtonElement>('forward').addEventListener('click', () => step(0.05));

timeline.addEventListener('input', () => {
  pause();
  elapsed = (Number(timeline.value) / 1000) * flightDuration();
  updateDisplay();
});

speedSelect.addEventListener('change', () => {
  playbackRate = Number(speedSelect.value);
});

function updatePhysics(): void {
  const fraction = elapsed / flightDuration();
  launchSpeed = Number(initialSpeedInput.value);
  launchAngle = Number(angleInput.value) * Math.PI / 180;
  gravity = Number(gravityInput.value);
  elapsed = fraction * flightDuration();
  el<HTMLOutputElement>('initialSpeedLabel').textContent = `${launchSpeed} m/s`;
  el<HTMLOutputElement>('angleLabel').textContent = `${angleInput.value}°`;
  el<HTMLOutputElement>('gravityLabel').textContent = `${gravity.toFixed(1)} m/s²`;
  updateDisplay();
}
for (const input of [initialSpeedInput, angleInput, gravityInput]) {
  input.addEventListener('input', updatePhysics);
}
for (const input of [showVxInput, showVyInput, showVInput, showSamplesInput]) {
  input.addEventListener('change', draw);
}

// Canvas backing pixels track the displayed CSS dimensions and device pixel ratio.
new ResizeObserver(draw).observe(canvas);
updatePhysics();
