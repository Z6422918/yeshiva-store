import { useState } from 'react';
import { useStore } from '../../store/useStore';
import { Scan, List, Trash2, Plus, Minus, ChevronDown, ChevronUp, ShoppingBag, Zap, GraduationCap, Users } from 'lucide-react';
import type { BuyerType, CartItem } from '../../types';
import ProductListModal from './ProductListModal';
import PaymentModal from './PaymentModal';
import TransactionSummary from './TransactionSummary';
import type { Transaction } from '../../types';

export default function KupaPage() {
  const { cart, buyerType, setBuyerType, addToCart, updateCartItem, removeFromCart, products, completeTransaction, transactions } = useStore();
  const [barcodeInput, setBarcodeInput] = useState('');
  const [showProductList, setShowProductList] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [lastTransaction, setLastTransaction] = useState<Transaction | null>(null);
  const [showHistory, setShowHistory] = useState(false);

  const total = cart.reduce((s, i) => s + i.totalPrice, 0);
  const itemCount = cart.reduce((s, i) => s + i.quantity, 0);

  const handleBarcodeSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const barcode = barcodeInput.trim();
    if (!barcode) return;
    const product = products.find(p => p.barcode === barcode && p.isActive);
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

  const recentTx = [...(transactions || [])].reverse().slice(0, 8);

  return (
    <div className="flex h-[calc(100vh-108px)]" dir="rtl">

      {/* ══════════ MAIN AREA ══════════ */}
      <div className="flex-1 p-5 overflow-y-auto space-y-4 bg-gradient-to-br from-slate-50 via-indigo-50/30 to-violet-50/20">

        {/* Buyer type selector */}
        <div className="animate-fade-in-up">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 px-1">סוג קונה</p>
          <div className="grid grid-cols-2 gap-3">
            <BuyerCard
              active={buyerType === 'yeshiva'}
              onClick={() => setBuyerType('yeshiva')}
              icon={<GraduationCap size={22} />}
              label="בן ישיבה"
              sub="מחיר מוגדר לישיבה"
              gradient="from-indigo-500 to-violet-600"
              shadow="shadow-indigo-200"
            />
            <BuyerCard
              active={buyerType === 'external'}
              onClick={() => setBuyerType('external')}
              icon={<Users size={22} />}
              label="קונה חיצוני"
              sub="מחיר רגיל"
              gradient="from-rose-500 to-orange-500"
              shadow="shadow-rose-200"
            />
          </div>
        </div>

        {/* Search / Barcode */}
        <div className="animate-fade-in-up bg-white rounded-3xl shadow-sm border border-gray-100 p-4">
          <form onSubmit={handleBarcodeSearch} className="flex gap-2">
            <button
              type="button"
              onClick={() => setShowProductList(true)}
              className="flex items-center gap-2 bg-gradient-to-l from-indigo-50 to-violet-50 hover:from-indigo-100 hover:to-violet-100 text-indigo-700 border border-indigo-200 px-4 py-3 rounded-2xl text-sm font-bold transition-all duration-200 whitespace-nowrap"
            >
              <List size={16} />
              בחר מהרשימה
            </button>
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="סרוק ברקוד – נוסף אוטומטית"
                value={barcodeInput}
                onChange={e => setBarcodeInput(e.target.value)}
                className="w-full bg-gray-50 border-2 border-gray-100 focus:border-indigo-300 rounded-2xl px-4 py-3 text-right text-sm font-medium transition-all duration-200 outline-none placeholder:text-gray-300"
                autoFocus
              />
              <button type="submit" className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 bg-indigo-600 hover:bg-indigo-700 rounded-xl flex items-center justify-center transition-colors">
                <Scan size={16} className="text-white" />
              </button>
            </div>
          </form>
        </div>

        {/* Cart items */}
        <div className="animate-fade-in-up bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-50">
            <div className="flex items-center gap-2">
              {cart.length > 0 && (
                <span className="bg-indigo-600 text-white text-xs font-black rounded-full w-5 h-5 flex items-center justify-center">{cart.length}</span>
              )}
              <span className="text-xs text-gray-400 font-semibold">
                {buyerType === 'yeshiva' ? '💙 מחיר בני ישיבה' : '🔴 מחיר חיצוני'}
              </span>
            </div>
            <h3 className="font-black text-gray-700">פריטים בקניה ({cart.length})</h3>
          </div>

          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-gray-300">
              <div className="relative mb-4">
                <div className="w-20 h-20 bg-gradient-to-br from-indigo-50 to-violet-50 rounded-3xl flex items-center justify-center">
                  <Scan size={32} className="text-indigo-300" />
                </div>
                <div className="absolute -top-1 -right-1 w-6 h-6 bg-indigo-100 rounded-full flex items-center justify-center">
                  <Zap size={12} className="text-indigo-400" />
                </div>
              </div>
              <p className="text-sm font-semibold text-gray-400">סרוק מוצר כדי להתחיל</p>
              <p className="text-xs text-gray-300 mt-1">או בחר מהרשימה למעלה</p>
            </div>
          ) : (
            <div className="p-3 space-y-2">
              {cart.map(item => (
                <CartItemRow key={item.variantId} item={item} onQtyChange={q => updateCartItem(item.variantId, q)} onRemove={() => removeFromCart(item.variantId)} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ══════════ SIDE PANEL ══════════ */}
      <div className="w-72 flex flex-col bg-gradient-to-b from-indigo-700 via-violet-700 to-purple-800 shadow-2xl relative overflow-hidden">
        {/* decorative */}
        <div className="absolute top-0 left-0 w-full h-40 bg-white/5 rounded-b-full blur-3xl" />
        <div className="absolute bottom-20 right-0 w-24 h-24 bg-purple-400/20 rounded-full blur-2xl" />

        <div className="relative z-10 flex flex-col flex-1 p-5">

          {/* Icon */}
          <div className="flex justify-center mb-4">
            <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center border border-white/20">
              <ShoppingBag size={28} className="text-white" />
            </div>
          </div>

          <p className="text-center text-xs font-bold text-indigo-200 uppercase tracking-widest mb-2">סה״כ לתשלום</p>

          {/* Amount */}
          <div className="text-center mb-6">
            {cart.length === 0 ? (
              <>
                <div className="text-4xl font-black text-white/30 tracking-widest">₪ - - -</div>
                <p className="text-xs text-indigo-300 mt-2">בחר סוג קונה והוסף מוצרים</p>
              </>
            ) : (
              <>
                <div className="text-5xl font-black text-white tracking-tight">₪{total.toFixed(2)}</div>
                <div className="flex justify-center gap-3 mt-2">
                  <span className="text-xs bg-white/10 text-indigo-200 rounded-full px-3 py-0.5">{itemCount} פריטים</span>
                  <span className="text-xs bg-white/10 text-indigo-200 rounded-full px-3 py-0.5">{cart.length} מוצרים</span>
                </div>
              </>
            )}
          </div>

          {/* Pay button */}
          <button
            onClick={() => cart.length > 0 && setShowPayment(true)}
            disabled={cart.length === 0}
            className={`w-full py-4 rounded-2xl font-black text-lg transition-all duration-300 ${
              cart.length > 0
                ? 'btn-shimmer text-white shadow-2xl shadow-green-900/50 hover:scale-[1.03] active:scale-95 animate-pulse-glow'
                : 'bg-white/10 text-white/30 cursor-not-allowed'
            }`}
          >
            {cart.length > 0 ? '💳 לתשלום' : 'הוסף מוצרים'}
          </button>

          {/* Stats */}
          {cart.length > 0 && (
            <div className="mt-4 grid grid-cols-2 gap-2">
              <div className="bg-white/10 rounded-xl p-2.5 text-center border border-white/10">
                <div className="text-lg font-black text-white">{itemCount}</div>
                <div className="text-[10px] text-indigo-300">פריטים</div>
              </div>
              <div className="bg-white/10 rounded-xl p-2.5 text-center border border-white/10">
                <div className="text-lg font-black text-white">{buyerType === 'yeshiva' ? '💙' : '🔴'}</div>
                <div className="text-[10px] text-indigo-300">{buyerType === 'yeshiva' ? 'ישיבה' : 'חיצוני'}</div>
              </div>
            </div>
          )}
        </div>

        {/* History */}
        <div className="relative z-10 border-t border-white/10">
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="w-full flex items-center justify-between px-5 py-3.5 text-sm text-indigo-200 hover:text-white transition-colors"
          >
            <span>{showHistory ? <ChevronDown size={16}/> : <ChevronUp size={16}/>}</span>
            <span className="font-bold">היסטוריית עסקאות</span>
          </button>

          {showHistory && (
            <div className="px-3 pb-4 space-y-1.5 max-h-52 overflow-y-auto">
              {recentTx.length === 0 ? (
                <p className="text-center text-indigo-300 text-xs py-3">אין עסקאות עדיין</p>
              ) : recentTx.map(tx => (
                <div key={tx.id} className="bg-white/10 rounded-xl px-3 py-2 border border-white/5">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-indigo-300">{tx.date}</span>
                    <span className="text-sm font-black text-white">₪{tx.total.toFixed(2)}</span>
                  </div>
                  <div className="text-[10px] text-indigo-400 mt-0.5 text-right">
                    {tx.paymentMethod === 'cash' ? '💵 מזומן' : '💳 אשראי'} · {tx.buyerType === 'yeshiva' ? 'בן ישיבה' : 'חיצוני'}
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

function BuyerCard({ active, onClick, icon, label, sub, gradient, shadow }: {
  active: boolean; onClick: () => void; icon: React.ReactNode;
  label: string; sub: string; gradient: string; shadow: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`relative overflow-hidden rounded-2xl p-4 flex items-center gap-3 font-bold text-sm transition-all duration-300 border-2 ${
        active
          ? `bg-gradient-to-l ${gradient} text-white border-transparent shadow-lg ${shadow} scale-[1.02]`
          : 'bg-white text-gray-600 border-gray-100 hover:border-indigo-200 hover:shadow-md'
      }`}
    >
      {active && <div className="absolute inset-0 bg-white/10" />}
      <div className={`relative z-10 w-10 h-10 rounded-xl flex items-center justify-center ${active ? 'bg-white/20' : 'bg-gray-100'}`}>
        {icon}
      </div>
      <div className="relative z-10 text-right">
        <div className="font-black">{label}</div>
        <div className={`text-xs font-normal ${active ? 'text-white/70' : 'text-gray-400'}`}>{sub}</div>
      </div>
      {active && <div className="absolute top-2 left-2 w-2 h-2 bg-white/50 rounded-full" />}
    </button>
  );
}

function CartItemRow({ item, onQtyChange, onRemove }: { item: CartItem; onQtyChange: (q: number) => void; onRemove: () => void }) {
  return (
    <div className="flex items-center gap-2 bg-gradient-to-l from-gray-50 to-slate-50 rounded-2xl px-3 py-2.5 border border-gray-100 hover:border-indigo-100 hover:shadow-sm transition-all duration-200 group">
      <button onClick={onRemove} className="text-gray-200 hover:text-red-400 transition-colors p-1 opacity-0 group-hover:opacity-100">
        <Trash2 size={14} />
      </button>
      <div className="flex items-center gap-1.5">
        <button onClick={() => onQtyChange(item.quantity + 1)} className="w-7 h-7 bg-indigo-100 hover:bg-indigo-200 text-indigo-700 rounded-lg flex items-center justify-center transition-colors font-bold">
          <Plus size={13} />
        </button>
        <span className="w-7 text-center font-black text-gray-800 text-sm">{item.quantity}</span>
        <button onClick={() => onQtyChange(Math.max(0, item.quantity - 1))} className="w-7 h-7 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-lg flex items-center justify-center transition-colors">
          <Minus size={13} />
        </button>
      </div>
      <div className="flex-1 text-right">
        <p className="text-sm font-bold text-gray-800">{item.productName}</p>
        {item.variantDescription && <p className="text-xs text-gray-400">{item.variantDescription}</p>}
      </div>
      <div className="text-left min-w-[64px]">
        <p className="font-black text-indigo-700 text-sm">₪{item.totalPrice.toFixed(2)}</p>
        <p className="text-[10px] text-gray-400">₪{item.unitPrice} × {item.quantity}</p>
      </div>
    </div>
  );
}
