import { useState } from 'react';
import { useStore } from '../../../store/useStore';
import {
  Plus, Search, Package, Pencil, Trash2, PackagePlus,
  ChevronLeft, ChevronDown, Folder,
} from 'lucide-react';
import type { Product, ProductVariant, Supply, PriceHistoryEntry } from '../../../types';
import { Card } from '../../ui/card';
import { Badge } from '../../ui/badge';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../ui/dialog';
import { cn } from '../../../lib/utils';

// ─── Stock badge helper ────────────────────────────────────────────────────────
function stockBadge(stock: number) {
  if (stock <= 0) return { label: '0 — אזל', cls: 'bg-red-100 text-red-700 border-red-200' };
  if (stock < 5)  return { label: `${stock} — נמוך`, cls: 'bg-orange-100 text-orange-700 border-orange-200' };
  return { label: `${stock}`, cls: 'bg-green-100 text-green-700 border-green-200' };
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
    name: editProduct?.name ?? '',
    supplierId: editProduct?.supplierId ?? '',
    category: editProduct?.category ?? '',
    barcode: editProduct?.barcode ?? '',
    company: editProduct?.company ?? '',
    isActive: editProduct?.isActive ?? true,
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

  const field = (label: string, key: keyof typeof form, type = 'text') => (
    <div className="space-y-1">
      <Label className="text-xs text-muted-foreground">{label}</Label>
      <Input
        type={type}
        value={form[key] as string}
        onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))}
        className="h-9 text-sm"
      />
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
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
    sizeType: editVariant?.sizeType ?? '',
    size: editVariant?.size ?? '',
    details1: editVariant?.details1 ?? '',
    details2: editVariant?.details2 ?? '',
    yeshivaPrice: editVariant?.yeshivaPrice ?? 0,
    externalPrice: editVariant?.externalPrice ?? 0,
    costPrice: editVariant?.costPrice ?? 0,
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
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{editVariant ? 'עריכת וריאנט' : 'הוספת וריאנט'}</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: 'סוג', key: 'sizeType' },
            { label: 'מידה', key: 'size' },
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
            { label: 'מחיר ישיבה ₪', key: 'yeshivaPrice' },
            { label: 'מחיר חיצוני ₪', key: 'externalPrice' },
            { label: 'מחיר עלות ₪', key: 'costPrice' },
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
  const [form, setForm] = useState({ date: new Date().toISOString().split('T')[0], quantity: 1, costPerUnit: 0 });

  const handleSave = () => {
    if (form.quantity < 1) return;
    addSupply(productId, variantId, form);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>הספקה חדשה</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">תאריך</Label>
            <Input type="date" value={form.date} onChange={e => setForm(p => ({ ...p, date: e.target.value }))} className="h-9 text-sm" />
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">כמות</Label>
            <Input type="number" min={1} value={form.quantity} onChange={e => setForm(p => ({ ...p, quantity: Number(e.target.value) }))} className="h-9 text-sm" />
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">עלות ליחידה ₪</Label>
            <Input type="number" min={0} value={form.costPerUnit} onChange={e => setForm(p => ({ ...p, costPerUnit: Number(e.target.value) }))} className="h-9 text-sm" />
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

// ─── Supply History inline ─────────────────────────────────────────────────────
function SupplyHistory({ supplies }: { supplies: Supply[] }) {
  if (supplies.length === 0) {
    return <p className="text-xs text-muted-foreground py-2 text-center">אין היסטוריית הספקות</p>;
  }
  return (
    <div className="rounded-lg border border-border/50 overflow-hidden mt-1">
      <table className="w-full text-xs">
        <thead>
          <tr className="bg-muted/40">
            <th className="text-right px-3 py-1.5 font-semibold text-muted-foreground">תאריך</th>
            <th className="text-right px-3 py-1.5 font-semibold text-muted-foreground">כמות</th>
            <th className="text-right px-3 py-1.5 font-semibold text-muted-foreground">עלות ליחידה</th>
            <th className="text-right px-3 py-1.5 font-semibold text-muted-foreground">סה"כ</th>
          </tr>
        </thead>
        <tbody>
          {[...supplies].reverse().map(s => (
            <tr key={s.id} className="border-t border-border/30">
              <td className="px-3 py-1.5">{s.date}</td>
              <td className="px-3 py-1.5">{s.quantity}</td>
              <td className="px-3 py-1.5">₪{s.costPerUnit.toFixed(2)}</td>
              <td className="px-3 py-1.5 font-semibold text-primary">₪{(s.quantity * s.costPerUnit).toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─── Price History inline ──────────────────────────────────────────────────────
function PriceHistoryTable({ priceHistory }: { priceHistory: PriceHistoryEntry[] }) {
  if (priceHistory.length === 0) return null;
  return (
    <div className="rounded-lg border border-border/50 overflow-hidden mt-1">
      <table className="w-full text-xs">
        <thead>
          <tr className="bg-muted/40">
            <th className="text-right px-3 py-1.5 font-semibold text-muted-foreground">מתאריך</th>
            <th className="text-right px-3 py-1.5 font-semibold text-muted-foreground">עד תאריך</th>
            <th className="text-right px-3 py-1.5 font-semibold text-muted-foreground">מחיר ישיבה</th>
            <th className="text-right px-3 py-1.5 font-semibold text-muted-foreground">מחיר חיצוני</th>
            <th className="text-right px-3 py-1.5 font-semibold text-muted-foreground">עלות</th>
            <th className="text-right px-3 py-1.5 font-semibold text-muted-foreground">נמכרו</th>
            <th className="text-right px-3 py-1.5 font-semibold text-muted-foreground">הכנסה</th>
            <th className="text-right px-3 py-1.5 font-semibold text-muted-foreground">רווח</th>
          </tr>
        </thead>
        <tbody>
          {[...priceHistory].reverse().map(h => (
            <tr key={h.id} className="border-t border-border/30">
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

// ─── Category Card ─────────────────────────────────────────────────────────────
function CategoryCard({ cat, count, onClick }: { cat: string; count: number; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center justify-center gap-2 p-6 rounded-xl border-2 border-primary/20 bg-primary/5 hover:bg-primary/10 transition-smooth text-center cursor-pointer w-full"
    >
      <Folder size={32} className="text-primary/60" />
      <div className="font-bold text-primary text-sm">{cat}</div>
      <div className="text-xs text-muted-foreground">{count} מוצרים</div>
    </button>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function MitzraimPage() {
  const { products, suppliers, deleteProduct, deleteVariant } = useStore();

  const [search, setSearch] = useState('');
  const [view, setView] = useState<'table' | 'cat'>('table');
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  // Dialogs
  const [productDlg, setProductDlg] = useState<{ open: boolean; edit?: Product }>({ open: false });
  const [variantDlg, setVariantDlg] = useState<{ open: boolean; productId: string; edit?: ProductVariant } | null>(null);
  const [supplyDlg, setSupplyDlg] = useState<{ open: boolean; productId: string; variantId: string } | null>(null);

  const filtered = products.filter(p => {
    const q = search.toLowerCase();
    if (!q) return true;
    const supplierName = suppliers.find(s => s.id === p.supplierId)?.name ?? '';
    return (
      p.name.includes(q) ||
      p.barcode.includes(q) ||
      p.company.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q) ||
      supplierName.toLowerCase().includes(q)
    );
  });

  // Flatten rows: each variant = one row; product with no variants = one row
  type FlatRow = { product: Product; variant: ProductVariant | null; rowKey: string; isFirst: boolean };
  const rows: FlatRow[] = filtered.flatMap((p): FlatRow[] =>
    p.variants.length === 0
      ? [{ product: p, variant: null, rowKey: `${p.id}__none`, isFirst: true }]
      : p.variants.map((v, idx) => ({ product: p, variant: v, rowKey: `${p.id}__${v.id}`, isFirst: idx === 0 }))
  );

  const categories = [...new Set(products.map(p => p.category).filter(Boolean))];

  const toggleExpand = (key: string) => {
    setExpandedRows(prev => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  };

  const tabs = [
    { id: 'table' as const, label: 'טבלה מלאה' },
    { id: 'cat' as const, label: 'תצוגת קטגוריות' },
  ];

  return (
    <div className="space-y-5" dir="rtl">

      {/* ── Action bar ── */}
      <div className="flex items-center gap-2 flex-wrap">
        <Button
          onClick={() => setProductDlg({ open: true })}
          className="gradient-primary shadow-soft gap-2 font-bold"
        >
          <Plus size={15} />
          הוסף מוצר
        </Button>
        <Button variant="outline" className="gap-2 text-primary border-primary/30">
          <Package size={15} />
          ספקים וקטגוריות
        </Button>
        <div className="flex-1 relative min-w-56">
          <Search size={14} className="absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          <Input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="חיפוש לפי ברקוד, שם, ספק, קטגוריה..."
            className="pr-9 text-sm"
          />
        </div>
        <span className="text-xs text-muted-foreground font-medium">
          {filtered.length} מוצרים
        </span>
      </div>

      {/* ── Main Card ── */}
      <Card className="shadow-soft overflow-hidden">

        {/* Sub-tabs */}
        <div className="flex border-b border-border">
          {tabs.map(t => (
            <button
              key={t.id}
              onClick={() => setView(t.id)}
              className={cn(
                'px-6 py-3.5 text-sm font-bold transition-smooth border-b-2 -mb-px',
                view === t.id
                  ? 'text-primary border-primary'
                  : 'text-muted-foreground border-transparent hover:text-foreground'
              )}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* ── Table View ── */}
        {view === 'table' && (
          rows.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3 text-muted-foreground">
              <Package size={44} className="opacity-30" />
              <p className="text-sm font-semibold">אין מוצרים להצגה</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40 hover:bg-muted/40">
                  <TableHead className="w-8" />
                  <TableHead className="text-xs font-bold text-muted-foreground">ברקוד</TableHead>
                  <TableHead className="text-xs font-bold text-muted-foreground">קטגוריה</TableHead>
                  <TableHead className="text-xs font-bold text-muted-foreground">ספק</TableHead>
                  <TableHead className="text-xs font-bold text-muted-foreground">חברה</TableHead>
                  <TableHead className="text-xs font-bold text-muted-foreground">שם</TableHead>
                  <TableHead className="text-xs font-bold text-muted-foreground">סוג</TableHead>
                  <TableHead className="text-xs font-bold text-muted-foreground">מידה</TableHead>
                  <TableHead className="text-xs font-bold text-muted-foreground">פרטים 1</TableHead>
                  <TableHead className="text-xs font-bold text-muted-foreground">פרטים 2</TableHead>
                  <TableHead className="text-xs font-bold text-muted-foreground">מלאי</TableHead>
                  <TableHead className="text-xs font-bold text-muted-foreground">פעולות</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map(({ product: p, variant: v, rowKey, isFirst }) => {
                  const supplier = suppliers.find(s => s.id === p.supplierId);
                  const badge = v ? stockBadge(v.currentStock) : null;
                  const isExpanded = expandedRows.has(rowKey);

                  return (
                    <>
                      <TableRow
                        key={rowKey}
                        className="group text-sm"
                      >
                        {/* Expand toggle */}
                        <TableCell className="py-2 px-2 w-8">
                          {v && (
                            <button
                              onClick={() => toggleExpand(rowKey)}
                              className="w-6 h-6 flex items-center justify-center rounded text-muted-foreground hover:bg-muted transition-smooth"
                            >
                              {isExpanded
                                ? <ChevronDown size={13} />
                                : <ChevronLeft size={13} />
                              }
                            </button>
                          )}
                        </TableCell>

                        <TableCell className="py-2 font-mono text-xs font-bold text-primary">
                          {p.barcode || <span className="text-muted-foreground">—</span>}
                        </TableCell>

                        <TableCell className="py-2">
                          {p.category
                            ? <Badge className="bg-primary/10 text-primary border-0 text-xs">{p.category}</Badge>
                            : <span className="text-muted-foreground text-xs">—</span>
                          }
                        </TableCell>

                        <TableCell className="py-2 text-sm">
                          {supplier?.name || <span className="text-muted-foreground">—</span>}
                        </TableCell>

                        <TableCell className="py-2 text-sm">
                          {p.company || <span className="text-muted-foreground">—</span>}
                        </TableCell>

                        <TableCell className="py-2 font-bold text-primary text-sm">{p.name}</TableCell>

                        <TableCell className="py-2 text-sm">
                          {v?.sizeType || <span className="text-muted-foreground">—</span>}
                        </TableCell>

                        <TableCell className="py-2 text-sm">
                          {v?.size || <span className="text-muted-foreground">—</span>}
                        </TableCell>

                        <TableCell className="py-2 text-sm">
                          {v?.details1 || <span className="text-muted-foreground">—</span>}
                        </TableCell>

                        <TableCell className="py-2 text-sm">
                          {v?.details2 || <span className="text-muted-foreground">—</span>}
                        </TableCell>

                        <TableCell className="py-2">
                          {badge
                            ? (
                              <span className={cn('inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border', badge.cls)}>
                                {badge.label}
                              </span>
                            )
                            : <span className="text-muted-foreground text-xs">—</span>
                          }
                        </TableCell>

                        <TableCell className="py-2">
                          <div className="flex items-center gap-1">
                            {isFirst && (
                              <button
                                title="הוסף וריאנט"
                                onClick={() => setVariantDlg({ open: true, productId: p.id })}
                                className="w-7 h-7 flex items-center justify-center rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-smooth"
                              >
                                <Plus size={13} />
                              </button>
                            )}
                            {v && (
                              <button
                                title="הספקה"
                                onClick={() => setSupplyDlg({ open: true, productId: p.id, variantId: v.id })}
                                className="w-7 h-7 flex items-center justify-center rounded-lg bg-green-50 text-green-600 hover:bg-green-100 transition-smooth"
                              >
                                <PackagePlus size={13} />
                              </button>
                            )}
                            <button
                              title="ערוך"
                              onClick={() => setProductDlg({ open: true, edit: p })}
                              className="w-7 h-7 flex items-center justify-center rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-smooth"
                            >
                              <Pencil size={13} />
                            </button>
                            {v ? (
                              <button
                                title="מחק וריאנט"
                                onClick={() => { if (window.confirm('למחוק וריאנט זה?')) deleteVariant(p.id, v.id); }}
                                className="w-7 h-7 flex items-center justify-center rounded-lg bg-destructive/10 text-destructive hover:bg-destructive/20 transition-smooth"
                              >
                                <Trash2 size={13} />
                              </button>
                            ) : (
                              <button
                                title="מחק מוצר"
                                onClick={() => { if (window.confirm('למחוק מוצר זה?')) deleteProduct(p.id); }}
                                className="w-7 h-7 flex items-center justify-center rounded-lg bg-destructive/10 text-destructive hover:bg-destructive/20 transition-smooth"
                              >
                                <Trash2 size={13} />
                              </button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>

                      {/* Expanded supply history */}
                      {isExpanded && v && (
                        <TableRow key={`${rowKey}__expanded`}>
                          <TableCell colSpan={12} className="bg-blue-50/40 px-6 py-4">
                            <div className="space-y-4">

                              {/* ── Info boxes ── */}
                              <div className="grid grid-cols-5 gap-3">
                                <div className="bg-white rounded-xl border p-3 text-center shadow-sm">
                                  <div className="text-xs text-muted-foreground font-semibold mb-1">מחיר ישיבה</div>
                                  <div className="text-lg font-black text-primary">₪{v.yeshivaPrice.toFixed(2)}</div>
                                </div>
                                <div className="bg-white rounded-xl border p-3 text-center shadow-sm">
                                  <div className="text-xs text-muted-foreground font-semibold mb-1">מחיר חיצוני</div>
                                  <div className="text-lg font-black text-blue-600">₪{v.externalPrice.toFixed(2)}</div>
                                </div>
                                <div className="bg-white rounded-xl border p-3 text-center shadow-sm">
                                  <div className="text-xs text-muted-foreground font-semibold mb-1">מחיר עלות</div>
                                  <div className="text-lg font-black text-orange-600">₪{v.costPrice.toFixed(2)}</div>
                                </div>
                                <div className="bg-white rounded-xl border p-3 text-center shadow-sm">
                                  <div className="text-xs text-muted-foreground font-semibold mb-1">מלאי נוכחי</div>
                                  <div className="text-lg font-black text-green-600">{v.currentStock}</div>
                                </div>
                                <div className="bg-white rounded-xl border p-3 text-center shadow-sm">
                                  <div className="text-xs text-muted-foreground font-semibold mb-1">נמכר סה"כ</div>
                                  <div className="text-lg font-black text-purple-600">{v.totalSold}</div>
                                </div>
                              </div>

                              {/* ── Supply history ── */}
                              <div>
                                <div className="text-xs font-bold text-muted-foreground mb-2">📦 היסטוריית הספקות</div>
                                <SupplyHistory supplies={v.supplies} />
                              </div>

                              {/* ── Price history ── */}
                              {v.priceHistory.length > 0 && (
                                <div>
                                  <div className="text-xs font-bold text-muted-foreground mb-2">💰 היסטוריית מחירים</div>
                                  <PriceHistoryTable priceHistory={v.priceHistory} />
                                </div>
                              )}

                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </>
                  );
                })}
              </TableBody>
            </Table>
          )
        )}

        {/* ── Category View ── */}
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
                  <CategoryCard
                    key={cat}
                    cat={cat}
                    count={products.filter(p => p.category === cat).length}
                    onClick={() => { setView('table'); setSearch(cat); }}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </Card>

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
