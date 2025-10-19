import React, { useState } from 'react';
import { useGameState } from '../services/useGameState';
import { shopItems, ShopItem } from '../services/shopService';

export const Shop: React.FC = () => {
  const { credits, inventory, removeCredits, addToInventory } = useGameState();
  const [purchaseStatus, setPurchaseStatus] = useState<Record<string, string>>({});

  const handlePurchase = (item: ShopItem) => {
    if (credits < item.price) {
      setPurchaseStatus({ ...purchaseStatus, [item.id]: 'Error: Insufficient credits.' });
      return;
    }
    if (inventory.includes(item.id)) {
      setPurchaseStatus({ ...purchaseStatus, [item.id]: 'Error: Item already owned.' });
      return;
    }
    removeCredits(item.price);
    addToInventory(item.id);
    setPurchaseStatus({ ...purchaseStatus, [item.id]: 'Purchase successful.' });
  };

  return (
    <div className="p-4 border border-cyan-400">
      <h2 className="text-cyan-400 text-lg mb-2">[ SHOP TERMINAL ]</h2>
      <p>Welcome to the underground market. Select an item to purchase.</p>
      <ul className="mt-2">
        {shopItems.map((item) => (
          <li key={item.id} className="mb-2">
            <button
              onClick={() => handlePurchase(item)}
              className="w-full text-left p-1 bg-gray-800 hover:bg-cyan-700 disabled:opacity-50"
              disabled={inventory.includes(item.id)}
            >
              {item.name} - {item.price} credits
            </button>
            {purchaseStatus[item.id] && (
              <p className={`text-sm ${purchaseStatus[item.id].startsWith('Error') ? 'text-red-500' : 'text-green-500'}`}>
                {purchaseStatus[item.id]}
              </p>
            )}
          </li>
        ))}
      </ul>
      <div className="mt-4">
        <h3 className="text-cyan-400">Your Inventory:</h3>
        {inventory.length > 0 ? (
          <ul className="list-disc list-inside">
            {inventory.map(itemId => {
              const item = shopItems.find(i => i.id === itemId);
              return <li key={itemId}>{item ? item.name : 'Unknown Item'}</li>;
            })}
          </ul>
        ) : (
          <p>No items in inventory.</p>
        )}
      </div>
      <p className="mt-4 italic">Use 'view terminal' to return to CORE.</p>
    </div>
  );
};
