import { useState } from 'react';
import { useStore } from '../../../store/useStore';
import {
  Plus, Search, Package, Pencil, Trash2, PackagePlus,
  ChevronRight, ChevronDown, Folder, FileDown,
} from 'lucide-react';
import type { Product, ProductVariant, Supply, PriceHistoryEntry } from '../../../types';
import { Card } from '../../ui/card';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../ui/dialog';
import { cn } from '../../../lib/utils';

// ─── Stock badge helper ────────────────────────────────────────────────────────
function StockBadge({ stock }: { stock: number }) {
  if (stock <= 0)
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-700 border border-red-200">
        🔴 אזל
      </span>
    );
  if (stock < 5)
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-orange-100 text-orange-700 border border-orange-200">
        🟠 {stock}
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-green-100 text-green-700 border border-green-200">
      🟢 {stock}
    </span>
  );
}

// ─── Category badge color map ──────────────────────────────────────────────────
const CAT_COLORS: Record<string, string> = {
  'מוצרי חלב':   'bg-blue-50   text-blue-800   border-blue-200',
  'לחם ומאפים':  'bg-orange-50  text-orange-800  border-orange-200',
  'שתייה':       'bg-purple-50  text-purple-800  border-purple-200',
  'חטיפים':      'bg-yellow-50  text-yellow-800  border-yellow-200',
  'קפואים':      'bg-cyan-50    text-cyan-800    border-cyan-200',
};
function catColor(cat: string) {
  return CAT_COLORS[cat] ?? 'bg-primary/10 text-primary border-primary/20';
}

// ─── Add/Edit Product Dialog ───────────────────────────────────────────────────
interface ProductDialogProps {
  open: boolean;
  onClose: () => void;
  editProduct?: Product;
  onAdded?: (productId: string) => void;
}

