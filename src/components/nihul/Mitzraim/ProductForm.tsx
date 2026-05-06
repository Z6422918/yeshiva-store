import { useState } from 'react';
import { useStore } from '../../../store/useStore';
import { X } from 'lucide-react';

interface Props {
  onClose: () => void;
  productId?: string;
}

export default function ProductForm({ onClose, productId }: Props) {
  const { addProduct, updateProduct, products, suppliers } = useStore();
  const existing = productId ? products.find(p => p.id === productId) : null;

  const [form, setForm] = useState({
    name: existing?.name ?? '',
    supplierId: existing?.supplierId ?? '',
    category: existing?.category ?? '',
    barcode: existing?.barcode ?? '',
    company: existing?.company ?? '',
    isActive: existing?.isActive ?? true,
  });

  const set = (k: string, v: string | boolean) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (existing) {
      updateProduct(existing.id, form);
    } else {
      addProduct({ ...form, variants: [] });
    }
    onClose();
  };

  const fields = [
    { key: 'name', label: 'שם מוצר', type: 'text', required: true },
    { key: 'barcode', label: 'ברקוד', type: 'text' },
    { key: 'category', label: 'קטגוריה', type: 'text' },
    { key: 'company', label: 'חברה', type: 'text' },
  ];

  return (
    <div className="bg-white rounded-xl shadow p-5 border border-blue-100">
      <div className="flex items-center justify-between mb-4">
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
        <h3 className="font-bold text-gray-800">{existing ? 'עריכת מוצר' : 'מוצר חדש'}</h3>
      </div>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          {fields.map(f => (
            <div key={f.key}>
              <label className="block text-xs text-gray-500 mb-1 text-right">{f.label}</label>
              <input
                type={f.type}
                value={form[f.key as keyof typeof form] as string}
                onChange={e => set(f.key, e.target.value)}
                required={f.required}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-right focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
          ))}
          <div>
            <label className="block text-xs text-gray-500 mb-1 text-right">ספק</label>
            <select
              value={form.supplierId}
              onChange={e => set('supplierId', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-right focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
            >
              <option value="">ללא ספק</option>
              {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          <div className="flex items-center justify-end gap-2 pt-4">
            <label className="text-sm text-gray-600">מוצר פעיל</label>
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={e => set('isActive', e.target.checked)}
              className="w-4 h-4"
            />
          </div>
        </div>
        <div className="flex gap-2 pt-2">
          <button type="button" onClick={onClose} className="flex-1 py-2 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50">ביטול</button>
          <button type="submit" className="flex-1 py-2 bg-blue-700 text-white rounded-lg text-sm font-semibold hover:bg-blue-800">שמור</button>
        </div>
      </form>
    </div>
  );
}
