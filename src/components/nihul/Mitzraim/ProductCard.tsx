import { useState } from 'react';
import { useStore } from '../../../store/useStore';
import type { Product, ProductVariant } from '../../../types';
import { ChevronDown, ChevronUp, Edit2, Trash2, Plus, History, Truck } from 'lucide-react';
import ProductForm from './ProductForm';
import VariantForm from './VariantForm';
import SupplyForm from './SupplyForm';

interface Props { product: Product }

export default function ProductCard({ product }: Props) {
  const { deleteProduct, deleteVariant, suppliers, transactions } = useStore();
  const [open, setOpen] = useState(false);
  const [editProduct, setEditProduct] = useState(false);
  const [addVariant, setAddVariant] = useState(false);
  const [editVariant, setEditVariant] = useState<string | null>(null);
  const [addSupply, setAddSupply] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState<string | null>(null);

  const supplier = suppliers.find(s => s.id === product.supplierId);

  const totalSupplied = product.variants.reduce((s, v) => s + v.supplies.reduce((ss, sup) => ss + sup.quantity, 0), 0);
  const totalSold = product.variants.reduce((s, v) => s + v.totalSold, 0);
  const totalStock = product.variants.reduce((s, v) => s + v.currentStock, 0);

  // Calculate total profit from all transactions for this product
  const productTransactions = transactions.flatMap(tx =>
    tx.items.filter(i => i.productId === product.id).map(i => ({
      ...i,
      buyerType: tx.buyerType,
    }))
  );

  const totalRevenue = productTransactions.reduce((s, i) => s + i.totalPrice, 0);
  const totalCost = product.variants.reduce((s, v) =>
    s + v.supplies.reduce((ss, sup) => ss + sup.quantity * sup.costPerUnit, 0), 0);

  return (
    <div className="bg-white rounded-xl shadow border border-gray-100">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-50 rounded-xl transition"
      >
        <div className="flex items-center gap-2">
          {open ? <ChevronUp size={18} className="text-gray-400" /> : <ChevronDown size={18} className="text-gray-400" />}
          <span className={`text-xs px-2 py-0.5 rounded-full ${product.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
            {product.isActive ? 'פעיל' : 'לא פעיל'}
          </span>
          <span className="text-xs text-gray-400">{product.category}</span>
          <span className="text-xs text-gray-400">{supplier?.name}</span>
        </div>
        <div className="text-right">
          <p className="font-bold text-gray-800">{product.name}</p>
          <p className="text-xs text-gray-400">{product.barcode} | {product.company}</p>
        </div>
      </button>

      {open && (
        <div className="border-t px-5 py-4 space-y-4">
          {/* Product summary */}
          <div className="grid grid-cols-4 gap-3">
            {[
              { label: 'סופק', value: totalSupplied },
              { label: 'נמכר', value: totalSold },
              { label: 'במלאי', value: totalStock },
              { label: 'רווח', value: `₪${(totalRevenue - totalCost).toFixed(0)}` },
            ].map(item => (
              <div key={item.label} className="bg-gray-50 rounded-lg p-3 text-center">
                <p className="text-lg font-bold text-blue-800">{item.value}</p>
                <p className="text-xs text-gray-500">{item.label}</p>
              </div>
            ))}
          </div>

          {/* Action buttons */}
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setEditProduct(!editProduct)}
              className="flex items-center gap-1 text-xs bg-gray-100 text-gray-600 px-3 py-1.5 rounded-lg hover:bg-gray-200 transition"
            >
              <Edit2 size={13} /> ערוך מוצר
            </button>
            <button
              onClick={() => setAddVariant(!addVariant)}
              className="flex items-center gap-1 text-xs bg-blue-100 text-blue-700 px-3 py-1.5 rounded-lg hover:bg-blue-200 transition"
            >
              <Plus size={13} /> הוסף סוג
            </button>
            <button
              onClick={() => { if (confirm('למחוק מוצר זה?')) deleteProduct(product.id); }}
              className="flex items-center gap-1 text-xs bg-red-100 text-red-600 px-3 py-1.5 rounded-lg hover:bg-red-200 transition"
            >
              <Trash2 size={13} /> מחק
            </button>
          </div>

          {editProduct && <ProductForm productId={product.id} onClose={() => setEditProduct(false)} />}
          {addVariant && <VariantForm productId={product.id} onClose={() => setAddVariant(false)} />}

          {/* Variants */}
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-gray-600 text-right">סוגים ({product.variants.length})</h4>
            {product.variants.map(v => (
              <div key={v.id} className="border border-gray-200 rounded-lg p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex gap-1">
                    <button
                      onClick={() => setAddSupply(addSupply === v.id ? null : v.id)}
                      className="flex items-center gap-1 text-xs bg-green-100 text-green-700 px-2 py-1 rounded hover:bg-green-200"
                    >
                      <Truck size={12} /> הספקה
                    </button>
                    <button
                      onClick={() => setShowHistory(showHistory === v.id ? null : v.id)}
                      className="flex items-center gap-1 text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded hover:bg-purple-200"
                    >
                      <History size={12} /> היסטוריה
                    </button>
                    <button
                      onClick={() => setEditVariant(editVariant === v.id ? null : v.id)}
                      className="flex items-center gap-1 text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded hover:bg-gray-200"
                    >
                      <Edit2 size={12} /> ערוך
                    </button>
                    <button
                      onClick={() => { if (confirm('למחוק סוג זה?')) deleteVariant(product.id, v.id); }}
                      className="text-red-400 hover:text-red-600 p-1"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-gray-800">
                      {[v.sizeType, v.details1, v.details2].filter(Boolean).join(' | ') || 'ברירת מחדל'}
                    </p>
                    <div className="flex gap-3 text-xs text-gray-500 justify-end mt-0.5">
                      <span>ישיבה: <b className="text-blue-700">₪{v.yeshivaPrice}</b></span>
                      <span>חיצוני: <b className="text-gray-700">₪{v.externalPrice}</b></span>
                      <span>עלות: ₪{v.costPrice}</span>
                      <span>מלאי: <b>{v.currentStock}</b></span>
                    </div>
                  </div>
                </div>

                {editVariant === v.id && (
                  <VariantForm productId={product.id} variantId={v.id} onClose={() => setEditVariant(null)} />
                )}

                {addSupply === v.id && (
                  <SupplyForm productId={product.id} variantId={v.id} onClose={() => setAddSupply(null)} />
                )}

                {showHistory === v.id && v.priceHistory.length > 0 && (
                  <div className="bg-gray-50 rounded-lg p-3 space-y-1">
                    <p className="text-xs font-semibold text-gray-600 text-right mb-2">היסטוריית מחירים</p>
                    {v.priceHistory.map(h => (
                      <div key={h.id} className="flex justify-between text-xs text-gray-600">
                        <span>₪{h.totalProfit.toFixed(0)} רווח | {h.quantitySold} יח'</span>
                        <span>{h.fromDate} – {h.toDate ?? 'היום'} | ישיבה: ₪{h.yeshivaPrice}</span>
                      </div>
                    ))}
                  </div>
                )}

                {v.supplies.length > 0 && (
                  <div className="bg-green-50 rounded-lg p-2 space-y-1">
                    <p className="text-xs font-semibold text-gray-500 text-right">הספקות</p>
                    {v.supplies.map(s => (
                      <div key={s.id} className="flex justify-between text-xs text-gray-600">
                        <span>₪{(s.quantity * s.costPerUnit).toFixed(2)} סה"כ</span>
                        <span>{s.date} | {s.quantity} יח' | ₪{s.costPerUnit}/יח'</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
            {product.variants.length === 0 && (
              <p className="text-center text-xs text-gray-400 py-2">אין סוגים מוגדרים</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
