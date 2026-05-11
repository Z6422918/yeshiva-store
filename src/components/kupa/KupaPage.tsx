import { useState } from 'react';
import { useStore } from '../../store/useStore';
import { ScanLine, AlignJustify, Trash2, Plus, Minus, Clock, ChevronDown } from 'lucide-react';
import type { CartItem } from '../../types';
import ProductListModal from './ProductListModal';
import PaymentModal from './PaymentModal';
import TransactionSummary from './TransactionSummary';
import type { Transaction } from '../../types';

const NAVY = '#1e3166';
const GOLD = '#d4a017';

export default function KupaPage() {
  const {
    cart, buyerType, setBuyerType,
    addToCart, updateCartItem, removeFromCart, clearCart,
    products, completeTransaction, transactions,
  } = useStore();

  const [barcodeInput, setBarcodeInput] = useState('');
  const [showProductList, setShowProductList] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [lastTransaction, setLastTransaction] = useState<Transaction | null>(null);

  const total = cart.reduce((s, i) => s + i.totalPrice, 0);
  const totalQty = cart.reduce((s, i) => s + i.quantity, 0);
  const recentTx = [...(transactions || [])].reverse().slice(0, 20);

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
    <div style={{ display: 'flex', height: 'calc(100vh - 108px)', direction: 'rtl', background: '#f0f2f8' }}>

      {/* ══════════════════════════════
          RIGHT: main content area
      ══════════════════════════════ */}
      <div style={{ flex: 1, overflowY: 'auto', padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>

        {/* ── Controls card ── */}
        <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #eaecf5', boxShadow: '0 1px 8px rgba(26,35,126,0.06)' }}>

          {/* Row 1: buyer type buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '14px 16px 10px', flexWrap: 'wrap' }}>

            {/* Active buyer badge */}
            <button
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '7px 16px', borderRadius: 10,
                background: NAVY, color: '#fff',
                border: 'none', fontSize: 13, fontWeight: 800,
                cursor: 'pointer', fontFamily: 'inherit',
              }}
            >
              {buyerType === 'yeshiva' ? '💙' : '🌐'}
              {buyerType === 'yeshiva' ? 'בן ישיבה' : 'קונה מבחוץ'}
            </button>

            {/* Switch type */}
            <button
              onClick={() => setBuyerType(buyerType === 'yeshiva' ? 'external' : 'yeshiva')}
              style={{
                padding: '7px 16px', borderRadius: 10,
                background: '#f4f6fb', color: '#555',
                border: '1.5px solid #e0e4f0', fontSize: 13, fontWeight: 700,
                cursor: 'pointer', fontFamily: 'inherit',
              }}
            >
              שנה סוג קונה
            </button>

            {/* Cart type indicator */}
            <button
              style={{
                padding: '7px 16px', borderRadius: 10,
                background: '#f4f6fb', color: '#888',
                border: '1.5px solid #e0e4f0', fontSize: 13, fontWeight: 700,
                cursor: 'pointer', fontFamily: 'inherit',
              }}
            >
              מוצר קניה ✕
            </button>

            {/* Clear cart */}
            <button
              onClick={() => cart.length > 0 && window.confirm('לאפס את הקניה?') && clearCart()}
              style={{
                padding: '7px 16px', borderRadius: 10,
                background: '#f4f6fb', color: '#888',
                border: '1.5px solid #e0e4f0', fontSize: 13, fontWeight: 700,
                cursor: 'pointer', fontFamily: 'inherit',
              }}
            >
              איפוס קניה
            </button>
          </div>

          {/* Row 2: barcode */}
          <div style={{ display: 'flex', gap: 8, padding: '0 16px 14px' }}>
            <button
              onClick={() => setShowProductList(true)}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '9px 16px', borderRadius: 10,
                background: '#f4f6fb', color: '#555',
                border: '1.5px solid #e0e4f0', fontSize: 13, fontWeight: 700,
                cursor: 'pointer', whiteSpace: 'nowrap', fontFamily: 'inherit',
              }}
            >
              <AlignJustify size={14} />
              בחר מהרשימה
            </button>
            <form onSubmit={handleBarcode} style={{ flex: 1, position: 'relative' }}>
              <input
                type="text"
                placeholder="סרוק ברקוד – נוסף אוטומטית"
                value={barcodeInput}
                onChange={e => setBarcodeInput(e.target.value)}
                autoFocus
                style={{
                  width: '100%', boxSizing: 'border-box',
                  padding: '9px 16px 9px 40px',
                  borderRadius: 10, border: '1.5px solid #e0e4f0',
                  background: '#fafbff', fontSize: 13, fontFamily: 'inherit',
                  color: '#333', textAlign: 'right', outline: 'none',
                }}
              />
              <button
                type="submit"
                style={{
                  position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', cursor: 'pointer', color: '#aaa',
                  display: 'flex', alignItems: 'center',
                }}
              >
                <ScanLine size={17} />
              </button>
            </form>
          </div>
        </div>

        {/* ── Cart card ── */}
        <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #eaecf5', boxShadow: '0 1px 8px rgba(26,35,126,0.06)', flex: 1 }}>
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 18px', borderBottom: '1px solid #f4f6fb' }}>
            <span style={{ fontSize: 11, color: '#9fa8da', fontWeight: 600 }}>
              {buyerType === 'yeshiva' ? '💙 מחיר בני ישיבה' : '🌐 מחיר חיצוני'}
            </span>
            <span style={{ fontSize: 14, fontWeight: 900, color: '#1a1a2e' }}>
              פריטים בקניה ({cart.length})
            </span>
          </div>

          {/* Items */}
          {cart.length === 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 0', gap: 12 }}>
              {/* Scan corners */}
              <div style={{ position: 'relative', width: 56, height: 56 }}>
                <div style={{ position: 'absolute', top: 0, right: 0, width: 16, height: 16, borderTop: '2.5px solid #d5d9ef', borderRight: '2.5px solid #d5d9ef', borderRadius: '0 4px 0 0' }} />
                <div style={{ position: 'absolute', top: 0, left: 0, width: 16, height: 16, borderTop: '2.5px solid #d5d9ef', borderLeft: '2.5px solid #d5d9ef', borderRadius: '4px 0 0 0' }} />
                <div style={{ position: 'absolute', bottom: 0, right: 0, width: 16, height: 16, borderBottom: '2.5px solid #d5d9ef', borderRight: '2.5px solid #d5d9ef', borderRadius: '0 0 4px 0' }} />
                <div style={{ position: 'absolute', bottom: 0, left: 0, width: 16, height: 16, borderBottom: '2.5px solid #d5d9ef', borderLeft: '2.5px solid #d5d9ef', borderRadius: '0 0 0 4px' }} />
                <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#d5d9ef' }}>
                  <ScanLine size={18} />
                </div>
              </div>
              <p style={{ fontSize: 13, color: '#9fa8da', fontWeight: 700 }}>סרוק מוצר כדי להתחיל</p>
            </div>
          ) : (
            <div style={{ padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: 8 }}>
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

      {/* ══════════════════════════════
          LEFT: two stacked cards
      ══════════════════════════════ */}
      <div style={{ width: 256, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 12, padding: 12 }}>

        {/* ── Card 1: Total ── */}
        <div style={{
          background: NAVY, borderRadius: 20, padding: '20px 16px',
          display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center',
          boxShadow: '0 4px 20px rgba(30,49,102,0.3)',
        }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: 'rgba(197,202,233,0.7)', letterSpacing: 1, marginBottom: 8 }}>
            סה״כ לתשלום
          </p>
          <p style={{ fontSize: 42, fontWeight: 900, color: '#fff', lineHeight: 1.1, marginBottom: 4 }}>
            {cart.length === 0 ? <span style={{ opacity: 0.15, letterSpacing: 8 }}>—</span> : `₪${total.toFixed(2)}`}
          </p>
          <p style={{ fontSize: 12, color: 'rgba(197,202,233,0.55)', marginBottom: 16 }}>
            {cart.length === 0 ? 'העגלה ריקה' : `${totalQty} פריטים`}
          </p>
          <button
            onClick={() => cart.length > 0 && setShowPayment(true)}
            disabled={cart.length === 0}
            style={{
              width: '100%', padding: '13px 0',
              borderRadius: 12, border: 'none',
              background: cart.length === 0 ? 'rgba(255,255,255,0.1)' : GOLD,
              color: cart.length === 0 ? 'rgba(255,255,255,0.25)' : '#fff',
              fontSize: 16, fontWeight: 900,
              cursor: cart.length === 0 ? 'default' : 'pointer',
              fontFamily: 'inherit',
              boxShadow: cart.length > 0 ? '0 4px 16px rgba(212,160,23,0.4)' : 'none',
              transition: 'all .15s',
            }}
          >
            לתשלום
          </button>
        </div>

        {/* ── Card 2: Transaction history ── */}
        <div style={{
          background: '#fff', borderRadius: 20, flex: 1,
          border: '1px solid #eaecf5', boxShadow: '0 1px 8px rgba(26,35,126,0.06)',
          display: 'flex', flexDirection: 'column', overflow: 'hidden',
        }}>
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderBottom: '1px solid #f4f6fb' }}>
            <Clock size={14} color="#c5cae9" />
            <span style={{ fontSize: 13, fontWeight: 800, color: '#1a1a2e' }}>היסטוריית עסקאות</span>
          </div>

          {/* History list */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '8px 10px', display: 'flex', flexDirection: 'column', gap: 6 }}>
            {recentTx.length === 0 ? (
              <p style={{ textAlign: 'center', color: '#c5cae9', fontSize: 12, padding: '24px 0' }}>אין עסקאות עדיין</p>
            ) : recentTx.map(tx => {
              const isCash = tx.paymentMethod === 'cash';
              const isSpecial = false; // future: special approvals
              return (
                <div
                  key={tx.id}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    padding: '9px 10px', borderRadius: 12,
                    border: '1px solid #f0f2fa', cursor: 'pointer',
                    transition: 'background .15s',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = '#fafbff')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                >
                  {/* ▼ expand — far RIGHT in RTL */}
                  <ChevronDown size={13} color="#d5d9ef" style={{ flexShrink: 0 }} />

                  {/* Date — right side */}
                  <span style={{ fontSize: 10, color: '#9fa8da', flexShrink: 0 }}>{tx.date}</span>

                  {/* Badge — center, push to left */}
                  <span style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
                    <span style={{
                      fontSize: 10, fontWeight: 700,
                      padding: '2px 8px', borderRadius: 20,
                      background: isCash ? '#f4f6fb' : '#e3f2fd',
                      color: isCash ? '#666' : '#1565c0',
                      whiteSpace: 'nowrap',
                    }}>
                      {isCash ? '💳 מזומן' : '💳 אשראי'}
                    </span>
                  </span>

                  {/* Amount — far LEFT in RTL */}
                  <span style={{ fontSize: 14, fontWeight: 900, color: NAVY, flexShrink: 0 }}>
                    ₪{tx.totalAmount.toFixed(2)}
                  </span>
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

/* ─────────────────────────────────────────
   Cart Row — exact Lovable layout
   RTL visual order: name | qty | price | 🗑
───────────────────────────────────────── */
function CartRow({ item, onQtyChange, onRemove }: {
  item: CartItem;
  onQtyChange: (q: number) => void;
  onRemove: () => void;
}) {
  return (
    <div
      style={{
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '10px 12px', borderRadius: 12,
        border: '1px solid #eaecf5', background: '#fafbff',
        transition: 'border-color .15s',
      }}
      onMouseEnter={e => (e.currentTarget.style.borderColor = '#c5cae9')}
      onMouseLeave={e => (e.currentTarget.style.borderColor = '#eaecf5')}
    >
      {/* Item name + details — RIGHT side (first in RTL) */}
      <div style={{ flex: 1, textAlign: 'right', minWidth: 0 }}>
        <p style={{ fontSize: 13, fontWeight: 800, color: '#1a1a2e', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {item.productName}
        </p>
        {item.variantDescription && (
          <p style={{ fontSize: 11, color: '#9fa8da', margin: '2px 0 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {item.variantDescription}
          </p>
        )}
        <p style={{ fontSize: 11, color: NAVY, fontWeight: 700, margin: '2px 0 0' }}>
          מחיר ליחידה ₪{item.unitPrice.toFixed(2)}
        </p>
      </div>

      {/* Qty controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
        <button
          onClick={() => onQtyChange(item.quantity + 1)}
          style={{
            width: 28, height: 28, borderRadius: 8, border: 'none',
            background: NAVY, color: '#fff', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          <Plus size={13} />
        </button>
        <span style={{ width: 24, textAlign: 'center', fontSize: 14, fontWeight: 900, color: '#1a1a2e' }}>
          {item.quantity}
        </span>
        <button
          onClick={() => onQtyChange(Math.max(0, item.quantity - 1))}
          style={{
            width: 28, height: 28, borderRadius: 8, border: 'none',
            background: '#eef0f8', color: '#7986cb', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          <Minus size={13} />
        </button>
      </div>

      {/* Total price */}
      <div style={{ flexShrink: 0, minWidth: 60, textAlign: 'left' }}>
        <p style={{ fontSize: 14, fontWeight: 900, color: NAVY, margin: 0 }}>
          ₪{item.totalPrice.toFixed(2)}
        </p>
      </div>

      {/* Trash — far LEFT in RTL (last in DOM) */}
      <button
        onClick={onRemove}
        style={{
          background: 'none', border: 'none', cursor: 'pointer',
          color: '#e0e4f0', flexShrink: 0, padding: 2,
          display: 'flex', alignItems: 'center',
          transition: 'color .15s',
        }}
        onMouseEnter={e => ((e.currentTarget as HTMLElement).style.color = '#ef5350')}
        onMouseLeave={e => ((e.currentTarget as HTMLElement).style.color = '#e0e4f0')}
      >
        <Trash2 size={14} />
      </button>
    </div>
  );
}
