export interface ShopItem {
  id: string;
  name: string;
  price: number;
}

export const shopItems: ShopItem[] = [
  { id: 'ice_breaker', name: 'ICE Breaker v2.1', price: 5000 },
  { id: 'stealth_cloak', name: 'Stealth Cloak Module', price: 12000 },
  { id: 'data_spike', name: 'Data Spike', price: 2500 },
];
