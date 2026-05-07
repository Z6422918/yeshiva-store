import { useState } from 'react';
import { useStore } from '../../store/useStore';
import { Scan, List, Trash2, Plus, Minus, ChevronDown, ChevronUp } from 'lucide-react';
import type { BuyerType, CartItem } from '../../types';
import ProductListModal from './ProductListModal';
import PaymentModal from './PaymentModal';
import TransactionSummary from './TransactionSummary';
import type { Transaction } from '../../types';

export default function KupaPage() {
  const {
    cart, buyerType, setBuyerType, addToCart, updateCartItem, removeFromCart,
    products, completeTransaction, transactions
  } = useStore();

  const [barcodeInput, setBarcodeInput] = useState('');
  const [showProductList, setShowProductList] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [lastTransaction, setLastTransaction] = useState<Transaction | null>(null);
  const [showHistory, setShowHistory] = useState(false);

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

  const recentTransactions = [...(transactions || [])].reverse().slice(0, 10);

  return (
    <div className="flex h-[calc(100vh-112px)]" dir="rtl">

      {/* RIGHT: main area */}
      <div className="flex-1 p-6 overflow-y-auto space-y-4">

        {/* Buyer type + barcode row */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
          {/* Buyer type */}
          <div className="flex items-center gap-4 mb-4">
            <span className="text-sm font-semibold text-gray-600">בחר סוג קונה:</span>
            <div className="flex gap-2">
              <button
                onClick={() => setBuyerType('yeshiva')}
                className={`flex items-center gap-1.5 px-5 py-2 rounded-lg font-semibold text-sm transition ${
                  buyerType === 'yeshiva'
                    ? 'bg-[#1a2e6e] text-white shadow'
                    : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                }`}
              >
                בן ישיבה
              </button>
              <button
                onClick={() => setBuyerType('external')}
                className={`flex items-center gap-1.5 px-5 py-2 rounded-lg font-semibold text-sm transition ${
                  buyerType === 'external'
                    ? 'bg-[#1a2e6e] text-white shadow'
                    : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                }`}
              >
                קונה מבחוץ
              </button>
            </div>
          </div>

          {/* Barcode input */}
          <form onSubmit={handleBarcodeSearch} className="flex gap-2">
            <button
              type="button"
              onClick={() => setShowProductList(true)}
              className="flex items-center gap-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2.5 rounded-xl text-sm font-semibold transition border border-gray-200"
            >
              <List size={16} />
              בחר מהרשימה
            </button>
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="הרוק ברקוד – נוסף אוטומטית"
                value={barcodeInput}
                onChange={e => setBarcodeInput(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-right text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 bg-gray-50"
                autoFocus
              />
              <button type="submit" className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-blue-600">
                <Scan size={18} />
              </button>
            </div>
          </form>
        </div>

        {/* Cart items */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs text-gray-400">מחיר {buyerType === 'yeshiva' ? 'בן ישיבה' : 'חיצוני'}</span>
            <h3 className="font-semibold text-gray-700 text-sm">פריטים בקניה ({cart.length})</h3>
          </div>

          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-14 text-gray-300">
              <div className="w-16 h-16 border-2 border-dashed border-gray-200 rounded-2xl flex items-center justify-center mb-3">
                <Scan size={28} className="text-gray-300" />
              </div>
              <p className="text-sm text-gray-400">סרוק מוצר כדי להתחיל</p>
            </div>
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

      {/* LEFT: summary panel */}
      <div className="w-72 bg-[#1a2e6e] flex flex-col text-white">

        {/* Total section */}
        <div className="p-6 flex-1 flex flex-col">
          <h2 className="text-sm font-semibold text-blue-200 mb-6 text-center">סה"כ לתשלום</h2>

          {cart.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-3">
              <div className="text-3xl font-bold tracking-widest text-blue-300">— — —</div>
              <p className="text-xs text-blue-300 text-center">בחר סוג קונה כדי לראות מחיר</p>
              <button
                onClick={() => {}}
                className="mt-4 w-full bg-[#8b7a3d] hover:bg-[#7a6a30] text-white py-3 rounded-xl font-bold text-sm transition"
              >
                בחר סוג קונה
              </button>
            </div>
          ) : (
            <div className="flex-1 flex flex-col">
              <div className="text-center mb-6">
                <div className="text-4xl font-bold tracking-wide">₪{total.toFixed(2)}</div>
                <div className="text-xs text-blue-300 mt-1">{cart.reduce((s, i) => s + i.quantity, 0)} פריטים</div>
              </div>
              <button
                onClick={() => setShowPayment(true)}
                className="w-full bg-[#8b7a3d] hover:bg-[#7a6a30] text-white py-3 rounded-xl font-bold text-base transition shadow-lg mt-auto"
              >
                לתשלום
              </button>
            </div>
          )}
        </div>

        {/* Transaction history */}
        <div className="border-t border-blue-800">
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="w-full flex items-center justify-between px-5 py-3 text-sm text-blue-200 hover:text-white transition"
          >
            <span>{showHistory ? <ChevronDown size={16} /> : <ChevronUp size={16} />}</span>
            <span className="font-semibold">היסטוריית עסקאות</span>
          </button>

          {showHistory && (
            <div className="px-4 pb-4 space-y-2 max-h-64 overflow-y-auto">
              {recentTransactions.length === 0 ? (
                <p className="text-blue-300 text-xs text-center py-3">אין עסקאות עדיין</p>
              ) : (
                recentTransactions.map((tx) => (
                  <div key={tx.id} className="bg-blue-800 rounded-lg p-2.5">
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-blue-300">{tx.date}</span>
                      <span className="text-sm font-bold">₪{tx.total.toFixed(2)}</span>
                    </div>
                    <div className="text-xs text-blue-300 mt-0.5 text-right">
                      {tx.paymentMethod === 'cash' ? 'מזומן' : 'אשראי'} · {tx.buyerType === 'yeshiva' ? 'בן ישיבה' : 'חיצוני'}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
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
    <div className="flex items-center justify-between bg-gray-50 rounded-xl px-3 py-2.5 border border-gray-100">
      <button onClick={onRemove} className="text-red-300 hover:text-red-500 transition p-1">
        <Trash2 size={14} />
      </button>
      <div className="flex items-center gap-2 mx-2">
        <button
          onClick={() => onQtyChange(item.quantity + 1)}
          className="w-7 h-7 bg-blue-100 text-blue-700 rounded-lg flex items-center justify-center hover:bg-blue-200 transition"
        >
          <Plus size={13} />
        </button>
        <span className="w-7 text-center font-bold text-sm text-gray-800">{item.quantity}</span>
        <button
          onClick={() => onQtyChange(Math.max(0, item.quantity - 1))}
          className="w-7 h-7 bg-gray-100 text-gray-600 rounded-lg flex items-center justify-center hover:bg-gray-200 transition"
        >
          <Minus size={13} />
        </button>
      </div>
      <div className="text-right flex-1">
        <p className="text-sm font-semibold text-gray-800">{item.productName}</p>
        {item.variantDescription && (
          <p className="text-xs text-gray-400">{item.variantDescription}</p>
        )}
      </div>
      <div className="text-left ml-2 min-w-[60px]">
        <p className="font-bold text-[#1a2e6e] text-sm">₪{item.totalPrice.toFixed(2)}</p>
        <p className="text-xs text-gray-400">₪{item.unitPrice} ×{item.quantity}</p>
      </div>
    </div>
  );
}
