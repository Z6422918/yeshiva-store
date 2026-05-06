import { useState } from 'react';
import { useStore } from '../../store/useStore';
import { User, Users, Barcode, List, Trash2, Plus, Minus, CreditCard, Banknote } from 'lucide-react';
import type { BuyerType, CartItem } from '../../types';
import ProductListModal from './ProductListModal';
import PaymentModal from './PaymentModal';
import TransactionSummary from './TransactionSummary';
import type { Transaction } from '../../types';

export default function KupaPage() {
  const {
    cart, buyerType, setBuyerType, addToCart, updateCartItem, removeFromCart,
    products, completeTransaction
  } = useStore();

  const [barcodeInput, setBarcodeInput] = useState('');
  const [showProductList, setShowProductList] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [lastTransaction, setLastTransaction] = useState<Transaction | null>(null);

  const total = cart.reduce((s, i) => s + i.totalPrice, 0);

  const handleBarcodeSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const barcode = barcodeInput.trim();
    if (!barcode) return;
    const product = products.find(p => p.barcode === barcode && p.isActive);
    if (!product) { alert('מוצר לא נמצא'); return; }
    if (product.variants.length === 1) {
      const v = product.variants[0];
      const price = buyerType === 'yeshiva' ? v.yeshivaPrice : v.externalPrice;
      addToCart({
        productId: product.id,
        productName: product.name,
        variantId: v.id,
        variantDescription: [v.sizeType, v.details1, v.details2].filter(Boolean).join(' | '),
        quantity: 1,
        unitPrice: price,
        totalPrice: price,
      });
    } else {
      setShowProductList(true);
    }
    setBarcodeInput('');
  };

  const handlePaymentComplete = (method: 'cash' | 'credit', nedarimRef?: string) => {
    const tx = completeTransaction(method, nedarimRef);
    setLastTransaction(tx);
    setShowPayment(false);
  };

  if (lastTransaction) {
    return <TransactionSummary transaction={lastTransaction} onClose={() => setLastTransaction(null)} />;
  }

  return (
    <div className="flex gap-4 h-full">
      {/* Right side - product input */}
      <div className="flex-1 space-y-4">
        {/* Buyer type */}
        <div className="bg-white rounded-xl shadow p-4">
          <p className="text-sm font-semibold text-gray-600 mb-3">סוג קונה</p>
          <div className="flex gap-3">
            {(['yeshiva', 'external'] as BuyerType[]).map(type => (
              <button
                key={type}
                onClick={() => setBuyerType(type)}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg font-semibold text-sm transition border-2 ${
                  buyerType === type
                    ? 'bg-blue-700 text-white border-blue-700'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300'
                }`}
              >
                {type === 'yeshiva' ? <User size={18} /> : <Users size={18} />}
                {type === 'yeshiva' ? 'בן ישיבה' : 'חיצוני'}
              </button>
            ))}
          </div>
        </div>

        {/* Barcode search */}
        <div className="bg-white rounded-xl shadow p-4">
          <p className="text-sm font-semibold text-gray-600 mb-3">הוספת מוצר</p>
          <form onSubmit={handleBarcodeSearch} className="flex gap-2">
            <button type="submit" className="bg-blue-700 text-white px-4 py-2.5 rounded-lg hover:bg-blue-800 transition">
              <Barcode size={18} />
            </button>
            <input
              type="text"
              placeholder="סרוק ברקוד או הקלד מוצר..."
              value={barcodeInput}
              onChange={e => setBarcodeInput(e.target.value)}
              className="flex-1 border border-gray-300 rounded-lg px-3 py-2.5 text-right focus:outline-none focus:ring-2 focus:ring-blue-400"
              autoFocus
            />
          </form>
          <button
            onClick={() => setShowProductList(true)}
            className="mt-2 w-full flex items-center justify-center gap-2 text-blue-700 hover:bg-blue-50 py-2 rounded-lg text-sm font-medium transition"
          >
            <List size={16} />
            בחר מרשימת מוצרים
          </button>
        </div>

        {/* Cart items */}
        <div className="bg-white rounded-xl shadow p-4">
          <p className="text-sm font-semibold text-gray-600 mb-3">פריטים בעגלה</p>
          {cart.length === 0 ? (
            <p className="text-gray-400 text-center py-8">העגלה ריקה</p>
          ) : (
            <div className="space-y-2">
              {cart.map(item => (
                <CartItemRow
                  key={item.variantId}
                  item={item}
                  onQtyChange={(q) => updateCartItem(item.variantId, q)}
                  onRemove={() => removeFromCart(item.variantId)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Left side - summary & payment */}
      <div className="w-72 space-y-4">
        <div className="bg-white rounded-xl shadow p-5 sticky top-4">
          <h2 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2">סיכום עגלה</h2>
          <div className="space-y-2 mb-4">
            <div className="flex justify-between text-sm text-gray-600">
              <span>{cart.reduce((s, i) => s + i.quantity, 0)} פריטים</span>
              <span>כמות</span>
            </div>
            <div className="flex justify-between font-bold text-xl text-blue-800 pt-2 border-t">
              <span>₪{total.toFixed(2)}</span>
              <span>סה"כ לתשלום</span>
            </div>
            <div className="text-xs text-gray-400 text-left">
              מחיר {buyerType === 'yeshiva' ? 'בן ישיבה' : 'חיצוני'}
            </div>
          </div>
          <button
            onClick={() => setShowPayment(true)}
            disabled={cart.length === 0}
            className="w-full bg-green-600 text-white py-3 rounded-lg font-bold text-lg hover:bg-green-700 transition disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <CreditCard size={20} />
            לתשלום
          </button>
        </div>
      </div>

      {showProductList && (
        <ProductListModal
          buyerType={buyerType}
          onSelect={(item: CartItem) => { addToCart(item); setShowProductList(false); }}
          onClose={() => setShowProductList(false)}
        />
      )}

      {showPayment && (
        <PaymentModal
          total={total}
          onComplete={handlePaymentComplete}
          onClose={() => setShowPayment(false)}
        />
      )}
    </div>
  );
}

function CartItemRow({ item, onQtyChange, onRemove }: {
  item: CartItem;
  onQtyChange: (q: number) => void;
  onRemove: () => void;
}) {
  return (
    <div className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2">
      <button onClick={onRemove} className="text-red-400 hover:text-red-600 transition">
        <Trash2 size={15} />
      </button>
      <div className="flex items-center gap-2">
        <button onClick={() => onQtyChange(item.quantity + 1)} className="w-6 h-6 bg-blue-100 text-blue-700 rounded flex items-center justify-center hover:bg-blue-200">
          <Plus size={12} />
        </button>
        <span className="w-8 text-center font-semibold text-sm">{item.quantity}</span>
        <button onClick={() => onQtyChange(item.quantity - 1)} className="w-6 h-6 bg-gray-100 text-gray-600 rounded flex items-center justify-center hover:bg-gray-200">
          <Minus size={12} />
        </button>
      </div>
      <div className="text-right flex-1 mx-2">
        <p className="text-sm font-medium text-gray-800">{item.productName}</p>
        <p className="text-xs text-gray-500">{item.variantDescription}</p>
      </div>
      <div className="text-left">
        <p className="font-bold text-blue-800 text-sm">₪{item.totalPrice.toFixed(2)}</p>
        <p className="text-xs text-gray-400">₪{item.unitPrice} ליח'</p>
      </div>
    </div>
  );
}
