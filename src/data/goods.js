export const GOODS = [
  { id: 'produce',     name: 'Fresh Produce',   icon: '\u{1F33D}', base: 8,  unit: 'crate' },
  { id: 'livestock',   name: 'Livestock Feed',  icon: '\u{1F404}', base: 12, unit: 'ton' },
  { id: 'lumber',      name: 'Lumber',          icon: '\u{1F332}', base: 15, unit: 'bundle' },
  { id: 'electronics', name: 'Electronics',     icon: '\u{1F4BB}', base: 60, unit: 'crate' },
  { id: 'textiles',    name: 'Textiles',        icon: '\u{1F9F5}', base: 22, unit: 'bale' },
  { id: 'minerals',    name: 'Minerals & Salt', icon: '\u{1F9C2}', base: 18, unit: 'sack' }
];

// Regional production/demand profile: <1 means the state produces it
// locally (cheap to buy there), >1 means it's imported/in demand
// (sells well there). "fuel" follows the same convention for gas prices.
export const STATE_PROFILE = {
  CA: { produce: 0.70, livestock: 1.30, lumber: 1.20, electronics: 0.55, textiles: 1.10, minerals: 1.40, fuel: 1.35 },
  NV: { produce: 1.30, livestock: 1.20, lumber: 1.50, electronics: 1.10, textiles: 1.20, minerals: 0.60, fuel: 1.15 },
  UT: { produce: 1.20, livestock: 1.10, lumber: 1.30, electronics: 1.15, textiles: 1.15, minerals: 0.50, fuel: 1.05 },
  WY: { produce: 1.40, livestock: 0.60, lumber: 1.10, electronics: 1.30, textiles: 1.25, minerals: 0.85, fuel: 0.85 },
  NE: { produce: 0.65, livestock: 0.55, lumber: 1.40, electronics: 1.35, textiles: 1.20, minerals: 1.20, fuel: 0.95 },
  IA: { produce: 0.60, livestock: 0.60, lumber: 1.30, electronics: 1.40, textiles: 1.25, minerals: 1.25, fuel: 0.98 },
  IL: { produce: 0.90, livestock: 0.85, lumber: 1.15, electronics: 0.90, textiles: 0.95, minerals: 1.10, fuel: 1.05 },
  IN: { produce: 0.95, livestock: 0.80, lumber: 0.90, electronics: 1.00, textiles: 0.90, minerals: 1.05, fuel: 1.00 },
  OH: { produce: 1.00, livestock: 0.90, lumber: 0.75, electronics: 0.95, textiles: 0.85, minerals: 1.00, fuel: 1.02 },
  PA: { produce: 1.05, livestock: 1.00, lumber: 0.70, electronics: 1.05, textiles: 0.80, minerals: 0.95, fuel: 1.08 },
  NJ: { produce: 1.15, livestock: 1.20, lumber: 1.10, electronics: 0.85, textiles: 0.75, minerals: 1.10, fuel: 1.20 },
  NY: { produce: 1.30, livestock: 1.35, lumber: 1.20, electronics: 0.70, textiles: 0.65, minerals: 1.30, fuel: 1.40 }
};

export const BASE_FUEL_PRICE = 3.35; // USD / gallon
