import { useState } from 'react';
import { useStore } from '../../store/useStore';
import { X, Search } from 'lucide-react';
import type { BuyerType, CartItem } from '../../types';

interface Props {
  buyerType: BuyerType;
  onSelect: (item: CartItem) => void;
  onClose: () => void;
}

export default function ProductListModal({ buyerType, onSelect, onClose }: Props) {
  const products = useStore(s => s.products);
  const suppliers = useStore(s => s.suppliers);
  const [search, setSearch] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null);

  const activeProducts = products.filter(p => p.isActive);
  const filtered = activeProducts.filter(p =>
    p.name.includes(search) || p.barcode.includes(search) || p.category.includes(search)
  );

  const product = selectedProduct ? products.find(p => p.id === selectedProduct) : null;

  const handleSelectVariant = (variantId: string) => {
    if (!product) return;
    const v = product.variants.find(v => v.id === variantId);
    if (!v) return;
    const price = buyerType === 'yeshiva' ? v.yeshivaPrice : v.externalPrice;
    onSelect({
      productId: product.id,
      productName: product.name,
      variantId: v.id,
      variantDescription: [v.sizeType, v.details1, v.details2].filter(Boolean).join(' | '),
      quantity: 1,
      unitPrice: price,
      totalPrice: price,
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col">
        <div className="flex items-center justify-between p-5 border-b">
          <h2 className="text-lg font-bold text-gray-800">
            {product ? `בחר סוג - ${product.name}` : 'בחר מוצר'}
          </h2>
          <button onClick={product ? () => setSelectedProduct(null) : onClose} className="text-gray-400 hover:text-gray-600">
            <X size={22} />
          </button>
        </div>

        {!product ? (
          <>
            <div className="p-4 border-b">
              <div className="relative">
                <Search size={16} className="absolute right-3 top-2.5 text-gray-400" />
                <input
                  type="text"
                  placeholder="חיפוש מוצר..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg py-2 pr-9 pl-3 text-right focus:outline-none focus:ring-2 focus:ring-blue-400"
                  autoFocus
                />
              </div>
            </div>
            <div className="overflow-y-auto flex-1 p-4 space-y-2">
              {filtered.length === 0 && <p className="text-center text-gray-400 py-8">לא נמצאו מוצרים</p>}
              {filtered.map(p => {
                const supplier = suppliers.find(s => s.id === p.supplierId);
                return (
                  <button
                    key={p.id}
                    onClick={() => setSelectedProduct(p.id)}
                    className="w-full text-right bg-gray-50 hover:bg-blue-50 rounded-lg px-4 py-3 transition border border-transparent hover:border-blue-200"
                  >
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-400">{p.category}</span>
                      <span className="font-semibold text-gray-800">{p.name}</span>
                    </div>
                    <div className="flex justify-between items-center mt-1">
                      <span className="text-xs text-gray-400">{supplier?.name}</span>
                      <span className="text-xs text-gray-500">{p.variants.length} סוגים</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </>
        ) : (
          <div className="overflow-y-auto flex-1 p-4 space-y-2">
            {product.variants.map(v => {
              const price = buyerType === 'yeshiva' ? v.yeshivaPrice : v.externalPrice;
              const desc = [v.sizeType, v.details1, v.details2].filter(Boolean).join(' | ');
              return (
                <button
                  key={v.id}
                  onClick={() => handleSelectVariant(v.id)}
                  className="w-full text-right bg-gray-50 hover:bg-blue-50 rounded-lg px-4 py-3 transition border border-transparent hover:border-blue-200"
                >
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-blue-700 text-lg">₪{price.toFixed(2)}</span>
                    <span className="font-semibold text-gray-800">{desc || 'ברירת מחדל'}</span>
                  </div>
                  <div className="flex justify-between mt-1">
                    <span className="text-xs text-gray-400">במלאי: {v.currentStock}</span>
                    <span className="text-xs text-gray-500">
                      {buyerType === 'yeshiva' ? `חיצוני: ₪${v.externalPrice}` : `ישיבה: ₪${v.yeshivaPrice}`}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
