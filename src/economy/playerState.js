export const FUEL_TANK_GALLONS = 18;
export const CARGO_CAPACITY = 40;
// gallons burned per game-meter driven, calibrated so the full compressed
// coast-to-coast route (~37,000 game meters) burns roughly a tank every
// few towns at realistic real-world highway fuel economy.
const FUEL_BURN_PER_UNIT = 0.0031;

export class PlayerState {
  constructor() {
    this.money = 600;
    this.fuel = FUEL_TANK_GALLONS;
    this.cargo = {};
    this.distanceTraveled = 0;
    this.strandedNotified = false;
  }

  get cargoUsed() {
    return Object.values(this.cargo).reduce((a, b) => a + b, 0);
  }

  get fuelFraction() {
    return this.fuel / FUEL_TANK_GALLONS;
  }

  consumeFuel(distanceUnits, offRoad) {
    if (distanceUnits <= 0) return;
    const amount = distanceUnits * FUEL_BURN_PER_UNIT * (offRoad ? 1.4 : 1);
    this.fuel = Math.max(0, this.fuel - amount);
    this.distanceTraveled += distanceUnits;
  }

  buyFuel(gallons, pricePerGallon) {
    const room = FUEL_TANK_GALLONS - this.fuel;
    gallons = Math.min(gallons, room);
    let cost = gallons * pricePerGallon;
    if (cost > this.money) {
      gallons = this.money / pricePerGallon;
      cost = this.money;
    }
    this.money -= cost;
    this.fuel += gallons;
    return { gallons, cost };
  }

  buyGood(goodId, qty, price) {
    const cost = qty * price;
    if (qty <= 0 || cost > this.money) return false;
    if (this.cargoUsed + qty > CARGO_CAPACITY) return false;
    this.money -= cost;
    this.cargo[goodId] = (this.cargo[goodId] || 0) + qty;
    return true;
  }

  sellGood(goodId, qty, price) {
    const have = this.cargo[goodId] || 0;
    qty = Math.min(qty, have);
    if (qty <= 0) return null;
    const revenue = qty * price;
    this.cargo[goodId] = have - qty;
    this.money += revenue;
    return { qty, revenue };
  }
}
