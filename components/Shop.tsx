import React from 'react';
import type { ShopItem } from '../types';

interface ShopProps {
  items: ShopItem[];
  credits: number;
  ownedItems: string[];
  onPurchase: (itemId: string) => void;
}

export const Shop: React.FC<ShopProps> = ({ items, credits, ownedItems, onPurchase }) => {
  return (
    <div className="p-6 border border-cyan-400 bg-black/40 h-full overflow-y-auto">
      <h2 className="text-cyan-300 text-xl mb-4 tracking-wide">[ BLACK NET MARKET ]</h2>
      <p className="text-gray-300 mb-4">
        Exchange credits for high-end intrusion gear. Transactions are instant. Duplicate purchases are blocked by CORE safeguards.
      </p>
      <div className="grid gap-4 sm:grid-cols-2">
        {items.map(item => {
          const owned = ownedItems.includes(item.id);
          return (
            <div key={item.id} className="border border-cyan-700/50 p-4 rounded bg-black/60">
              <h3 className="text-cyan-200 text-lg font-semibold">{item.name}</h3>
              <p className="text-cyan-400 text-[10px] uppercase tracking-wider mt-1">/{item.id}</p>
              <p className="text-gray-400 text-sm mt-1">{item.description}</p>
              <p className="text-gray-400 text-xs mt-2">Benefit: <span className="text-cyan-300">{item.benefit}</span></p>
              <div className="flex items-center justify-between mt-3 text-sm">
                <span className="text-cyan-400">{item.price.toLocaleString()} creds</span>
                <button
                  className={`px-3 py-1 border border-cyan-400 text-xs uppercase tracking-wide transition ${
                    owned || credits < item.price
                      ? 'opacity-50 cursor-not-allowed'
                      : 'hover:bg-cyan-400 hover:text-black'
                  }`}
                  onClick={() => onPurchase(item.id)}
                  disabled={owned || credits < item.price}
                >
                  {owned ? 'Owned' : 'Acquire'}
                </button>
              </div>
            </div>
          );
        })}
      </div>
      <p className="mt-6 text-sm text-cyan-200 italic">Use "buy &lt;item id&gt;" in the terminal or tap Acquire here.</p>
    </div>
  );
};