function ProductDialog({ open, onClose, editProduct, onAdded }: ProductDialogProps) {
  const { suppliers, addProduct, updateProduct } = useStore();
  const [form, setForm] = useState({
    name:       editProduct?.name       ?? '',
    supplierId: editProduct?.supplierId ?? '',
    category:   editProduct?.category   ?? '',
    barcode:    editProduct?.barcode    ?? '',
    company:    editProduct?.company    ?? '',
    isActive:   editProduct?.isActive   ?? true,
  });

  const handleSave = () => {
    if (!form.name.trim()) return;
    if (editProduct) {
      updateProduct(editProduct.id, form);
    } else {
      const id = addProduct({ ...form, variants: [] });
      onAdded?.(id);
    }
    onClose();
  };

  const field = (label: string, key: keyof typeof form) => (
    <div className="space-y-1">
      <Label className="text-xs text-muted-foreground">{label}</Label>
      <Input
        value={form[key] as string}
        onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))}
        className="h-9 text-sm"
      />
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent dir="rtl">
        <DialogHeader>
          <DialogTitle>{editProduct ? 'עריכת מוצר' : 'הוספת מוצר חדש'}</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-3">
          {field('שם מוצר', 'name')}
          {field('ברקוד', 'barcode')}
          {field('חברה', 'company')}
          {field('קטגוריה', 'category')}
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">ספק</Label>
            <select
              value={form.supplierId}
              onChange={e => setForm(p => ({ ...p, supplierId: e.target.value }))}
              className="flex h-9 w-full rounded-lg border border-input bg-background px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="">— בחר ספק —</option>
              {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>ביטול</Button>
          <Button onClick={handleSave}>{editProduct ? 'שמור שינויים' : 'הוסף מוצר'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Add/Edit Variant Dialog ───────────────────────────────────────────────────
interface VariantDialogProps {
  open: boolean;
  onClose: () => void;
  productId: string;
  editVariant?: ProductVariant;
}

function VariantDialog({ open, onClose, productId, editVariant }: VariantDialogProps) {
  const { addVariant, updateVariant } = useStore();
  const [form, setForm] = useState({
    sizeType:      editVariant?.sizeType      ?? '',
    size:          editVariant?.size          ?? '',
    details1:      editVariant?.details1      ?? '',
    details2:      editVariant?.details2      ?? '',
    yeshivaPrice:  editVariant?.yeshivaPrice  ?? 0,
    externalPrice: editVariant?.externalPrice ?? 0,
    costPrice:     editVariant?.costPrice     ?? 0,
  });

  const handleSave = () => {
    if (editVariant) {
      updateVariant(productId, editVariant.id, form);
    } else {
      addVariant(productId, form);
    }
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent dir="rtl">
        <DialogHeader>
          <DialogTitle>{editVariant ? 'עריכת וריאנט' : 'הוספת וריאנט'}</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: 'סוג',     key: 'sizeType' },
            { label: 'מידה',    key: 'size' },
            { label: 'פרטים 1', key: 'details1' },
            { label: 'פרטים 2', key: 'details2' },
          ].map(f => (
            <div key={f.key} className="space-y-1">
              <Label className="text-xs text-muted-foreground">{f.label}</Label>
              <Input
                value={form[f.key as keyof typeof form] as string}
                onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                className="h-9 text-sm"
              />
            </div>
          ))}
          {[
            { label: 'מחיר ישיבה ₪',  key: 'yeshivaPrice' },
            { label: 'מחיר חיצוני ₪', key: 'externalPrice' },
            { label: 'מחיר עלות ₪',   key: 'costPrice' },
          ].map(f => (
            <div key={f.key} className="space-y-1">
              <Label className="text-xs text-muted-foreground">{f.label}</Label>
              <Input
                type="number"
                min={0}
                value={form[f.key as keyof typeof form] as number}
                onChange={e => setForm(p => ({ ...p, [f.key]: Number(e.target.value) }))}
                className="h-9 text-sm"
              />
            </div>
          ))}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>ביטול</Button>
          <Button onClick={handleSave}>{editVariant ? 'שמור' : 'הוסף'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Supply Dialog ─────────────────────────────────────────────────────────────
interface SupplyDialogProps {
  open: boolean;
  onClose: () => void;
  productId: string;
  variantId: string;
}

function SupplyDialog({ open, onClose, productId, variantId }: SupplyDialogProps) {
  const { addSupply } = useStore();
  const [form, setForm] = useState({
    date:        new Date().toISOString().split('T')[0],
    quantity:    1,
    costPerUnit: 0,
  });

  const handleSave = () => {
    if (form.quantity < 1) return;
    addSupply(productId, variantId, form);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent dir="rtl">
        <DialogHeader>
          <DialogTitle>הספקה חדשה</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">תאריך</Label>
            <Input type="date" value={form.date}
              onChange={e => setForm(p => ({ ...p, date: e.target.value }))} className="h-9 text-sm" />
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">כמות</Label>
            <Input type="number" min={1} value={form.quantity}
              onChange={e => setForm(p => ({ ...p, quantity: Number(e.target.value) }))} className="h-9 text-sm" />
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">עלות ליחידה ₪</Label>
            <Input type="number" min={0} value={form.costPerUnit}
              onChange={e => setForm(p => ({ ...p, costPerUnit: Number(e.target.value) }))} className="h-9 text-sm" />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>ביטול</Button>
          <Button onClick={handleSave}>הוסף הספקה</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Supply History table ──────────────────────────────────────────────────────
function SupplyHistoryTable({ supplies }: { supplies: Supply[] }) {
  if (supplies.length === 0)
    return <p className="text-xs text-muted-foreground py-2 text-center">אין היסטוריית הספקות</p>;
  return (
    <div className="rounded-lg border border-border/50 overflow-hidden">
      <table className="w-full text-xs">
        <thead>
          <tr className="bg-[#f8f9fd]">
            <th className="text-right px-3 py-2 font-bold text-[#9fa8da]">תאריך</th>
            <th className="text-right px-3 py-2 font-bold text-[#9fa8da]">כמות</th>
            <th className="text-right px-3 py-2 font-bold text-[#9fa8da]">עלות ליחידה</th>
            <th className="text-right px-3 py-2 font-bold text-[#9fa8da]">סה"כ</th>
          </tr>
        </thead>
        <tbody>
          {[...supplies].reverse().map(s => (
            <tr key={s.id} className="border-t border-border/30 hover:bg-muted/30">
              <td className="px-3 py-1.5">{s.date}</td>
              <td className="px-3 py-1.5 font-bold">{s.quantity}</td>
              <td className="px-3 py-1.5">₪{s.costPerUnit.toFixed(2)}</td>
              <td className="px-3 py-1.5 font-bold text-primary">₪{(s.quantity * s.costPerUnit).toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─── Price History table ───────────────────────────────────────────────────────
function PriceHistoryTable({ priceHistory }: { priceHistory: PriceHistoryEntry[] }) {
  if (priceHistory.length === 0) return null;
  return (
    <div className="rounded-lg border border-border/50 overflow-hidden">
      <table className="w-full text-xs">
        <thead>
          <tr className="bg-[#f8f9fd]">
            {['מתאריך','עד תאריך','מחיר ישיבה','מחיר חיצוני','עלות','נמכרו','הכנסה','רווח'].map(h => (
              <th key={h} className="text-right px-3 py-2 font-bold text-[#9fa8da]">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {[...priceHistory].reverse().map(h => (
            <tr key={h.id} className="border-t border-border/30 hover:bg-muted/30">
              <td className="px-3 py-1.5">{h.fromDate}</td>
              <td className="px-3 py-1.5">{h.toDate ?? <span className="text-green-600 font-semibold">נוכחי</span>}</td>
              <td className="px-3 py-1.5 font-semibold text-primary">₪{h.yeshivaPrice.toFixed(2)}</td>
              <td className="px-3 py-1.5">₪{h.externalPrice.toFixed(2)}</td>
              <td className="px-3 py-1.5">₪{h.costPrice.toFixed(2)}</td>
              <td className="px-3 py-1.5 font-bold">{h.quantitySold}</td>
              <td className="px-3 py-1.5 font-semibold text-blue-600">₪{h.totalRevenue.toFixed(2)}</td>
              <td className="px-3 py-1.5 font-semibold text-green-600">₪{h.totalProfit.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function MitzraimPage() {
  const { products, suppliers, deleteProduct, deleteVariant } = useStore();

  const [search,       setSearch]       = useState('');
  const [view,         setView]         = useState<'table' | 'cat'>('table');
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  // Dialogs
  const [productDlg, setProductDlg] = useState<{ open: boolean; edit?: Product }>({ open: false });
  const [variantDlg, setVariantDlg] = useState<{ open: boolean; productId: string; edit?: ProductVariant } | null>(null);
  const [supplyDlg,  setSupplyDlg]  = useState<{ open: boolean; productId: string; variantId: string } | null>(null);

  const filtered = products.filter(p => {
    const q = search.toLowerCase();
    if (!q) return true;
    const sup = suppliers.find(s => s.id === p.supplierId)?.name ?? '';
    return (
      p.name.includes(q) || p.barcode.includes(q) ||
      p.company.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q) ||
      sup.toLowerCase().includes(q)
    );
  });

  // Flatten: each variant = one row; no-variant product = one row
  type FlatRow = { product: Product; variant: ProductVariant | null; rowKey: string; isFirst: boolean };
  const rows: FlatRow[] = filtered.flatMap((p): FlatRow[] =>
    p.variants.length === 0
      ? [{ product: p, variant: null, rowKey: `${p.id}__none`, isFirst: true }]
      : p.variants.map((v, idx) => ({ product: p, variant: v, rowKey: `${p.id}__${v.id}`, isFirst: idx === 0 }))
  );

  const categories = [...new Set(products.map(p => p.category).filter(Boolean))];

  const toggleExpand = (key: string) =>
    setExpandedRows(prev => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });

  return (
    <div className="space-y-4" dir="rtl">

      {/* ── Action bar ── */}
      <div className="flex items-center gap-2 flex-wrap">
        <Button
          onClick={() => setProductDlg({ open: true })}
          className="gap-2 font-bold bg-[#1e3166] hover:bg-[#162550] text-white shadow-md"
        >
          <Plus size={14} /> הוסף מוצר
        </Button>
        <Button variant="outline" className="gap-2 text-[#5c6bc0] border-[#d5d9ef] hover:bg-[#f0f2fa]">
          <Package size={14} /> ספקים וקטגוריות
        </Button>
        <Button variant="outline" className="gap-2 text-[#5c6bc0] border-[#d5d9ef] hover:bg-[#f0f2fa]">
          <FileDown size={14} /> ייבוא / ייצוא
        </Button>
        <div className="flex-1 relative min-w-56 mr-auto">
          <Search size={13} className="absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          <Input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="🔍  חיפוש לפי ברקוד, שם, ספק, סוג, מידה..."
            className="pr-9 text-sm"
          />
        </div>
        <span className="text-xs text-muted-foreground font-semibold">{filtered.length} מוצרים</span>
      </div>

      {/* ── Main Card ── */}
      <div className="bg-white rounded-[20px] shadow-md border border-[#eaecf5] overflow-hidden">

        {/* Sub-tabs — order: קטגוריות | טבלה (exactly as reference) */}
        <div className="flex border-b-2 border-[#eaecf5] px-5">
          {([
            { id: 'cat'   as const, label: 'תצוגת קטגוריות' },
            { id: 'table' as const, label: 'טבלה מלאה' },
          ]).map(t => (
            <button
              key={t.id}
              onClick={() => setView(t.id)}
              className={cn(
                'px-5 py-3.5 text-[13px] font-bold border-b-[3px] -mb-px transition-all',
                view === t.id
                  ? 'text-[#1e3166] border-[#1e3166]'
                  : 'text-[#aab] border-transparent hover:text-[#5c6bc0]'
              )}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* ══ TABLE VIEW ══ */}
        {view === 'table' && (
          rows.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3 text-muted-foreground">
              <Package size={44} className="opacity-30" />
              <p className="text-sm font-semibold">אין מוצרים להצגה</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-[#f8f9fd]">
                    <th className="w-9 px-3 py-3 border-b border-[#eaecf5]" />
                    {['ברקוד','קטגוריה','ספק','חברה','שם','סוג','מידה','פרטים 1','פרטים 2','מלאי','פעולות'].map(h => (
                      <th key={h} className="text-right px-3 py-3 text-[11px] font-[800] text-[#9fa8da] border-b border-[#eaecf5] whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.map(({ product: p, variant: v, rowKey, isFirst }) => {
                    const supplier   = suppliers.find(s => s.id === p.supplierId);
                    const isExpanded = expandedRows.has(rowKey);

                    return (
                      <>
                        <tr
                          key={rowKey}
                          className="border-b border-[#f4f6fb] hover:bg-[#fafbff] transition-colors"
                        >
                          {/* ── Expand button ── */}
                          <td className="px-3 py-2.5 w-9 text-center">
                            {v && (
                              <button
                                onClick={() => toggleExpand(rowKey)}
                                className="w-6 h-6 flex items-center justify-center rounded text-[#9fa8da] hover:text-[#1e3166] hover:bg-[#eef0fb] transition-all mx-auto"
                                title={isExpanded ? 'סגור' : 'הרחב'}
                              >
                                {isExpanded
                                  ? <ChevronDown  size={14} />
                                  : <ChevronRight size={14} />
                                }
                              </button>
                            )}
                          </td>

                          {/* ── Barcode ── */}
                          <td className="px-3 py-2.5 font-mono text-[13px] font-bold text-[#5c6bc0]">
                            {p.barcode || <span className="text-[#ccc]">—</span>}
                          </td>

                          {/* ── Category ── */}
                          <td className="px-3 py-2.5">
                            {p.category
                              ? <span className={cn('inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold border', catColor(p.category))}>{p.category}</span>
                              : <span className="text-[#ccc]">—</span>
                            }
                          </td>

                          {/* ── Supplier ── */}
                          <td className="px-3 py-2.5 text-[13px] font-[500]">
                            {supplier?.name || <span className="text-[#ccc]">—</span>}
                          </td>

                          {/* ── Company ── */}
                          <td className="px-3 py-2.5 text-[13px] font-[500]">
                            {p.company || <span className="text-[#ccc]">—</span>}
                          </td>

                          {/* ── Product name ── */}
                          <td className="px-3 py-2.5 text-[13px] font-[800] text-[#1e3166]">
                            {p.name}
                          </td>

                          {/* ── sizeType ── */}
                          <td className="px-3 py-2.5 text-[13px] font-[500]">
                            {v?.sizeType || <span className="text-[#ccc]">—</span>}
                          </td>

                          {/* ── size ── */}
                          <td className="px-3 py-2.5 text-[13px] font-[500]">
                            {v?.size || <span className="text-[#ccc]">—</span>}
                          </td>

                          {/* ── details1 ── */}
                          <td className="px-3 py-2.5 text-[13px] font-[500]">
                            {v?.details1 || <span className="text-[#ccc]">—</span>}
                          </td>

                          {/* ── details2 ── */}
                          <td className="px-3 py-2.5 text-[13px] font-[500]">
                            {v?.details2 || <span className="text-[#ccc]">—</span>}
                          </td>

                          {/* ── Stock ── */}
                          <td className="px-3 py-2.5">
                            {v
                              ? <StockBadge stock={v.currentStock} />
                              : <span className="text-[#ccc] text-[13px]">—</span>
                            }
                          </td>

                          {/* ── Actions: del | edit | supply | (+variant for first row) ── */}
                          <td className="px-3 py-2.5">
                            <div className="flex items-center gap-1.5">
                              {/* delete */}
                              <button
                                title={v ? 'מחק וריאנט' : 'מחק מוצר'}
                                onClick={() => {
                                  if (v) { if (window.confirm('למחוק וריאנט זה?'))  deleteVariant(p.id, v.id); }
                                  else   { if (window.confirm('למחוק מוצר זה?'))    deleteProduct(p.id); }
                                }}
                                className="w-[30px] h-[30px] rounded-[9px] flex items-center justify-center bg-[#ffebee] text-[#e57373] hover:bg-[#ffcdd2] hover:text-[#c62828] transition-all"
                              >
                                <Trash2 size={13} />
                              </button>
                              {/* edit product */}
                              <button
                                title="ערוך מוצר"
                                onClick={() => setProductDlg({ open: true, edit: p })}
                                className="w-[30px] h-[30px] rounded-[9px] flex items-center justify-center bg-[#eef0fb] text-[#5c6bc0] hover:bg-[#d5d9ef] hover:text-[#1e3166] transition-all"
                              >
                                <Pencil size={13} />
                              </button>
                              {/* supply — only when variant exists */}
                              {v && (
                                <button
                                  title="הספקה"
                                  onClick={() => setSupplyDlg({ open: true, productId: p.id, variantId: v.id })}
                                  className="w-[30px] h-[30px] rounded-[9px] flex items-center justify-center bg-[#e8f5e9] text-[#66bb6a] hover:bg-[#c8e6c9] hover:text-[#2e7d32] transition-all"
                                >
                                  <PackagePlus size={13} />
                                </button>
                              )}
                              {/* add variant — only on first row */}
                              {isFirst && (
                                <button
                                  title="הוסף וריאנט"
                                  onClick={() => setVariantDlg({ open: true, productId: p.id })}
                                  className="w-[30px] h-[30px] rounded-[9px] flex items-center justify-center bg-blue-50 text-blue-500 hover:bg-blue-100 hover:text-blue-700 transition-all"
                                >
                                  <Plus size={13} />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>

                        {/* ── Expanded panel ── */}
                        {isExpanded && v && (
                          <tr key={`${rowKey}__exp`} className="bg-[#f0f4ff]">
                            <td colSpan={12} className="px-6 py-4">
                              <div className="space-y-4">

                                {/* Info boxes */}
                                <div className="grid grid-cols-5 gap-3">
                                  {[
                                    { label: 'מחיר ישיבה',  val: `₪${v.yeshivaPrice.toFixed(2)}`,  cls: 'text-[#1e3166]' },
                                    { label: 'מחיר חיצוני', val: `₪${v.externalPrice.toFixed(2)}`, cls: 'text-blue-600' },
                                    { label: 'מחיר עלות',   val: `₪${v.costPrice.toFixed(2)}`,     cls: 'text-orange-600' },
                                    { label: 'מלאי נוכחי',  val: String(v.currentStock),           cls: 'text-green-600' },
                                    { label: 'נמכר סה"כ',   val: String(v.totalSold),              cls: 'text-purple-600' },
                                  ].map(box => (
                                    <div key={box.label} className="bg-white rounded-xl border border-[#eaecf5] p-3 text-center shadow-sm">
                                      <div className="text-[11px] text-[#9fa8da] font-bold mb-1">{box.label}</div>
                                      <div className={cn('text-[18px] font-[900] leading-tight', box.cls)}>{box.val}</div>
                                    </div>
                                  ))}
                                </div>

                                {/* Supply history */}
                                <div>
                                  <div className="text-[11px] font-bold text-[#9fa8da] mb-2 tracking-wide">📦 היסטוריית הספקות</div>
                                  <SupplyHistoryTable supplies={v.supplies} />
                                </div>

                                {/* Price history */}
                                {v.priceHistory.length > 0 && (
                                  <div>
                                    <div className="text-[11px] font-bold text-[#9fa8da] mb-2 tracking-wide">💰 היסטוריית מחירים</div>
                                    <PriceHistoryTable priceHistory={v.priceHistory} />
                                  </div>
                                )}

                              </div>
                            </td>
                          </tr>
                        )}
                      </>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )
        )}

        {/* ══ CATEGORY VIEW ══ */}
        {view === 'cat' && (
          <div className="p-6">
            {categories.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 gap-3 text-muted-foreground">
                <Folder size={44} className="opacity-30" />
                <p className="text-sm font-semibold">אין קטגוריות מוגדרות</p>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-4">
                {categories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => { setView('table'); setSearch(cat); }}
                    className="flex flex-col items-center justify-center gap-2 p-6 rounded-[16px] border-[1.5px] border-[#c5cae9] bg-[#f0f4ff] hover:bg-[#e8ecff] transition-all text-center cursor-pointer"
                  >
                    <Folder size={28} className="text-[#5c6bc0]" />
                    <div className="font-[800] text-[#1e3166] text-[14px]">{cat}</div>
                    <div className="text-[12px] text-[#9fa8da]">
                      {products.filter(p => p.category === cat).length} מוצרים
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

      </div>{/* end main card */}

      {/* ── Dialogs ── */}
      <ProductDialog
        open={productDlg.open}
        onClose={() => setProductDlg({ open: false })}
        editProduct={productDlg.edit}
        onAdded={(id) => setVariantDlg({ open: true, productId: id })}
      />

      {variantDlg && (
        <VariantDialog
          open={variantDlg.open}
          onClose={() => setVariantDlg(null)}
          productId={variantDlg.productId}
          editVariant={variantDlg.edit}
        />
      )}

      {supplyDlg && (
        <SupplyDialog
          open={supplyDlg.open}
          onClose={() => setSupplyDlg(null)}
          productId={supplyDlg.productId}
          variantId={supplyDlg.variantId}
        />
      )}

    </div>
  );
}
