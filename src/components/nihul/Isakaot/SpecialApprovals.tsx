import { useState } from 'react';
import { useStore } from '../../../store/useStore';
import { Plus, CheckCircle, XCircle, Clock } from 'lucide-react';

export default function SpecialApprovals() {
  const { specialApprovals, addSpecialApproval, updateApprovalStatus, currentUser } = useStore();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ description: '', amount: '', requestedBy: '' });

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.description || !form.amount) return;
    addSpecialApproval({
      description: form.description,
      amount: Number(form.amount),
      requestedBy: form.requestedBy || currentUser?.name || '',
      approvedBy: '',
      status: 'pending',
    });
    setForm({ description: '', amount: '', requestedBy: '' });
    setShowForm(false);
  };

  const statusIcon = (status: string) => {
    if (status === 'approved') return <CheckCircle size={16} className="text-green-600" />;
    if (status === 'rejected') return <XCircle size={16} className="text-red-500" />;
    return <Clock size={16} className="text-yellow-500" />;
  };

  const statusLabel = (status: string) => {
    if (status === 'approved') return 'אושר';
    if (status === 'rejected') return 'נדחה';
    return 'ממתין';
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-1 bg-blue-700 text-white px-3 py-2 rounded-lg text-sm hover:bg-blue-800 transition"
        >
          <Plus size={15} />
          אישור חדש
        </button>
        <h3 className="font-semibold text-gray-700">אישורים מיוחדים</h3>
      </div>

      {showForm && (
        <form onSubmit={handleAdd} className="bg-blue-50 rounded-xl p-4 space-y-3 border border-blue-100">
          <input
            placeholder="תיאור"
            value={form.description}
            onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-right text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            required
          />
          <input
            type="number"
            placeholder="סכום ₪"
            value={form.amount}
            onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-right text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            required
          />
          <input
            placeholder="מבוקש ע׳י"
            value={form.requestedBy}
            onChange={e => setForm(f => ({ ...f, requestedBy: e.target.value }))}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-right text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <div className="flex gap-2">
            <button type="button" onClick={() => setShowForm(false)} className="flex-1 py-2 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-100">ביטול</button>
            <button type="submit" className="flex-1 py-2 bg-blue-700 text-white rounded-lg text-sm font-semibold hover:bg-blue-800">שמור</button>
          </div>
        </form>
      )}

      {specialApprovals.length === 0 ? (
        <p className="text-center text-gray-400 py-6">אין אישורים מיוחדים</p>
      ) : (
        <div className="space-y-2">
          {[...specialApprovals].reverse().map(a => (
            <div key={a.id} className="bg-gray-50 rounded-lg p-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                {a.status === 'pending' && currentUser?.role === 'admin' && (
                  <div className="flex gap-1">
                    <button
                      onClick={() => updateApprovalStatus(a.id, 'approved', currentUser.name)}
                      className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded hover:bg-green-200"
                    >אשר</button>
                    <button
                      onClick={() => updateApprovalStatus(a.id, 'rejected', currentUser.name)}
                      className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded hover:bg-red-200"
                    >דחה</button>
                  </div>
                )}
                <div className="flex items-center gap-1">
                  {statusIcon(a.status)}
                  <span className="text-xs text-gray-500">{statusLabel(a.status)}</span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-gray-800">{a.description}</p>
                <p className="text-xs text-gray-500">{a.date} | {a.requestedBy} | ₪{a.amount}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
