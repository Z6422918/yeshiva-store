import { useState } from 'react';
import { useStore } from '../../../store/useStore';
import { Plus, Search, Package, Edit2, Trash2, Truck } from 'lucide-react';
import type { Product, ProductVariant } from '../../../types';
import ProductForm from './ProductForm';
import SupplyForm from './SupplyForm';
import VariantForm from './VariantForm';

const NAVY = '#1e3166';

export default function MitzraimPage() {
  const { products, suppliers, deleteProduct } = useStore();
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [view, setView] = useState<'table' | 'cat'>('table');
  const [editProductId, setEditProductId] = useState<string | null>(null);
  const [supplyVariant, setSupplyVariant] = useState<{ productId: string; variantId: string } | null>(null);
  const [editVariant, setEditVariant] = useState<{ productId: string; variantId: string } | null>(null);

  const filtered = products.filter(p => {
    const q = search.toLowerCase();
    return !q || p.name.includes(q) || p.barcode.includes(q) || p.company.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q) || suppliers.find(s => s.id === p.supplierId)?.name.toLowerCase().includes(q);
  });

  // Flatten to variant rows for table view
  type Row = { product: Product; variant: ProductVariant | null };
  const rows = filtered.flatMap((p): Row[] =>
    p.variants.length === 0
      ? [{ product: p, variant: null }]
      : p.variants.map(v => ({ product: p, variant: v }))
  );

  const categories = [...new Set(products.map(p => p.category).filter(Boolean))];

  const stockBadge = (stock: number) => {
    if (stock <= 0) return { label: '0 אזל', cls: 'bg-red-100 text-red-700' };
    if (stock < 5) return { label: `${stock} נמוך`, cls: 'bg-orange-100 text-orange-700' };
    return { label: `${stock}`, cls: 'bg-green-100 text-green-700' };
  };

  return (
    <div className="space-y-4">

      {/* ── ACTION BAR ── */}
      <div className="flex items-center gap-2.5 flex-wrap">
        <button
          onClick={() => { setShowForm(true); setEditProductId(null); }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white transition-all duration-150 hover:opacity-90"
          style={{ background: NAVY, boxShadow: '0 4px 12px rgba(30,49,102,0.25)' }}
        >
          <Plus size={15} />
          הוסף מוצר
        </button>
        <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all duration-150 hover:bg-gray-50"
          style={{ background: '#fff', color: '#5c6bc0', border: '1.5px solid #d5d9ef' }}>
          📁 ספקים וקטגוריות
        </button>
        <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all duration-150 hover:bg-gray-50"
          style={{ background: '#fff', color: '#5c6bc0', border: '1.5px solid #d5d9ef' }}>
          📄 ייבוא / ייצוא
        </button>
        <div className="flex-1 relative" style={{ minWidth: 240 }}>
          <Search size={14} className="absolute top-1/2 right-3.5 -translate-y-1/2 text-gray-300 pointer-events-none" />
          <input
            type="text"
            placeholder="חיפוש לפי ברקוד, שם, ספק, סוג..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full text-right outline-none text-sm pr-10 pl-3 py-2.5 rounded-xl transition-colors"
            style={{ background: '#fff', border: '1.5px solid #e0e4f0', color: '#333' }}
          />
        </div>
      </div>

      {showForm && <ProductForm onClose={() => setShowForm(false)} />}
      {editProductId && <ProductForm productId={editProductId} onClose={() => setEditProductId(null)} />}
      {supplyVariant && <SupplyForm productId={supplyVariant.productId} variantId={supplyVariant.variantId} onClose={() => setSupplyVariant(null)} />}
      {editVariant && <VariantForm productId={editVariant.productId} variantId={editVariant.variantId} onClose={() => setEditVariant(null)} />}

      {/* ── MAIN CARD ── */}
      <div style={{ background: '#fff', borderRadius: 20, boxShadow: '0 2px 14px rgba(26,35,126,0.07)', border: '1px solid #eaecf5', overflow: 'hidden' }}>

        {/* Sub-tabs */}
        <div style={{ display: 'flex', gap: 0, padding: '0 20px', borderBottom: '2px solid #eaecf5' }}>
          {[
            { id: 'table', label: 'טבלה מלאה' },
            { id: 'cat', label: 'תצוגת קטגוריות' },
          ].map(t => (
            <button
              key={t.id}
              onClick={() => setView(t.id as 'table' | 'cat')}
              className="font-bold text-sm transition-all duration-150"
              style={{
                padding: '13px 22px',
                border: 'none',
                background: 'none',
                cursor: 'pointer',
                borderBottom: view === t.id ? `3px solid ${NAVY}` : '3px solid transparent',
                color: view === t.id ? NAVY : '#aab',
                marginBottom: -2,
                fontFamily: 'inherit',
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* ── TABLE VIEW ── */}
        {view === 'table' && (
          <div style={{ overflowX: 'auto' }}>
            {rows.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 gap-3">
                <Package size={40} className="text-gray-200" />
                <p className="text-sm text-gray-400 font-semibold">אין מוצרים להצגה</p>
              </div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#f8f9fd' }}>
                    {['ברקוד', 'קטגוריה', 'ספק', 'חברה', 'שם', 'סוג', 'מידה', 'פרטים 1', 'פרטים 2', 'מלאי', 'פעולות'].map(h => (
                      <th key={h} style={{ color: '#9fa8da', fontSize: 11, fontWeight: 800, padding: '11px 13px', textAlign: 'right', whiteSpace: 'nowrap', borderBottom: '1px solid #eaecf5' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.map(({ product: p, variant: v }, i) => {
                    const supplier = suppliers.find(s => s.id === p.supplierId);
                    const badge = v ? stockBadge(v.currentStock) : null;
                    return (
                      <tr
                        key={`${p.id}-${v?.id ?? 'no-variant'}-${i}`}
                        style={{ borderBottom: '1px solid #f4f6fb', transition: 'background .15s' }}
                        onMouseEnter={e => (e.currentTarget.style.background = '#fafbff')}
                        onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                      >
                        <td style={{ padding: '11px 13px', fontSize: 12, fontFamily: 'monospace', fontWeight: 700, color: '#5c6bc0' }}>{p.barcode || '—'}</td>
                        <td style={{ padding: '11px 13px' }}>
                          {p.category ? (
                            <span style={{ display: 'inline-flex', alignItems: 'center', padding: '2px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700, background: '#eef0fb', color: NAVY }}>
                              {p.category}
                            </span>
                          ) : <span style={{ color: '#ccc' }}>—</span>}
                        </td>
                        <td style={{ padding: '11px 13px', fontSize: 13, color: '#444', fontWeight: 500 }}>{supplier?.name || '—'}</td>
                        <td style={{ padding: '11px 13px', fontSize: 13, color: '#444', fontWeight: 500 }}>{p.company || '—'}</td>
                        <td style={{ padding: '11px 13px', fontSize: 13, fontWeight: 800, color: NAVY }}>{p.name}</td>
                        <td style={{ padding: '11px 13px', fontSize: 13, color: '#555' }}>{v?.sizeType || '—'}</td>
                        <td style={{ padding: '11px 13px', fontSize: 13, color: '#555' }}>{v?.details1 || <span style={{ color: '#ccc' }}>—</span>}</td>
                        <td style={{ padding: '11px 13px', fontSize: 13, color: '#555' }}>{v?.details2 || <span style={{ color: '#ccc' }}>—</span>}</td>
                        <td style={{ padding: '11px 13px', fontSize: 13, color: '#555' }}>{v?.details2 ? v.details2 : <span style={{ color: '#ccc' }}>—</span>}</td>
                        <td style={{ padding: '11px 13px' }}>
                          {badge ? (
                            <span style={{ display: 'inline-flex', padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 800 }} className={badge.cls}>
                              {badge.label}
                            </span>
                          ) : <span style={{ color: '#ccc' }}>—</span>}
                        </td>
                        <td style={{ padding: '11px 13px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                            <button
                              title="מחק"
                              onClick={() => { if (window.confirm('למחוק מוצר זה?')) deleteProduct(p.id); }}
                              style={{ width: 28, height: 28, borderRadius: 8, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#ffebee', color: '#e57373', transition: 'all .15s', fontSize: 13 }}
                              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#ffcdd2'; (e.currentTarget as HTMLElement).style.color = '#c62828'; }}
                              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = '#ffebee'; (e.currentTarget as HTMLElement).style.color = '#e57373'; }}
                            >
                              <Trash2 size={13} />
                            </button>
                            <button
                              title="ערוך"
                              onClick={() => setEditProductId(p.id)}
                              style={{ width: 28, height: 28, borderRadius: 8, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#eef0fb', color: '#5c6bc0', transition: 'all .15s' }}
                              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#d5d9ef'; }}
                              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = '#eef0fb'; }}
                            >
                              <Edit2 size={13} />
                            </button>
                            {v && (
                              <button
                                title="הספקה"
                                onClick={() => setSupplyVariant({ productId: p.id, variantId: v.id })}
                                style={{ width: 28, height: 28, borderRadius: 8, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#e8f5e9', color: '#66bb6a', transition: 'all .15s' }}
                                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#c8e6c9'; }}
                                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = '#e8f5e9'; }}
                              >
                                <Truck size={13} />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* ── CATEGORY VIEW ── */}
        {view === 'cat' && (
          <div style={{ padding: 24 }}>
            {categories.length === 0 ? (
              <p className="text-center text-gray-400 py-8">אין קטגוריות מוגדרות</p>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14 }}>
                {categories.map(cat => {
                  const count = products.filter(p => p.category === cat).length;
                  return (
                    <div
                      key={cat}
                      onClick={() => { setView('table'); setSearch(cat); }}
                      style={{ background: '#f0f4ff', borderRadius: 16, padding: 20, textAlign: 'center', border: '1.5px solid #c5cae9', cursor: 'pointer', transition: 'all .2s' }}
                      onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = '#e8ecff'}
                      onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = '#f0f4ff'}
                    >
                      <div style={{ fontSize: 28, marginBottom: 8 }}>📦</div>
                      <div style={{ fontWeight: 800, color: NAVY, fontSize: 14 }}>{cat}</div>
                      <div style={{ fontSize: 12, color: '#9fa8da', marginTop: 4 }}>{count} מוצרים</div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
