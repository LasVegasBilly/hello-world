import { GOODS, STATE_PROFILE, BASE_FUEL_PRICE } from '../data/goods.js';

function hash01(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return ((h >>> 0) % 10000) / 10000;
}

// A "live" regional economy: every state/good pair oscillates on its own
// slow rhythm (plus a faster ripple) so prices keep drifting the whole
// drive, on top of the baseline regional production/demand profile.
export class Economy {
  constructor() {
    this.time = 0;
    this.rhythms = {};
    for (const state of Object.keys(STATE_PROFILE)) {
      this.rhythms[state] = {};
      for (const good of [...GOODS.map(g => g.id), 'fuel']) {
        const seed = `${state}:${good}`;
        this.rhythms[state][good] = {
          freqA: 0.008 + hash01(seed + 'a') * 0.014,
          phaseA: hash01(seed + 'b') * Math.PI * 2,
          freqB: 0.04 + hash01(seed + 'c') * 0.05,
          phaseB: hash01(seed + 'd') * Math.PI * 2
        };
      }
    }
  }

  tick(dt) {
    this.time += dt;
  }

  driftFor(state, good) {
    const r = this.rhythms[state]?.[good];
    if (!r) return 1;
    return 1 + 0.14 * Math.sin(this.time * r.freqA + r.phaseA) + 0.06 * Math.sin(this.time * r.freqB + r.phaseB);
  }

  priceOf(state, goodId) {
    const good = GOODS.find(g => g.id === goodId);
    if (!good) return null;
    const profile = STATE_PROFILE[state]?.[goodId] ?? 1;
    const drift = this.driftFor(state, goodId);
    return Math.max(1, good.base * profile * drift);
  }

  fuelPrice(state) {
    const profile = STATE_PROFILE[state]?.fuel ?? 1;
    const drift = this.driftFor(state, 'fuel');
    return Math.max(1.5, BASE_FUEL_PRICE * profile * drift);
  }

  allPrices(state) {
    return GOODS.map(g => ({ ...g, price: this.priceOf(state, g.id) }));
  }
}
