import { useState } from 'react';
import { useStore } from '../../store/useStore';
import { X, Banknote, CreditCard, CheckCircle, ExternalLink } from 'lucide-react';

interface Props {
  total: number;
  onComplete: (method: 'cash' | 'credit', nedarimRef?: string) => void;
  onClose: () => void;
}

export default function PaymentModal({ total, onComplete, onClose }: Props) {
  const settings = useStore(s => s.settings);
  const cart = useStore(s => s.cart);
  const buyerType = useStore(s => s.buyerType);
  const [step, setStep] = useState<'choose' | 'cash_confirm' | 'credit_open'>('choose');

  const nedarimUrl = settings.nedarimInstitutionCode
    ? `https://www.nedarim.co.il/organizations/donate/?mosad=${settings.nedarimInstitutionCode}&amount=${total.toFixed(2)}`
    : null;

  const handleCashConfirm = () => {
    onComplete('cash');
  };

  const handleCreditPaid = () => {
    onComplete('credit', `nedarim-${Date.now()}`);
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between p-5 border-b">
          <h2 className="text-lg font-bold text-gray-800">תשלום</h2>
          {step === 'choose' && (
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X size={22} />
            </button>
          )}
        </div>

        {step === 'choose' && (
          <div className="p-6 space-y-4">
            <div className="bg-blue-50 rounded-xl p-4 text-center">
              <p className="text-gray-600 text-sm mb-1">סה"כ לתשלום</p>
              <p className="text-3xl font-bold text-blue-800">₪{total.toFixed(2)}</p>
              <p className="text-xs text-gray-400 mt-1">מחיר {buyerType === 'yeshiva' ? 'בן ישיבה' : 'חיצוני'} | {cart.length} פריטים</p>
            </div>
            <p className="text-center font-semibold text-gray-700">בחר אמצעי תשלום</p>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setStep('cash_confirm')}
                className="flex flex-col items-center gap-3 p-5 border-2 border-green-200 rounded-xl hover:bg-green-50 transition"
              >
                <Banknote size={36} className="text-green-600" />
                <span className="font-bold text-green-700">מזומן</span>
              </button>
              <button
                onClick={() => setStep('credit_open')}
                className="flex flex-col items-center gap-3 p-5 border-2 border-blue-200 rounded-xl hover:bg-blue-50 transition"
              >
                <CreditCard size={36} className="text-blue-600" />
                <span className="font-bold text-blue-700">אשראי</span>
              </button>
            </div>
          </div>
        )}

        {step === 'cash_confirm' && (
          <div className="p-6 space-y-5">
            <div className="bg-green-50 rounded-xl p-5 text-center">
              <Banknote size={40} className="text-green-600 mx-auto mb-3" />
              <p className="text-gray-700 text-lg font-semibold">האם התקבל תשלום במזומן?</p>
              <p className="text-3xl font-bold text-green-700 mt-2">₪{total.toFixed(2)}</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setStep('choose')}
                className="flex-1 py-3 border-2 border-gray-300 rounded-xl text-gray-600 font-semibold hover:bg-gray-50 transition"
              >
                חזרה
              </button>
              <button
                onClick={handleCashConfirm}
                className="flex-1 py-3 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 transition flex items-center justify-center gap-2"
              >
                <CheckCircle size={18} />
                אושר, סיים עסקה
              </button>
            </div>
          </div>
        )}

        {step === 'credit_open' && (
          <div className="p-6 space-y-4">
            <div className="bg-blue-50 rounded-xl p-4 text-center">
              <p className="text-gray-600 text-sm mb-1">סכום לסליקה</p>
              <p className="text-3xl font-bold text-blue-800">₪{total.toFixed(2)}</p>
            </div>
            {nedarimUrl ? (
              <a
                href={nedarimUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 bg-blue-700 text-white py-3 rounded-xl font-bold hover:bg-blue-800 transition"
              >
                <ExternalLink size={18} />
                פתח נדרים פלוס לסליקה
              </a>
            ) : (
              <div className="bg-yellow-50 border border-yellow-300 rounded-xl p-3 text-sm text-yellow-800 text-center">
                קוד מוסד נדרים פלוס לא הוגדר בהגדרות
              </div>
            )}
            <p className="text-center text-sm text-gray-500">לאחר השלמת התשלום בנדרים פלוס, לחץ על אישור למטה</p>
            <div className="flex gap-3">
              <button
                onClick={() => setStep('choose')}
                className="flex-1 py-3 border-2 border-gray-300 rounded-xl text-gray-600 font-semibold hover:bg-gray-50 transition"
              >
                חזרה
              </button>
              <button
                onClick={handleCreditPaid}
                className="flex-1 py-3 bg-blue-700 text-white rounded-xl font-bold hover:bg-blue-800 transition flex items-center justify-center gap-2"
              >
                <CheckCircle size={18} />
                אישור - תשלום בוצע
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
