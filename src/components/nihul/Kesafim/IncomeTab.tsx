import { useState } from 'react';
import { useStore } from '../../../store/useStore';
import { Plus } from 'lucide-react';

export default function IncomeTab() {
  const { addSafeEntry, safeEntries, transactions, transferToSafe, getCashNotTransferred, getCreditNotTransferred } = useStore();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ source: 'special' as 'cash' | 'credit' | 'special', amount: '', description: '' });

  const cashPending = getCashNotTransferred();
  const creditPending = getCreditNotTransferred();

  const handleTransfer = (source: 'cash' | 'credit') => {
    const amount = source === 'cash' ? cashPending : creditPending;
    if (amount <= 0) return;
    const ids = transactions.filter(t => t.paymentMethod === source && !t.transferredToSafe).map(t => t.id);
    transferToSafe(source, ids, amount);
  };

  const handleSpecial = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.amount || !form.description) return;
    addSafeEntry({
      date: new Date().toISOString().split('T')[0],
      type: 'income',
      source: form.source,
      amount: Number(form.amount),
      description: form.description,
    });
    setForm({ source: 'special', amount: '', description: '' });
    setShowForm(false);
  };

  const incomes = safeEntries.filter(e => e.type === 'income').sort((a, b) => b.date.localeCompare(a.date));

  return (
    <div className="space-y-4">
      {/* Quick transfer buttons */}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => handleTransfer('cash')}
          disabled={cashPending <= 0}
          className="flex flex-col items-center py-3 bg-green-50 border border-green-200 rounded-xl hover:bg-green-100 disabled:opacity-40 disabled:cursor-not-allowed transition"
        >
          <span className="text-xs text-gray-500 mb-1">העבר מזומן לכספת</span>
          <span className="font-bold text-green-700 text-lg">₪{cashPending.toFixed(2)}</span>
        </button>
        <button
          onClick={() => handleTransfer('credit')}
          disabled={creditPending <= 0}
          className="flex flex-col items-center py-3 bg-blue-50 border border-blue-200 rounded-xl hover:bg-blue-100 disabled:opacity-40 disabled:cursor-not-allowed transition"
        >
          <span className="text-xs text-gray-500 mb-1">העבר אשראי לכספת</span>
          <span className="font-bold text-blue-700 text-lg">₪{creditPending.toFixed(2)}</span>
        </button>
      </div>

      {/* Special income */}
      <div className="flex justify-between items-center">
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-1 text-sm bg-blue-700 text-white px-3 py-2 rounded-lg hover:bg-blue-800 transition"
        >
          <Plus size={15} /> הכנסה מיוחדת
        </button>
        <span className="text-sm font-semibold text-gray-700">היסטוריית הכנסות לכספת</span>
      </div>

      {showForm && (
        <form onSubmit={handleSpecial} className="bg-blue-50 rounded-xl p-4 space-y-3 border border-blue-100">
          <select
            value={form.source}
            onChange={e => setForm(f => ({ ...f, source: e.target.value as 'cash'|'credit'|'special' }))}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-right bg-white focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            <option value="cash">מזומן</option>
            <option value="credit">אשראי</option>
            <option value="special">הכנסה מיוחדת</option>
          </select>
          <input
            type="number" step="0.01" placeholder="סכום ₪" value={form.amount}
            onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} required
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-right focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <input
            placeholder="תיאור" value={form.description}
            onChange={e => setForm(f => ({ ...f, description: e.target.value }))} required
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-right focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <div className="flex gap-2">
            <button type="button" onClick={() => setShowForm(false)} className="flex-1 py-2 border border-gray-300 rounded-lg text-sm">ביטול</button>
            <button type="submit" className="flex-1 py-2 bg-blue-700 text-white rounded-lg text-sm font-semibold">הוסף</button>
          </div>
        </form>
      )}

      <div className="space-y-2">
        {incomes.length === 0 ? (
          <p className="text-center text-gray-400 py-4">אין הכנסות עדיין</p>
        ) : incomes.map(e => (
          <div key={e.id} className="flex justify-between items-center bg-green-50 rounded-lg px-4 py-2.5">
            <span className="font-bold text-green-700">+₪{e.amount.toFixed(2)}</span>
            <div className="text-right">
              <p className="text-sm text-gray-700">{e.description}</p>
              <p className="text-xs text-gray-400">{e.date} | {
                e.source === 'cash' ? 'מזומן' : e.source === 'credit' ? 'אשראי' : 'מיוחד'
              }</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
