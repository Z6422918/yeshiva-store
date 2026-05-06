import { useState } from 'react';
import { useStore } from '../../../store/useStore';
import { Plus, Search, Package, ChevronDown, ChevronUp } from 'lucide-react';
import ProductCard from './ProductCard';
import ProductForm from './ProductForm';

export default function MitzraimPage() {
  const products = useStore(s => s.products);
  const suppliers = useStore(s => s.suppliers);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState('');

  const categories = [...new Set(products.map(p => p.category).filter(Boolean))];

  const filtered = products.filter(p => {
    const matchSearch = p.name.includes(search) || p.barcode.includes(search) || p.company.includes(search);
    const matchCat = !categoryFilter || p.category === categoryFilter;
    return matchSearch && matchCat;
  });

  return (
    <div className="space-y-4">
      {/* Top bar */}
      <div className="bg-white rounded-xl shadow p-4 flex items-center gap-3 flex-wrap">
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-blue-700 text-white px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-blue-800 transition"
        >
          <Plus size={16} />
          מוצר חדש
        </button>
        <select
          value={categoryFilter}
          onChange={e => setCategoryFilter(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm text-right focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
        >
          <option value="">כל הקטגוריות</option>
          {categories.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <div className="flex-1 relative min-w-[200px]">
          <Search size={15} className="absolute right-3 top-2.5 text-gray-400" />
          <input
            type="text"
            placeholder="חיפוש מוצר..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full border border-gray-300 rounded-lg py-2 pr-9 pl-3 text-sm text-right focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>
        <span className="text-sm text-gray-400">{filtered.length} מוצרים</span>
      </div>

      {showForm && (
        <ProductForm onClose={() => setShowForm(false)} />
      )}

      {filtered.length === 0 ? (
        <div className="bg-white rounded-xl shadow p-12 text-center">
          <Package size={48} className="mx-auto text-gray-200 mb-3" />
          <p className="text-gray-400">אין מוצרים להצגה</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(p => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}
