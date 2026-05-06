import { useState } from 'react';
import { useStore } from '../../../store/useStore';
import { Plus } from 'lucide-react';

export default function ExpensesTab() {
  const { addSafeEntry, safeEntries, suppliers, paySupplier } = useStore();
  const [showForm, setShowForm] = useState(false);
  const [showSupplierPay, setShowSupplierPay] = useState(false);
  const [form, setForm] = useState({ amount: '', description: '' });
  const [payForm, setPayForm] = useState({ supplierId: '', amount: '', description: '' });

  const handleExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.amount || !form.description) return;
    addSafeEntry({
      date: new Date().toISOString().split('T')[0],
      type: 'expense',
      source: 'special',
      amount: Number(form.amount),
      description: form.description,
    });
    setForm({ amount: '', description: '' });
    setShowForm(false);
  };

  const handlePaySupplier = (e: React.FormEvent) => {
    e.preventDefault();
    if (!payForm.supplierId || !payForm.amount) return;
    paySupplier(payForm.supplierId, Number(payForm.amount), payForm.description);
    setPayForm({ supplierId: '', amount: '', description: '' });
    setShowSupplierPay(false);
  };

  const expenses = safeEntries.filter(e => e.type === 'expense').sort((a, b) => b.date.localeCompare(a.date));

  return (
    <div className="space-y-4">
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => { setShowForm(!showForm); setShowSupplierPay(false); }}
          className="flex items-center gap-1 text-sm bg-red-600 text-white px-3 py-2 rounded-lg hover:bg-red-700 transition"
        >
          <Plus size={15} /> הוצאה מהכספת
        </button>
        <button
          onClick={() => { setShowSupplierPay(!showSupplierPay); setShowForm(false); }}
          className="flex items-center gap-1 text-sm bg-orange-500 text-white px-3 py-2 rounded-lg hover:bg-orange-600 transition"
        >
          <Plus size={15} /> תשלום לספק
        </button>
        <span className="text-sm font-semibold text-gray-700 mr-auto self-center">הוצאות מהכספת</span>
      </div>

      {showForm && (
        <form onSubmit={handleExpense} className="bg-red-50 rounded-xl p-4 space-y-3 border border-red-100">
          <h4 className="text-sm font-semibold text-gray-700 text-right">הוצאה מהכספת</h4>
          <input type="number" step="0.01" placeholder="סכום ₪" value={form.amount}
            onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} required
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-right focus:outline-none focus:ring-2 focus:ring-red-300" />
          <input placeholder="תיאור" value={form.description}
            onChange={e => setForm(f => ({ ...f, description: e.target.value }))} required
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-right focus:outline-none focus:ring-2 focus:ring-red-300" />
          <div className="flex gap-2">
            <button type="button" onClick={() => setShowForm(false)} className="flex-1 py-2 border border-gray-300 rounded-lg text-sm">ביטול</button>
            <button type="submit" className="flex-1 py-2 bg-red-600 text-white rounded-lg text-sm font-semibold">שמור</button>
          </div>
        </form>
      )}

      {showSupplierPay && (
        <form onSubmit={handlePaySupplier} className="bg-orange-50 rounded-xl p-4 space-y-3 border border-orange-100">
          <h4 className="text-sm font-semibold text-gray-700 text-right">תשלום לספק</h4>
          <select value={payForm.supplierId} onChange={e => setPayForm(f => ({ ...f, supplierId: e.target.value }))} required
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-right bg-white focus:outline-none focus:ring-2 focus:ring-orange-300">
            <option value="">בחר ספק</option>
            {suppliers.map(s => <option key={s.id} value={s.id}>{s.name} ({s.type === 'purchase' ? 'קניה' : 'קומיסיון'})</option>)}
          </select>
          <input type="number" step="0.01" placeholder="סכום ₪" value={payForm.amount}
            onChange={e => setPayForm(f => ({ ...f, amount: e.target.value }))} required
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-right focus:outline-none focus:ring-2 focus:ring-orange-300" />
          <input placeholder="תיאור" value={payForm.description}
            onChange={e => setPayForm(f => ({ ...f, description: e.target.value }))}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-right focus:outline-none focus:ring-2 focus:ring-orange-300" />
          <div className="flex gap-2">
            <button type="button" onClick={() => setShowSupplierPay(false)} className="flex-1 py-2 border border-gray-300 rounded-lg text-sm">ביטול</button>
            <button type="submit" className="flex-1 py-2 bg-orange-500 text-white rounded-lg text-sm font-semibold">שלם</button>
          </div>
        </form>
      )}

      <div className="space-y-2">
        {expenses.length === 0 ? (
          <p className="text-center text-gray-400 py-4">אין הוצאות עדיין</p>
        ) : expenses.map(e => (
          <div key={e.id} className="flex justify-between items-center bg-red-50 rounded-lg px-4 py-2.5">
            <span className="font-bold text-red-600">-₪{e.amount.toFixed(2)}</span>
            <div className="text-right">
              <p className="text-sm text-gray-700">{e.description}</p>
              <p className="text-xs text-gray-400">{e.date}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
