import { FUEL_TANK_GALLONS } from '../economy/playerState.js';

export class MarketUI {
  constructor({ onToast, onClose }) {
    this.root = document.getElementById('market');
    this.onToast = onToast ?? (() => {});
    this.onClose = onClose ?? (() => {});
    this.town = null;
    this.economy = null;
    this.player = null;
    this.root.addEventListener('click', e => {
      if (e.target === this.root) this.close();
    });
  }

  get isOpen() {
    return !this.root.classList.contains('hidden');
  }

  open(town, economy, player) {
    this.town = town;
    this.economy = economy;
    this.player = player;
    this.root.classList.remove('hidden');
    this.render();
  }

  close() {
    this.root.classList.add('hidden');
    this.root.innerHTML = '';
    this.onClose();
  }

  render() {
    const { town, economy, player } = this;
    const fuelPrice = economy.fuelPrice(town.code);
    const goods = economy.allPrices(town.code);

    const card = document.createElement('div');
    card.className = 'market-card';
    card.innerHTML = `
      <div class="market-header">
        <h2>${town.name}</h2>
        <span class="state-tag">${town.state}</span>
      </div>
      <div class="market-sub">Regional prices shift over time — buy where it's cheap, sell where it's dear.</div>
      <div class="market-money">$${player.money.toFixed(2)} &nbsp;<span style="opacity:.55;font-weight:400;font-size:12px;">cargo ${player.cargoUsed}/40</span></div>

      <div class="fuel-block">
        <div class="fuel-info">
          &#x26FD; Fuel: ${player.fuel.toFixed(1)} / ${FUEL_TANK_GALLONS} gal &nbsp;·&nbsp; $${fuelPrice.toFixed(2)}/gal
        </div>
        <button data-action="fillup" ${player.fuel >= FUEL_TANK_GALLONS - 0.05 ? 'disabled' : ''}>Fill Up</button>
      </div>

      <table class="goods-table">
        <thead><tr><th>Good</th><th>Price</th><th>Owned</th><th></th></tr></thead>
        <tbody>
          ${goods.map(g => this._goodRow(g, player)).join('')}
        </tbody>
      </table>

      <button class="market-close" data-action="close">Close (M)</button>
    `;
    this.root.innerHTML = '';
    this.root.appendChild(card);
    this._wireEvents(card);
  }

  _goodRow(g, player) {
    const owned = player.cargo[g.id] || 0;
    const cheap = g.price < g.base * 0.9;
    const pricey = g.price > g.base * 1.15;
    const priceClass = cheap ? 'cheap' : pricey ? 'pricey' : '';
    return `
      <tr>
        <td class="good-name">${g.icon} ${g.name} <span style="opacity:.5;font-size:11px;">/${g.unit}</span></td>
        <td class="good-price ${priceClass}">$${g.price.toFixed(2)}</td>
        <td class="good-owned">${owned}</td>
        <td class="good-actions">
          <button data-action="buy" data-good="${g.id}" data-qty="1">Buy 1</button>
          <button data-action="buy" data-good="${g.id}" data-qty="5">Buy 5</button>
          <button data-action="sell" data-good="${g.id}" data-qty="1" ${owned < 1 ? 'disabled' : ''}>Sell 1</button>
          <button data-action="sell" data-good="${g.id}" data-qty="5" ${owned < 5 ? 'disabled' : ''}>Sell 5</button>
        </td>
      </tr>
    `;
  }

  _wireEvents(card) {
    card.querySelectorAll('button[data-action]').forEach(btn => {
      btn.addEventListener('click', () => {
        const action = btn.dataset.action;
        if (action === 'close') return this.close();
        if (action === 'fillup') return this._fillUp();
        if (action === 'buy') return this._buy(btn.dataset.good, Number(btn.dataset.qty));
        if (action === 'sell') return this._sell(btn.dataset.good, Number(btn.dataset.qty));
      });
    });
  }

  _fillUp() {
    const price = this.economy.fuelPrice(this.town.code);
    const needed = FUEL_TANK_GALLONS - this.player.fuel;
    const { gallons, cost } = this.player.buyFuel(needed, price);
    if (gallons > 0.01) this.onToast(`Filled up ${gallons.toFixed(1)} gal for $${cost.toFixed(2)}`);
    this.render();
  }

  _buy(goodId, qty) {
    const good = this.economy.allPrices(this.town.code).find(g => g.id === goodId);
    const ok = this.player.buyGood(goodId, qty, good.price);
    if (ok) this.onToast(`Bought ${qty} ${good.name} for $${(qty * good.price).toFixed(2)}`);
    else this.onToast(`Can't buy ${qty} ${good.name} — check cash or cargo space`, { duration: 2400 });
    this.render();
  }

  _sell(goodId, qty) {
    const good = this.economy.allPrices(this.town.code).find(g => g.id === goodId);
    const result = this.player.sellGood(goodId, qty, good.price);
    if (result) this.onToast(`Sold ${result.qty} ${good.name} for $${result.revenue.toFixed(2)}`);
    this.render();
  }
}
