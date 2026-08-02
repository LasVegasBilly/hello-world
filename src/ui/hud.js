export class HUD {
  constructor(routeData) {
    this.root = document.getElementById('hud');
    this.routeData = routeData;
    this._buildDOM();
    this._computeMinimapBounds();
  }

  _buildDOM() {
    this.root.innerHTML = `
      <div id="hud-top-center" class="hud-panel">
        <div id="hud-location">—</div>
        <div id="hud-progress-track"><div id="hud-progress-fill"></div></div>
      </div>
      <div id="hud-minimap" class="hud-panel"><canvas width="180" height="180"></canvas></div>
      <div id="hud-bottom-left" class="hud-panel">
        <div class="speed-row"><span id="hud-speed">0</span> mph <span id="hud-offroad" style="opacity:.6;font-size:11px;"></span></div>
        <div class="stat-row">
          <span class="stat-label">Fuel</span>
          <div class="bar-track"><div id="hud-fuel-fill" class="bar-fill fuel" style="width:100%"></div></div>
        </div>
        <div class="money-row">$<span id="hud-money">0</span></div>
      </div>
      <div id="hud-prompt" class="hud-panel hidden"></div>
      <div id="hud-toasts" class="hud-panel"></div>
    `;
    this.minimapCanvas = this.root.querySelector('#hud-minimap canvas');
    this.minimapCtx = this.minimapCanvas.getContext('2d');
  }

  _computeMinimapBounds() {
    const pts = this.routeData.waypoints.map(w => w.position);
    let minX = Infinity, maxX = -Infinity, minZ = Infinity, maxZ = -Infinity;
    pts.forEach(p => {
      minX = Math.min(minX, p.x); maxX = Math.max(maxX, p.x);
      minZ = Math.min(minZ, p.z); maxZ = Math.max(maxZ, p.z);
    });
    this._bounds = { minX, maxX, minZ, maxZ };
  }

  _toMinimap(x, z, size, pad = 12) {
    const { minX, maxX, minZ, maxZ } = this._bounds;
    const u = (x - minX) / Math.max(1, maxX - minX);
    const v = (z - minZ) / Math.max(1, maxZ - minZ);
    return { x: pad + u * (size - pad * 2), y: pad + v * (size - pad * 2) };
  }

  update({ speedMs, fuelFraction, money, locationLabel, progress, carPos, nearTown, offRoad }) {
    const mph = Math.round(Math.abs(speedMs) * 2.23694);
    this.root.querySelector('#hud-speed').textContent = mph;
    this.root.querySelector('#hud-offroad').textContent = offRoad ? 'OFF-ROAD' : '';

    const fuelFill = this.root.querySelector('#hud-fuel-fill');
    fuelFill.style.width = `${Math.max(0, fuelFraction * 100)}%`;
    fuelFill.classList.toggle('low', fuelFraction < 0.2);

    this.root.querySelector('#hud-money').textContent = money.toFixed(0);
    this.root.querySelector('#hud-location').textContent = locationLabel;
    this.root.querySelector('#hud-progress-fill').style.width = `${Math.min(100, progress * 100)}%`;

    const prompt = this.root.querySelector('#hud-prompt');
    if (nearTown) {
      prompt.classList.remove('hidden');
      prompt.textContent = `Press M to trade in ${nearTown.name}, ${nearTown.code}`;
    } else {
      prompt.classList.add('hidden');
    }

    this._drawMinimap(carPos);
  }

  _drawMinimap(carPos) {
    const ctx = this.minimapCtx;
    const size = this.minimapCanvas.width;
    ctx.clearRect(0, 0, size, size);
    ctx.strokeStyle = 'rgba(255,255,255,0.35)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    this.routeData.waypoints.forEach((w, i) => {
      const p = this._toMinimap(w.position.x, w.position.z, size);
      if (i === 0) ctx.moveTo(p.x, p.y); else ctx.lineTo(p.x, p.y);
    });
    ctx.stroke();

    ctx.fillStyle = 'rgba(255,215,106,0.9)';
    this.routeData.waypoints.forEach(w => {
      const p = this._toMinimap(w.position.x, w.position.z, size);
      ctx.beginPath();
      ctx.arc(p.x, p.y, 2, 0, Math.PI * 2);
      ctx.fill();
    });

    if (carPos) {
      const p = this._toMinimap(carPos.x, carPos.z, size);
      ctx.fillStyle = '#ff5a4f';
      ctx.beginPath();
      ctx.arc(p.x, p.y, 4.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 1;
      ctx.stroke();
    }
  }

  toast(message, opts = {}) {
    const el = document.createElement('div');
    el.className = 'toast';
    el.textContent = message;
    const container = this.root.querySelector('#hud-toasts');
    container.appendChild(el);
    setTimeout(() => el.remove(), opts.duration ?? 3200);
  }

  show() { this.root.classList.remove('hidden'); }
  hide() { this.root.classList.add('hidden'); }
}
