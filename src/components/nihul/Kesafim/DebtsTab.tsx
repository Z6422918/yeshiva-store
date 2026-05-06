import { useState } from 'react';
import { useStore } from '../../../store/useStore';

export default function DebtsTab() {
  const { suppliers, getTotalCommissionDebt, getTotalPurchaseDebt, getSupplierDebt, paySupplier } = useStore();
  const [payingId, setPayingId] = useState<string | null>(null);
  const [payForm, setPayForm] = useState({ amount: '', description: '' });

  const commissionDebt = getTotalCommissionDebt();
  const purchaseDebt = getTotalPurchaseDebt();

  const purchaseSuppliers = suppliers.filter(s => s.type === 'purchase');
  const commissionSuppliers = suppliers.filter(s => s.type === 'commission');

  const handlePay = (e: React.FormEvent, supplierId: string) => {
    e.preventDefault();
    if (!payForm.amount) return;
    paySupplier(supplierId, Number(payForm.amount), payForm.description || 'תשלום לספק');
    setPayingId(null);
    setPayForm({ amount: '', description: '' });
  };

  const SupplierRow = ({ s }: { s: typeof suppliers[0] }) => {
    const debt = getSupplierDebt(s.id);
    return (
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 bg-gray-50">
          <div className="flex items-center gap-2">
            {debt > 0 && (
              <button
                onClick={() => { setPayingId(payingId === s.id ? null : s.id); setPayForm({ amount: '', description: '' }); }}
                className="text-xs bg-blue-700 text-white px-2 py-1 rounded hover:bg-blue-800"
              >
                תשלום
              </button>
            )}
            <span className={`font-bold text-lg ${debt > 0 ? 'text-red-600' : 'text-green-600'}`}>
              ₪{debt.toFixed(2)}
            </span>
          </div>
          <div className="text-right">
            <p className="font-semibold text-gray-800">{s.name}</p>
            <p className="text-xs text-gray-400">{s.type === 'purchase' ? 'סוכן קניה' : 'סוכן קומיסיון'} | {s.phone}</p>
          </div>
        </div>
        {payingId === s.id && (
          <form onSubmit={e => handlePay(e, s.id)} className="px-4 py-3 bg-blue-50 space-y-2 border-t">
            <input type="number" step="0.01" placeholder="סכום ₪" value={payForm.amount}
              onChange={e => setPayForm(f => ({ ...f, amount: e.target.value }))} required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-right focus:outline-none focus:ring-2 focus:ring-blue-400" />
            <input placeholder="תיאור" value={payForm.description}
              onChange={e => setPayForm(f => ({ ...f, description: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-right focus:outline-none focus:ring-2 focus:ring-blue-400" />
            <div className="flex gap-2">
              <button type="button" onClick={() => setPayingId(null)} className="flex-1 py-2 border border-gray-300 rounded-lg text-xs">ביטול</button>
              <button type="submit" className="flex-1 py-2 bg-blue-700 text-white rounded-lg text-xs font-semibold">אשר תשלום</button>
            </div>
          </form>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-5">
      {/* Summary */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-orange-50 rounded-xl p-3 text-center border border-orange-100">
          <p className="text-lg font-bold text-orange-600">₪{commissionDebt.toFixed(2)}</p>
          <p className="text-xs text-gray-500">חוב קומיסיון</p>
        </div>
        <div className="bg-red-50 rounded-xl p-3 text-center border border-red-100">
          <p className="text-lg font-bold text-red-600">₪{purchaseDebt.toFixed(2)}</p>
          <p className="text-xs text-gray-500">חוב קניה</p>
        </div>
        <div className="bg-gray-100 rounded-xl p-3 text-center">
          <p className="text-lg font-bold text-gray-700">₪{(commissionDebt + purchaseDebt).toFixed(2)}</p>
          <p className="text-xs text-gray-500">סה"כ חובות</p>
        </div>
      </div>

      {/* Purchase suppliers */}
      {purchaseSuppliers.length > 0 && (
        <div>
          <h4 className="text-sm font-bold text-gray-600 mb-2 text-right">ספקי קניה</h4>
          <div className="space-y-2">
            {purchaseSuppliers.map(s => <SupplierRow key={s.id} s={s} />)}
          </div>
        </div>
      )}

      {/* Commission suppliers */}
      {commissionSuppliers.length > 0 && (
        <div>
          <h4 className="text-sm font-bold text-gray-600 mb-2 text-right">ספקי קומיסיון</h4>
          <div className="space-y-2">
            {commissionSuppliers.map(s => <SupplierRow key={s.id} s={s} />)}
          </div>
        </div>
      )}

      {suppliers.length === 0 && (
        <p className="text-center text-gray-400 py-8">אין ספקים מוגדרים</p>
      )}
    </div>
  );
}
