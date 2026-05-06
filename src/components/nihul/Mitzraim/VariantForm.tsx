import { useState } from 'react';
import { useStore } from '../../../store/useStore';
import { X } from 'lucide-react';

interface Props { productId: string; variantId?: string; onClose: () => void }

export default function VariantForm({ productId, variantId, onClose }: Props) {
  const { addVariant, updateVariant, products } = useStore();
  const product = products.find(p => p.id === productId);
  const existing = variantId ? product?.variants.find(v => v.id === variantId) : null;

  const [form, setForm] = useState({
    sizeType: existing?.sizeType ?? '',
    details1: existing?.details1 ?? '',
    details2: existing?.details2 ?? '',
    yeshivaPrice: existing?.yeshivaPrice ?? 0,
    externalPrice: existing?.externalPrice ?? 0,
    costPrice: existing?.costPrice ?? 0,
  });

  const set = (k: string, v: string | number) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (existing) {
      updateVariant(productId, existing.id, form);
    } else {
      addVariant(productId, form);
    }
    onClose();
  };

  return (
    <div className="bg-blue-50 rounded-lg p-4 border border-blue-100 space-y-3">
      <div className="flex items-center justify-between">
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
        <p className="text-sm font-semibold text-gray-700">{existing ? 'עריכת סוג' : 'סוג חדש'}</p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="grid grid-cols-3 gap-2">
          {[
            { key: 'sizeType', label: 'סוג מידה', type: 'text' },
            { key: 'details1', label: 'פרטים 1', type: 'text' },
            { key: 'details2', label: 'פרטים 2', type: 'text' },
            { key: 'yeshivaPrice', label: 'מחיר ישיבה ₪', type: 'number' },
            { key: 'externalPrice', label: 'מחיר חיצוני ₪', type: 'number' },
            { key: 'costPrice', label: 'עלות ₪', type: 'number' },
          ].map(f => (
            <div key={f.key}>
              <label className="block text-xs text-gray-500 mb-1 text-right">{f.label}</label>
              <input
                type={f.type}
                value={form[f.key as keyof typeof form]}
                onChange={e => set(f.key, f.type === 'number' ? Number(e.target.value) : e.target.value)}
                step={f.type === 'number' ? '0.01' : undefined}
                className="w-full border border-gray-300 rounded-lg px-2 py-1.5 text-sm text-right focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          <button type="button" onClick={onClose} className="flex-1 py-2 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50">ביטול</button>
          <button type="submit" className="flex-1 py-2 bg-blue-700 text-white rounded-lg text-sm font-semibold hover:bg-blue-800">שמור</button>
        </div>
      </form>
    </div>
  );
}
