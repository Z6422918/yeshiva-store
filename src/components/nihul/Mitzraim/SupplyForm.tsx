import { useState } from 'react';
import { useStore } from '../../../store/useStore';
import { X } from 'lucide-react';

interface Props { productId: string; variantId: string; onClose: () => void }

export default function SupplyForm({ productId, variantId, onClose }: Props) {
  const addSupply = useStore(s => s.addSupply);
  const [form, setForm] = useState({ date: new Date().toISOString().split('T')[0], quantity: 1, costPerUnit: 0 });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addSupply(productId, variantId, form);
    onClose();
  };

  return (
    <div className="bg-green-50 rounded-lg p-3 border border-green-100">
      <div className="flex items-center justify-between mb-2">
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={16} /></button>
        <p className="text-sm font-semibold text-gray-700">הוספת הספקה</p>
      </div>
      <form onSubmit={handleSubmit} className="grid grid-cols-3 gap-2">
        <div>
          <label className="block text-xs text-gray-500 mb-1 text-right">תאריך</label>
          <input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
            className="w-full border border-gray-300 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-400" />
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1 text-right">כמות</label>
          <input type="number" min="1" value={form.quantity} onChange={e => setForm(f => ({ ...f, quantity: Number(e.target.value) }))}
            className="w-full border border-gray-300 rounded-lg px-2 py-1.5 text-sm text-right focus:outline-none focus:ring-2 focus:ring-green-400" />
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1 text-right">עלות/יח' ₪</label>
          <input type="number" step="0.01" min="0" value={form.costPerUnit} onChange={e => setForm(f => ({ ...f, costPerUnit: Number(e.target.value) }))}
            className="w-full border border-gray-300 rounded-lg px-2 py-1.5 text-sm text-right focus:outline-none focus:ring-2 focus:ring-green-400" />
        </div>
        <div className="col-span-3 flex gap-2 mt-1">
          <button type="button" onClick={onClose} className="flex-1 py-1.5 border border-gray-300 rounded-lg text-xs text-gray-600 hover:bg-gray-50">ביטול</button>
          <button type="submit" className="flex-1 py-1.5 bg-green-600 text-white rounded-lg text-xs font-semibold hover:bg-green-700">הוסף הספקה</button>
        </div>
      </form>
    </div>
  );
}
