import { useState } from 'react';
import { useStore } from '../../store/useStore';
import { ScanLine, AlignJustify, Trash2, Plus, Minus, Clock } from 'lucide-react';
import type { CartItem } from '../../types';
import ProductListModal from './ProductListModal';
import PaymentModal from './PaymentModal';
import TransactionSummary from './TransactionSummary';
import type { Transaction } from '../../types';

const NAVY = '#1e3166';
const GOLD = '#c8890a';

export default function KupaPage() {
  const { cart, buyerType, setBuyerType, addToCart, updateCartItem, removeFromCart, clearCart, products, completeTransaction, transactions } = useStore();
  const [barcodeInput, setBarcodeInput] = useState('');
  const [showProductList, setShowProductList] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [lastTransaction, setLastTransaction] = useState<Transaction | null>(null);

  const total = cart.reduce((s, i) => s + i.totalPrice, 0);
  const totalQty = cart.reduce((s, i) => s + i.quantity, 0);
  const recentTx = [...(transactions || [])].reverse().slice(0, 15);

  const handleBarcode = (e: React.FormEvent) => {
    e.preventDefault();
    const code = barcodeInput.trim();
    if (!code) return;
    const product = products.find(p => p.barcode === code && p.isActive);
    if (!product) { alert('מוצר לא נמצא'); return; }
    const v = product.variants[0];
    if (!v) return;
    const price = buyerType === 'yeshiva' ? v.yeshivaPrice : v.externalPrice;
    addToCart({
      productId: product.id,
      productName: product.name,
      variantId: v.id,
      variantDescription: [v.sizeType, v.details1, v.details2].filter(Boolean).join(' • '),
      quantity: 1,
      unitPrice: price,
      totalPrice: price,
    });
    setBarcodeInput('');
  };

  const handlePaymentComplete = (method: 'cash' | 'credit', nedarimRef?: string) => {
    const tx = completeTransaction(method, nedarimRef);
    setLastTransaction(tx);
    setShowPayment(false);
  };

  if (lastTransaction) return <TransactionSummary transaction={lastTransaction} onClose={() => setLastTransaction(null)} />;

  return (
    <div className="flex h-[calc(100vh-108px)]" dir="rtl">

      {/* ══ RIGHT: main content ══ */}
      <div className="flex-1 overflow-y-auto" style={{ background: '#f4f6fb' }}>
        <div className="p-4 space-y-3 max-w-3xl">

          {/* ── Buyer type + barcode card ── */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">

            {/* Buyer type row */}
            <div className="flex items-center gap-3 px-4 pt-4 pb-3 flex-wrap">
              {/* Active buyer badge */}
              <div
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-black"
                style={{ background: NAVY, color: '#fff' }}
              >
                <span>{buyerType === 'yeshiva' ? '💙' : '🌐'}</span>
                {buyerType === 'yeshiva' ? 'בן ישיבה' : 'קונה מבחוץ'}
              </div>

              {/* Switch buyer type */}
              <button
                onClick={() => setBuyerType(buyerType === 'yeshiva' ? 'external' : 'yeshiva')}
                className="px-4 py-2 rounded-xl text-sm font-bold border border-gray-200 bg-gray-50 hover:bg-gray-100 text-gray-600 transition-all"
              >
                שנה סוג קונה
              </button>

              {/* Clear cart */}
              {cart.length > 0 && (
                <button
                  onClick={() => { if (window.confirm('לאפס את הקניה?')) clearCart(); }}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-bold text-red-400 border border-red-100 bg-red-50 hover:bg-red-100 transition-all"
                >
                  <Trash2 size={13} />
                  איפוס קניה
                </button>
              )}
            </div>

            {/* Barcode row */}
            <div className="flex gap-2 px-4 pb-4">
              <button
                type="button"
                onClick={() => setShowProductList(true)}
                className="flex items-center gap-2 border border-gray-200 bg-gray-50 hover:bg-gray-100 text-gray-600 px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors whitespace-nowrap"
              >
                <AlignJustify size={14} />
                בחר מהרשימה
              </button>
              <form onSubmit={handleBarcode} className="relative flex-1">
                <input
                  type="text"
                  placeholder="סרוק ברקוד – נוסף אוטומטית"
                  value={barcodeInput}
                  onChange={e => setBarcodeInput(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-right text-sm font-medium outline-none focus:border-blue-300 transition-colors placeholder:text-gray-300"
                  autoFocus
                />
                <button type="submit" className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
                  <ScanLine size={17} />
                </button>
              </form>
            </div>
          </div>

          {/* ── Cart ── */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3 border-b border-gray-50">
              <span className="text-xs text-gray-400 font-medium">
                {buyerType === 'yeshiva' ? '💙 מחיר בני ישיבה' : '🌐 מחיר חיצוני'}
              </span>
              <h3 className="font-bold text-gray-800 text-sm">
                פריטים בקניה ({cart.length})
              </h3>
            </div>

            {cart.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 gap-3">
                <div className="relative w-14 h-14">
                  <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-gray-200 rounded-tr" />
                  <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-gray-200 rounded-tl" />
                  <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-gray-200 rounded-br" />
                  <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-gray-200 rounded-bl" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <ScanLine size={18} className="text-gray-300" />
                  </div>
                </div>
                <p className="text-sm text-gray-400 font-semibold">סרוק מוצר כדי להתחיל</p>
              </div>
            ) : (
              <div className="p-3 space-y-2">
                {cart.map(item => (
                  <CartRow
                    key={item.variantId}
                    item={item}
                    onQtyChange={q => updateCartItem(item.variantId, q)}
                    onRemove={() => removeFromCart(item.variantId)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ══ LEFT: two stacked cards ══ */}
      <div className="w-[260px] flex flex-col flex-shrink-0 gap-0" style={{ background: '#f4f6fb' }}>

        {/* ── Card 1: Total + Pay ── */}
        <div className="m-3 mb-2 rounded-2xl p-5 text-center flex flex-col items-center" style={{ background: NAVY }}>
          <p className="text-[10px] font-bold tracking-widest uppercase mb-3" style={{ color: 'rgba(197,202,233,0.7)' }}>
            סה״כ לתשלום
          </p>

          {cart.length === 0 ? (
            <>
              <div className="text-3xl font-black mb-1" style={{ color: 'rgba(255,255,255,0.15)', letterSpacing: 6 }}>— —</div>
              <p className="text-xs mb-5" style={{ color: 'rgba(197,202,233,0.5)' }}>העגלה ריקה</p>
            </>
          ) : (
            <>
              <div className="text-4xl font-black text-white mb-1 leading-none">₪{total.toFixed(2)}</div>
              <p className="text-xs mb-5" style={{ color: 'rgba(197,202,233,0.6)' }}>{totalQty} פריטים</p>
            </>
          )}

          <button
            onClick={() => cart.length > 0 && setShowPayment(true)}
            disabled={cart.length === 0}
            className="w-full py-3 rounded-xl font-black text-base text-white transition-all duration-150 hover:opacity-90 active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed"
            style={{ background: GOLD }}
          >
            לתשלום
          </button>
        </div>

        {/* ── Card 2: Transaction history ── */}
        <div className="mx-3 mb-3 flex-1 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-50">
            <Clock size={13} className="text-gray-300" />
            <span className="text-sm font-bold text-gray-700">היסטוריית עסקאות</span>
          </div>

          <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
            {recentTx.length === 0 ? (
              <p className="text-center text-gray-300 text-xs py-6">אין עסקאות עדיין</p>
            ) : recentTx.map(tx => {
              const isCash = tx.paymentMethod === 'cash';
              return (
                <div key={tx.id} className="rounded-xl px-3 py-2.5 border border-gray-50 hover:border-gray-100 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-black" style={{ color: NAVY }}>₪{tx.totalAmount.toFixed(2)}</span>
                    <span
                      className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                      style={isCash
                        ? { background: '#e8f5e9', color: '#2e7d32' }
                        : { background: '#e3f2fd', color: '#1565c0' }}
                    >
                      {isCash ? '💵 מזומן' : '💳 אשראי'}
                    </span>
                  </div>
                  <div className="text-[10px] text-gray-400 mt-0.5 text-right">
                    {tx.date}
                  </div>
                </div>
              );
            })}
          </div>
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
        <PaymentModal total={total} onComplete={handlePaymentComplete} onClose={() => setShowPayment(false)} />
      )}
    </div>
  );
}

function CartRow({ item, onQtyChange, onRemove }: {
  item: CartItem;
  onQtyChange: (q: number) => void;
  onRemove: () => void;
}) {
  return (
    <div className="flex items-center gap-2.5 bg-gray-50 hover:bg-gray-100 rounded-xl px-3 py-3 border border-gray-100 transition-colors group">

      {/* Item info — RIGHT in RTL */}
      <div className="flex-1 text-right min-w-0">
        <p className="text-sm font-bold text-gray-800 truncate">{item.productName}</p>
        {item.variantDescription && (
          <p className="text-[11px] text-gray-400 mt-0.5 truncate">{item.variantDescription}</p>
        )}
        <p className="text-[11px] font-semibold mt-0.5" style={{ color: NAVY }}>
          מחיר ליחידה ₪{item.unitPrice.toFixed(2)}
        </p>
      </div>

      {/* Qty controls */}
      <div className="flex items-center gap-1.5 flex-shrink-0">
        <button
          onClick={() => onQtyChange(item.quantity + 1)}
          className="w-7 h-7 rounded-lg flex items-center justify-center font-bold text-white transition-all hover:opacity-80"
          style={{ background: NAVY }}
        >
          <Plus size={13} />
        </button>
        <span className="w-6 text-center font-black text-gray-800 text-sm">{item.quantity}</span>
        <button
          onClick={() => onQtyChange(Math.max(0, item.quantity - 1))}
          className="w-7 h-7 bg-gray-200 hover:bg-gray-300 rounded-lg flex items-center justify-center transition-colors text-gray-600"
        >
          <Minus size={13} />
        </button>
      </div>

      {/* Total price */}
      <div className="text-left flex-shrink-0 min-w-[56px]">
        <p className="font-black text-sm" style={{ color: NAVY }}>₪{item.totalPrice.toFixed(2)}</p>
      </div>

      {/* Remove — FAR LEFT in RTL */}
      <button
        onClick={onRemove}
        className="text-gray-200 group-hover:text-red-400 transition-colors flex-shrink-0"
      >
        <Trash2 size={14} />
      </button>
    </div>
  );
}
