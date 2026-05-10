import { useState } from 'react';
import { useStore } from '../../store/useStore';
import { ScanLine, AlignJustify, Trash2, Plus, Minus, ChevronDown, ChevronUp } from 'lucide-react';
import type { BuyerType, CartItem } from '../../types';
import ProductListModal from './ProductListModal';
import PaymentModal from './PaymentModal';
import TransactionSummary from './TransactionSummary';
import type { Transaction } from '../../types';

const NAVY = '#1e3166';
const GOLD = '#8b7540';

export default function KupaPage() {
  const { cart, buyerType, setBuyerType, addToCart, updateCartItem, removeFromCart, products, completeTransaction, transactions } = useStore();
  const [barcodeInput, setBarcodeInput] = useState('');
  const [showProductList, setShowProductList] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [lastTransaction, setLastTransaction] = useState<Transaction | null>(null);
  const [showHistory, setShowHistory] = useState(false);

  const total = cart.reduce((s, i) => s + i.totalPrice, 0);

  const handleBarcode = (e: React.FormEvent) => {
    e.preventDefault();
    const code = barcodeInput.trim();
    if (!code) return;
    const product = products.find(p => p.barcode === code && p.isActive);
    if (!product) { alert('מוצר לא נמצא'); return; }
    const v = product.variants[0];
    if (!v) return;
    const price = buyerType === 'yeshiva' ? v.yeshivaPrice : v.externalPrice;
    addToCart({ productId: product.id, productName: product.name, variantId: v.id, variantDescription: [v.sizeType, v.details1, v.details2].filter(Boolean).join(' | '), quantity: 1, unitPrice: price, totalPrice: price });
    setBarcodeInput('');
  };

  const handlePaymentComplete = (method: 'cash' | 'credit', nedarimRef?: string) => {
    const tx = completeTransaction(method, nedarimRef);
    setLastTransaction(tx);
    setShowPayment(false);
  };

  if (lastTransaction) return <TransactionSummary transaction={lastTransaction} onClose={() => setLastTransaction(null)} />;

  const recentTx = [...(transactions || [])].reverse().slice(0, 10);

  return (
    <div className="flex h-[calc(100vh-108px)]" dir="rtl">

      {/* ══ RIGHT: main content ══ */}
      <div className="flex-1 overflow-y-auto bg-white">
        <div className="p-5 space-y-4 max-w-3xl">

          {/* Buyer type + barcode */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 space-y-4">

            {/* Buyer type */}
            <div className="flex items-center gap-4">
              <span className="text-sm font-bold text-gray-600 whitespace-nowrap">בחר סוג קונה:</span>
              <div className="flex gap-2">
                <button
                  onClick={() => setBuyerType('yeshiva')}
                  className="px-5 py-2 rounded-xl text-sm font-bold transition-all duration-150"
                  style={buyerType === 'yeshiva' ? { background: NAVY, color: '#fff' } : { background: '#f1f3f8', color: '#888' }}
                >
                  בן ישיבה
                </button>
                <button
                  onClick={() => setBuyerType('external')}
                  className="px-5 py-2 rounded-xl text-sm font-bold transition-all duration-150"
                  style={buyerType === 'external' ? { background: NAVY, color: '#fff' } : { background: '#f1f3f8', color: '#888' }}
                >
                  קונה מבחוץ
                </button>
              </div>
            </div>

            {/* Barcode input */}
            <form onSubmit={handleBarcode} className="flex gap-2">
              <button
                type="button"
                onClick={() => setShowProductList(true)}
                className="flex items-center gap-2 border border-gray-200 bg-gray-50 hover:bg-gray-100 text-gray-700 px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors whitespace-nowrap"
              >
                <AlignJustify size={15} />
                בחר מהרשימה
              </button>
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="הרוק ברקוד – נוסף אוטומטית"
                  value={barcodeInput}
                  onChange={e => setBarcodeInput(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-right text-sm font-medium outline-none focus:border-gray-400 transition-colors placeholder:text-gray-300"
                  autoFocus
                />
                <button type="submit" className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 transition-colors">
                  <ScanLine size={18} />
                </button>
              </div>
            </form>
          </div>

          {/* Cart */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3 border-b border-gray-50">
              <span className="text-xs text-gray-400 font-medium">
                {buyerType === 'yeshiva' ? 'מחיר בני ישיבה' : 'מחיר חיצוני'}
              </span>
              <h3 className="font-bold text-gray-800 text-sm">פריטים בקניה ({cart.length})</h3>
            </div>

            {cart.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 gap-3">
                {/* Scan bracket icon */}
                <div className="relative w-16 h-16">
                  <div className="absolute top-0 right-0 w-5 h-5 border-t-2 border-r-2 border-gray-300 rounded-tr-sm" />
                  <div className="absolute top-0 left-0 w-5 h-5 border-t-2 border-l-2 border-gray-300 rounded-tl-sm" />
                  <div className="absolute bottom-0 right-0 w-5 h-5 border-b-2 border-r-2 border-gray-300 rounded-br-sm" />
                  <div className="absolute bottom-0 left-0 w-5 h-5 border-b-2 border-l-2 border-gray-300 rounded-bl-sm" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <ScanLine size={20} className="text-gray-300" />
                  </div>
                </div>
                <p className="text-sm text-gray-400 font-semibold">סרוק מוצר כדי להתחיל</p>
              </div>
            ) : (
              <div className="p-3 space-y-2">
                {cart.map(item => (
                  <CartRow key={item.variantId} item={item} onQtyChange={q => updateCartItem(item.variantId, q)} onRemove={() => removeFromCart(item.variantId)} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ══ LEFT: summary panel ══ */}
      <div className="w-64 flex flex-col flex-shrink-0" style={{ background: NAVY }}>

        {/* Total */}
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          <p className="text-xs font-bold text-blue-200 uppercase tracking-widest mb-6">סה״כ לתשלום</p>

          {cart.length === 0 ? (
            <>
              <div className="text-3xl font-black text-white/25 tracking-widest mb-4">— — —</div>
              <p className="text-xs text-blue-300 mb-6 leading-relaxed">בחר סוג קונה כדי לראות מחיר</p>
              <button
                className="w-full py-3 rounded-xl font-bold text-sm text-white transition-all duration-150 hover:opacity-90"
                style={{ background: GOLD }}
              >
                בחר סוג קונה
              </button>
            </>
          ) : (
            <>
              <div className="text-4xl font-black text-white mb-2">₪{total.toFixed(2)}</div>
              <p className="text-xs text-blue-300 mb-6">{cart.reduce((s, i) => s + i.quantity, 0)} פריטים</p>
              <button
                onClick={() => setShowPayment(true)}
                className="w-full py-3 rounded-xl font-black text-base text-white transition-all duration-150 hover:opacity-90 active:scale-95"
                style={{ background: GOLD }}
              >
                לתשלום
              </button>
            </>
          )}
        </div>

        {/* Transaction history */}
        <div className="border-t border-white/10">
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="w-full flex items-center justify-between px-5 py-3 text-sm text-blue-200 hover:text-white transition-colors"
          >
            <span>{showHistory ? <ChevronDown size={15} /> : <ChevronUp size={15} />}</span>
            <span className="font-semibold">היסטוריית עסקאות</span>
          </button>

          {showHistory && (
            <div className="px-3 pb-3 space-y-1.5 max-h-56 overflow-y-auto">
              {recentTx.length === 0 ? (
                <p className="text-center text-blue-300 text-xs py-3">אין עסקאות עדיין</p>
              ) : recentTx.map(tx => (
                <div key={tx.id} className="rounded-xl px-3 py-2.5" style={{ background: 'rgba(255,255,255,0.08)' }}>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-blue-300">{tx.date}</span>
                    <span className="text-sm font-black text-white">₪{tx.total.toFixed(2)}</span>
                  </div>
                  <div className="text-[10px] text-blue-400 mt-0.5 text-right">
                    {tx.paymentMethod === 'cash' ? 'מזומן' : 'אשראי'} · {tx.buyerType === 'yeshiva' ? 'בן ישיבה' : 'חיצוני'}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {showProductList && (
        <ProductListModal buyerType={buyerType} onSelect={(item: CartItem) => { addToCart(item); setShowProductList(false); }} onClose={() => setShowProductList(false)} />
      )}
      {showPayment && (
        <PaymentModal total={total} onComplete={handlePaymentComplete} onClose={() => setShowPayment(false)} />
      )}
    </div>
  );
}

function CartRow({ item, onQtyChange, onRemove }: { item: CartItem; onQtyChange: (q: number) => void; onRemove: () => void }) {
  return (
    <div className="flex items-center gap-2 bg-gray-50 hover:bg-gray-100 rounded-xl px-3 py-2.5 border border-gray-100 transition-colors group">
      <button onClick={onRemove} className="text-gray-200 group-hover:text-red-400 transition-colors">
        <Trash2 size={14} />
      </button>
      <div className="flex items-center gap-1.5">
        <button onClick={() => onQtyChange(item.quantity + 1)} className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors font-bold text-white" style={{ background: NAVY }}>
          <Plus size={13} />
        </button>
        <span className="w-7 text-center font-black text-gray-800 text-sm">{item.quantity}</span>
        <button onClick={() => onQtyChange(Math.max(0, item.quantity - 1))} className="w-7 h-7 bg-gray-200 hover:bg-gray-300 rounded-lg flex items-center justify-center transition-colors text-gray-600">
          <Minus size={13} />
        </button>
      </div>
      <div className="flex-1 text-right">
        <p className="text-sm font-bold text-gray-800">{item.productName}</p>
        {item.variantDescription && <p className="text-xs text-gray-400">{item.variantDescription}</p>}
      </div>
      <div className="text-left min-w-[64px]">
        <p className="font-black text-sm" style={{ color: NAVY }}>₪{item.totalPrice.toFixed(2)}</p>
        <p className="text-[10px] text-gray-400">₪{item.unitPrice} × {item.quantity}</p>
      </div>
    </div>
  );
}
