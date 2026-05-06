import { CheckCircle, Printer } from 'lucide-react';
import type { Transaction } from '../../types';

interface Props {
  transaction: Transaction;
  onClose: () => void;
}

export default function TransactionSummary({ transaction, onClose }: Props) {
  const date = new Date(transaction.date).toLocaleString('he-IL');

  return (
    <div className="max-w-md mx-auto">
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="bg-green-600 text-white p-6 text-center">
          <CheckCircle size={50} className="mx-auto mb-3" />
          <h2 className="text-2xl font-bold">העסקה הושלמה!</h2>
          <p className="text-green-100 mt-1">{date}</p>
        </div>
        <div className="p-6 space-y-4">
          <div className="flex justify-between text-sm text-gray-500">
            <span>{transaction.paymentMethod === 'cash' ? 'מזומן' : 'אשראי'}</span>
            <span>אמצעי תשלום</span>
          </div>
          <div className="flex justify-between text-sm text-gray-500">
            <span>{transaction.buyerType === 'yeshiva' ? 'בן ישיבה' : 'חיצוני'}</span>
            <span>סוג קונה</span>
          </div>
          <div className="border-t pt-3 space-y-1">
            {transaction.items.map(item => (
              <div key={item.variantId} className="flex justify-between text-sm">
                <span className="text-blue-700 font-semibold">₪{item.totalPrice.toFixed(2)}</span>
                <span className="text-gray-700">{item.productName} × {item.quantity}</span>
              </div>
            ))}
          </div>
          <div className="border-t pt-3 flex justify-between font-bold text-lg">
            <span className="text-green-700">₪{transaction.totalAmount.toFixed(2)}</span>
            <span className="text-gray-800">סה"כ שולם</span>
          </div>
          {transaction.nedarimReference && (
            <p className="text-xs text-gray-400 text-left">אסמכתא: {transaction.nedarimReference}</p>
          )}
          <button
            onClick={onClose}
            className="w-full bg-blue-700 text-white py-3 rounded-xl font-bold hover:bg-blue-800 transition mt-4"
          >
            סגור ועסקה חדשה
          </button>
        </div>
      </div>
    </div>
  );
}
