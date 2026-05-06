import { useState } from 'react';
import { useStore } from '../../../store/useStore';
import { ChevronDown, ChevronUp } from 'lucide-react';

export default function TransactionsList() {
  const transactions = useStore(s => s.transactions);
  const [expanded, setExpanded] = useState<string | null>(null);

  const sorted = [...transactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  if (sorted.length === 0) {
    return <p className="text-center text-gray-400 py-8">אין עסקאות עדיין</p>;
  }

  return (
    <div className="space-y-2">
      {sorted.map(tx => (
        <div key={tx.id} className="border border-gray-200 rounded-lg overflow-hidden">
          <button
            onClick={() => setExpanded(expanded === tx.id ? null : tx.id)}
            className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 transition"
          >
            <div className="flex items-center gap-3">
              {expanded === tx.id ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
              <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                tx.paymentMethod === 'cash' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
              }`}>
                {tx.paymentMethod === 'cash' ? 'מזומן' : 'אשראי'}
              </span>
              {tx.transferredToSafe && (
                <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">הועבר לכספת</span>
              )}
            </div>
            <div className="text-right">
              <p className="font-bold text-gray-800">₪{tx.totalAmount.toFixed(2)}</p>
              <p className="text-xs text-gray-400">
                {new Date(tx.date).toLocaleDateString('he-IL')} | {tx.buyerType === 'yeshiva' ? 'בן ישיבה' : 'חיצוני'}
              </p>
            </div>
          </button>
          {expanded === tx.id && (
            <div className="px-4 py-3 bg-white border-t space-y-1">
              {tx.items.map(item => (
                <div key={item.variantId} className="flex justify-between text-sm">
                  <span className="text-blue-700 font-semibold">₪{item.totalPrice.toFixed(2)}</span>
                  <span className="text-gray-700">{item.productName} {item.variantDescription && `(${item.variantDescription})`} × {item.quantity}</span>
                </div>
              ))}
              <p className="text-xs text-gray-400 pt-1">קופאי: {tx.cashierName}</p>
              {tx.nedarimReference && <p className="text-xs text-gray-400">אסמכתא: {tx.nedarimReference}</p>}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
