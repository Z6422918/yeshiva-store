import { useState, useRef } from 'react';
import { useStore } from '../../../store/useStore';
import { ChevronLeft, ChevronDown, Barcode, ScanLine } from 'lucide-react';
import type { Product, ProductVariant, Supply, PriceHistoryEntry, Supplier } from '../../../types';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../ui/dialog';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Button } from '../../ui/button';

// ─── Exact reference colors ────────────────────────────────────────────────────
const NAVY   = '#1e3166';
const INDIGO = '#5c6bc0';
const BORDER = '#eaecf5';
const BORDER2 = '#e0e4f0';
const ROW_BORDER = '#f4f6fb';
const TH_COLOR = '#9fa8da';
const THEAD_BG = '#f8f9fd';
const HOVER_BG = '#fafbff';
const EXP_BG  = '#f0f4ff';

// ─── Category badge: reference exact colors ────────────────────────────────────
const CAT_STYLES: Record<string, { background: string; color: string }> = {
  'ארזו':        { background: '#eef0fb', color: '#1e3166' },
  'מוצרי חלב':  { background: '#e8f5e9', color: '#2e7d32' },
  'לחם ומאפים': { background: '#fff3e0', color: '#e65100' },
  'שתייה':      { background: '#f3e5f5', color: '#6a1b9a' },
  'חטיפים':     { background: '#fff3e0', color: '#e65100' },
  'קפואים':     { background: '#f0f2f8', color: '#666666' },
};
const defaultCatStyle = { background: '#eef0fb', color: '#1e3166' };
const catStyle = (cat: string) => CAT_STYLES[cat] ?? defaultCatStyle;

const badgeBase: React.CSSProperties = {
  display: 'inline-flex', alignItems: 'center',
  padding: '3px 10px', borderRadius: 20,
  fontSize: 11, fontWeight: 700,
};

// ─── Stock badge — circular number pill ────────────────────────────────────────
function StockBadge({ stock }: { stock: number }) {
  const base: React.CSSProperties = {
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    minWidth: 28, height: 28, borderRadius: 99,
    fontSize: 12, fontWeight: 800, color: '#fff',
    padding: '0 7px', letterSpacing: 0,
  };
  if (stock <= 0)
    return <span style={{ ...base, background: '#e53935' }}>{stock}</span>;
  return <span style={{ ...base, background: NAVY }}>{stock}</span>;
}

// ─── Icon button ───────────────────────────────────────────────────────────────
const iconBtn = (bg: string, color: string, hoverBg: string): React.CSSProperties => ({
  width: 30, height: 30, borderRadius: 9, border: 'none', cursor: 'pointer',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  fontSize: 15, background: bg, color,
  transition: 'background .2s',
});

// ─── Btn styles ────────────────────────────────────────────────────────────────
const btnNavy: React.CSSProperties = {
  display: 'inline-flex', alignItems: 'center', gap: 7,
  padding: '10px 18px', borderRadius: 12, border: 'none',
  fontSize: 13, fontWeight: 700, cursor: 'pointer',
  background: NAVY, color: '#fff',
  boxShadow: '0 4px 12px rgba(30,49,102,0.25)',
  fontFamily: 'inherit', whiteSpace: 'nowrap',
};
const btnLight: React.CSSProperties = {
  display: 'inline-flex', alignItems: 'center', gap: 7,
  padding: '10px 18px', borderRadius: 12,
  border: '1.5px solid #d5d9ef',
  fontSize: 13, fontWeight: 700, cursor: 'pointer',
  background: '#fff', color: INDIGO,
  fontFamily: 'inherit', whiteSpace: 'nowrap',
};

// ─── Add/Edit Product Dialog ───────────────────────────────────────────────────
function ProductDialog({ open, onClose, editProduct, onAdded }: {
  open: boolean; onClose: () => void; editProduct?: Product; onAdded?: (id: string) => void;
}) {
  const { suppliers, categories: storedCats, products, addProduct, updateProduct } = useStore();
  const allCats = [...new Set([...storedCats, ...products.map(p => p.category).filter(Boolean)])].sort();
  const barcodeRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState({
    name: editProduct?.name ?? '', supplierId: editProduct?.supplierId ?? '',
    category: editProduct?.category ?? '', barcode: editProduct?.barcode ?? '',
    company: editProduct?.company ?? '', isActive: editProduct?.isActive ?? true,
  });
  const [newCatInput, setNewCatInput] = useState('');

  const handleSave = () => {
    if (!form.name.trim()) return;
    const catVal = form.category === '__new__' ? newCatInput.trim() : form.category;
    const finalForm = { ...form, category: catVal };
    if (editProduct) { updateProduct(editProduct.id, finalForm); onClose(); }
    else { const id = addProduct({ ...finalForm, variants: [] }); onAdded?.(id); onClose(); }
  };

  // ── shared input / select styles ─────────────────────────────────────────────
  const inp: React.CSSProperties = {
    width: '100%', height: 38, border: '1.5px solid #d5d9ef', borderRadius: 10,
    padding: '0 12px', fontSize: 13, fontFamily: 'inherit', outline: 'none',
    background: '#fff', color: '#333', boxSizing: 'border-box',
    transition: 'border-color .15s',
  };
  const sel: React.CSSProperties = {
    ...inp, appearance: 'none', paddingLeft: 28, cursor: 'pointer',
  };
  const lbl: React.CSSProperties = {
    display: 'block', fontSize: 12, fontWeight: 700, color: '#9fa8da', marginBottom: 6,
  };

  const SelectWrap = ({ children }: { children: React.ReactNode }) => (
    <div style={{ position: 'relative' }}>
      {children}
      <ChevronDown size={14} style={{ position: 'absolute', left: 9, top: '50%', transform: 'translateY(-50%)', color: '#9fa8da', pointerEvents: 'none' }} />
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent dir="rtl" style={{ maxWidth: 460 }}>
        <DialogHeader>
          <DialogTitle style={{ fontSize: 17, fontWeight: 900, color: NAVY }}>
            {editProduct ? 'עריכת מוצר' : 'מוצר חדש'}
          </DialogTitle>
        </DialogHeader>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: '4px 0' }}>

          {/* ── Barcode: full width ── */}
          <div>
            <label style={lbl}>ברקוד</label>
            <div style={{ display: 'flex', gap: 8 }}>
              {/* Input with icon inside */}
              <div style={{ flex: 1, position: 'relative' }}>
                <Barcode size={16} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', color: '#9fa8da', pointerEvents: 'none' }} />
                <input
                  ref={barcodeRef}
                  value={form.barcode}
                  onChange={e => setForm(p => ({ ...p, barcode: e.target.value }))}
                  placeholder="סרוק או הקלד ברקוד..."
                  style={{ ...inp, paddingRight: 34 }}
                  onFocus={e => (e.currentTarget.style.borderColor = NAVY)}
                  onBlur={e => (e.currentTarget.style.borderColor = '#d5d9ef')}
                />
              </div>
              {/* Scan button */}
              <button
                type="button"
                onClick={() => barcodeRef.current?.focus()}
                style={{
                  display: 'flex', alignItems: 'center', gap: 5,
                  padding: '0 14px', height: 38, borderRadius: 10,
                  border: '1.5px solid #d5d9ef', background: '#fff',
                  color: INDIGO, fontSize: 12, fontWeight: 700,
                  cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap',
                  flexShrink: 0,
                }}
              >
                <ScanLine size={14} />
                סרוק
              </button>
            </div>
          </div>

          {/* ── Row 2: ספק | חברה ── */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={lbl}>ספק</label>
              <SelectWrap>
                <select value={form.supplierId} onChange={e => setForm(p => ({ ...p, supplierId: e.target.value }))} style={sel}>
                  <option value="">ללא ספק</option>
                  {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </SelectWrap>
            </div>
            <div>
              <label style={lbl}>חברה</label>
              <input value={form.company} onChange={e => setForm(p => ({ ...p, company: e.target.value }))} style={inp}
                onFocus={e => (e.currentTarget.style.borderColor = NAVY)}
                onBlur={e => (e.currentTarget.style.borderColor = '#d5d9ef')} />
            </div>
          </div>

          {/* ── Row 3: שם מוצר | קטגוריה ── */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={lbl}>שם מוצר</label>
              <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} style={inp}
                onFocus={e => (e.currentTarget.style.borderColor = NAVY)}
                onBlur={e => (e.currentTarget.style.borderColor = '#d5d9ef')} />
            </div>
            <div>
              <label style={lbl}>קטגוריה</label>
              <SelectWrap>
                <select value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))} style={sel}>
                  <option value="">ללא קטגוריה</option>
                  {allCats.map(c => <option key={c} value={c}>{c}</option>)}
                  <option value="__new__">+ קטגוריה חדשה...</option>
                </select>
              </SelectWrap>
            </div>
          </div>

          {/* New category inline input */}
          {form.category === '__new__' && (
            <div>
              <label style={lbl}>שם קטגוריה חדשה</label>
              <input
                autoFocus
                value={newCatInput}
                onChange={e => setNewCatInput(e.target.value)}
                placeholder="הקלד שם קטגוריה..."
                style={inp}
                onFocus={e => (e.currentTarget.style.borderColor = NAVY)}
                onBlur={e => (e.currentTarget.style.borderColor = '#d5d9ef')}
              />
            </div>
          )}

          {/* Note */}
          {!editProduct && (
            <p style={{ fontSize: 11, color: INDIGO, textAlign: 'center', margin: 0, lineHeight: 1.5 }}>
              לאחר שמירה תיפתח חלונית להוספת הסוג הראשוני.<br />
              ביטול בשלב זה ימחק את המוצר
            </p>
          )}

        </div>

        <DialogFooter style={{ gap: 8 }}>
          <button
            onClick={onClose}
            style={{
              padding: '9px 20px', borderRadius: 10, border: '1.5px solid #d5d9ef',
              background: '#fff', color: '#555', fontSize: 13, fontWeight: 700,
              cursor: 'pointer', fontFamily: 'inherit',
            }}
          >ביטול</button>
          <button
            onClick={handleSave}
            style={{
              padding: '9px 20px', borderRadius: 10, border: 'none',
              background: NAVY, color: '#fff', fontSize: 13, fontWeight: 700,
              cursor: 'pointer', fontFamily: 'inherit',
              boxShadow: '0 4px 12px rgba(30,49,102,0.25)',
            }}
          >{editProduct ? 'שמור שינויים' : 'שמור'}</button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Add/Edit Variant Dialog ───────────────────────────────────────────────────
function VariantDialog({ open, onClose, productId, editVariant }: {
  open: boolean; onClose: () => void; productId: string; editVariant?: ProductVariant;
}) {
  const { addVariant, updateVariant } = useStore();
  const [form, setForm] = useState({
    sizeType: editVariant?.sizeType ?? '', size: editVariant?.size ?? '',
    details1: editVariant?.details1 ?? '', details2: editVariant?.details2 ?? '',
    yeshivaPrice: editVariant?.yeshivaPrice ?? 0,
    externalPrice: editVariant?.externalPrice ?? 0,
    costPrice: editVariant?.costPrice ?? 0,
  });

  const handleSave = () => {
    if (editVariant) updateVariant(productId, editVariant.id, form);
    else addVariant(productId, form);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent dir="rtl">
        <DialogHeader><DialogTitle>{editVariant ? 'עריכת וריאנט' : 'הוספת וריאנט'}</DialogTitle></DialogHeader>
        <div className="grid grid-cols-2 gap-3">
          {[['סוג','sizeType'],['מידה','size'],['פרטים 1','details1'],['פרטים 2','details2']].map(([lbl,key]) => (
            <div key={key} className="space-y-1">
              <Label className="text-xs text-muted-foreground">{lbl}</Label>
              <Input value={form[key as keyof typeof form] as string}
                onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))} className="h-9 text-sm" />
            </div>
          ))}
          {[['מחיר ישיבה ₪','yeshivaPrice'],['מחיר חיצוני ₪','externalPrice'],['מחיר עלות ₪','costPrice']].map(([lbl,key]) => (
            <div key={key} className="space-y-1">
              <Label className="text-xs text-muted-foreground">{lbl}</Label>
              <Input type="number" min={0} value={form[key as keyof typeof form] as number}
                onChange={e => setForm(p => ({ ...p, [key]: Number(e.target.value) }))} className="h-9 text-sm" />
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
function SupplyDialog({ open, onClose, productId, variantId }: {
  open: boolean; onClose: () => void; productId: string; variantId: string;
}) {
  const { addSupply } = useStore();
  const [form, setForm] = useState({ date: new Date().toISOString().split('T')[0], quantity: 1, costPerUnit: 0 });
  const handleSave = () => { if (form.quantity < 1) return; addSupply(productId, variantId, form); onClose(); };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent dir="rtl">
        <DialogHeader><DialogTitle>הספקה חדשה</DialogTitle></DialogHeader>
        <div className="space-y-3">
          {[
            { lbl: 'תאריך', type: 'date',   key: 'date',        val: form.date },
            { lbl: 'כמות',   type: 'number', key: 'quantity',    val: form.quantity },
            { lbl: 'עלות ליחידה ₪', type: 'number', key: 'costPerUnit', val: form.costPerUnit },
          ].map(f => (
            <div key={f.key} className="space-y-1">
              <Label className="text-xs text-muted-foreground">{f.lbl}</Label>
              <Input type={f.type} value={f.val}
                onChange={e => setForm(p => ({ ...p, [f.key]: f.type === 'number' ? Number(e.target.value) : e.target.value }))}
                className="h-9 text-sm" min={f.type === 'number' ? 0 : undefined} />
            </div>
          ))}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>ביטול</Button>
          <Button onClick={handleSave}>הוסף הספקה</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Supplier Dialog ───────────────────────────────────────────────────────────
function SupplierDialog({ open, onClose, editSupplier }: {
  open: boolean; onClose: () => void; editSupplier?: Supplier;
}) {
  const { addSupplier, updateSupplier } = useStore();
  const [form, setForm] = useState({
    name: editSupplier?.name ?? '', type: editSupplier?.type ?? 'purchase' as const,
    contactInfo: editSupplier?.contactInfo ?? '', phone: editSupplier?.phone ?? '',
  });
  const handleSave = () => {
    if (!form.name.trim()) return;
    if (editSupplier) updateSupplier(editSupplier.id, form);
    else addSupplier(form);
    onClose();
  };
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent dir="rtl">
        <DialogHeader><DialogTitle>{editSupplier ? 'עריכת ספק' : 'הוספת ספק'}</DialogTitle></DialogHeader>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1 col-span-2">
            <Label className="text-xs text-muted-foreground">שם ספק</Label>
            <Input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} className="h-9 text-sm" autoFocus />
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">סוג</Label>
            <select value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value as 'purchase' | 'commission' }))}
              className="flex h-9 w-full rounded-lg border border-input bg-background px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-ring">
              <option value="purchase">קניה</option>
              <option value="commission">קומיסיון</option>
            </select>
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">טלפון</Label>
            <Input value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} className="h-9 text-sm" />
          </div>
          <div className="space-y-1 col-span-2">
            <Label className="text-xs text-muted-foreground">פרטי קשר</Label>
            <Input value={form.contactInfo} onChange={e => setForm(p => ({ ...p, contactInfo: e.target.value }))} className="h-9 text-sm" />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>ביטול</Button>
          <Button onClick={handleSave}>{editSupplier ? 'שמור' : 'הוסף ספק'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Suppliers & Categories Dialog ────────────────────────────────────────────
function SuppliersCategoriesDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { suppliers, deleteSupplier, products,
          categories: storedCats, addCategory, renameCategory, deleteCategory } = useStore();

  const [tab, setTab]               = useState<'suppliers' | 'categories'>('suppliers');
  const [supDlg, setSupDlg]         = useState<{ open: boolean; edit?: Supplier }>({ open: false });
  const [newCat, setNewCat]         = useState('');
  const [editCat, setEditCat]       = useState<{ name: string; val: string } | null>(null);

  // All unique categories: stored + from products
  const allCats = [...new Set([...storedCats, ...products.map(p => p.category).filter(Boolean)])].sort();

  const innerTab = (id: 'suppliers' | 'categories', lbl: string) => (
    <button
      key={id}
      onClick={() => setTab(id)}
      style={{
        padding: '7px 18px', borderRadius: 12, border: 'none',
        fontSize: 12, fontWeight: 700, cursor: 'pointer',
        background: tab === id ? NAVY : '#f0f2f8',
        color: tab === id ? '#fff' : TH_COLOR,
        boxShadow: tab === id ? '0 3px 10px rgba(30,49,102,0.25)' : 'none',
        transition: 'all .2s', fontFamily: 'inherit',
      }}
    >{lbl}</button>
  );

  const supBadge = (type: string) => (
    <span style={{ ...badgeBase,
      background: type === 'purchase' ? '#fff3e0' : '#f3e5f5',
      color:      type === 'purchase' ? '#e65100' : '#6a1b9a' }}>
      {type === 'purchase' ? 'קניה' : 'קומיסיון'}
    </span>
  );

  return (
    <>
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent dir="rtl" className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>📁 ספקים וקטגוריות</DialogTitle>
          </DialogHeader>

          {/* Inner tabs */}
          <div style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
            {innerTab('suppliers',  '🏭 ספקים')}
            {innerTab('categories', '🏷️ קטגוריות')}
          </div>

          {/* ── Suppliers ── */}
          {tab === 'suppliers' && (
            <div className="space-y-3">
              <button style={btnNavy} onClick={() => setSupDlg({ open: true })}>+ הוסף ספק</button>
              <div style={{ borderRadius: 14, border: `1px solid ${BORDER}`, overflow: 'hidden' }}>
                {suppliers.length === 0 && (
                  <div style={{ padding: '20px', textAlign: 'center', color: TH_COLOR, fontSize: 13 }}>אין ספקים</div>
                )}
                {suppliers.map((s, i) => (
                  <div key={s.id} style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '12px 16px',
                    borderBottom: i < suppliers.length - 1 ? `1px solid ${ROW_BORDER}` : 'none',
                    background: '#f8f9fd',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      {supBadge(s.type)}
                      <div>
                        <div style={{ fontWeight: 800, color: NAVY, fontSize: 13 }}>{s.name}</div>
                        {s.phone && <div style={{ fontSize: 11, color: TH_COLOR, marginTop: 2 }}>{s.phone}</div>}
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button style={iconBtn('#eef0fb', INDIGO, '#d5d9ef')} onClick={() => setSupDlg({ open: true, edit: s })}>✏️</button>
                      <button style={iconBtn('#ffebee', '#e57373', '#ffcdd2')}
                        onClick={() => { if (window.confirm(`למחוק את ${s.name}?`)) deleteSupplier(s.id); }}>🗑</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── Categories ── */}
          {tab === 'categories' && (
            <div className="space-y-3">
              <div style={{ display: 'flex', gap: 8 }}>
                <input
                  value={newCat}
                  onChange={e => setNewCat(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter' && newCat.trim()) { addCategory(newCat.trim()); setNewCat(''); } }}
                  placeholder="שם קטגוריה חדשה..."
                  style={{ flex: 1, border: `1.5px solid ${BORDER2}`, borderRadius: 10, padding: '8px 13px', fontSize: 13, outline: 'none', fontFamily: 'inherit' }}
                />
                <button style={btnNavy} onClick={() => { if (newCat.trim()) { addCategory(newCat.trim()); setNewCat(''); } }}>+ הוסף</button>
              </div>
              <div style={{ borderRadius: 14, border: `1px solid ${BORDER}`, overflow: 'hidden' }}>
                {allCats.length === 0 && (
                  <div style={{ padding: '20px', textAlign: 'center', color: TH_COLOR, fontSize: 13 }}>אין קטגוריות</div>
                )}
                {allCats.map((cat, i) => (
                  <div key={cat} style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '10px 16px',
                    borderBottom: i < allCats.length - 1 ? `1px solid ${ROW_BORDER}` : 'none',
                    background: '#f8f9fd',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{ ...badgeBase, ...catStyle(cat) }}>{cat}</span>
                      <span style={{ fontSize: 11, color: TH_COLOR }}>
                        {products.filter(p => p.category === cat).length} מוצרים
                      </span>
                    </div>
                    {editCat?.name === cat ? (
                      <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                        <input
                          value={editCat.val}
                          onChange={e => setEditCat(ec => ec ? { ...ec, val: e.target.value } : null)}
                          onKeyDown={e => {
                            if (e.key === 'Enter' && editCat.val.trim()) { renameCategory(cat, editCat.val); setEditCat(null); }
                            if (e.key === 'Escape') setEditCat(null);
                          }}
                          autoFocus
                          style={{ border: `1.5px solid ${BORDER2}`, borderRadius: 8, padding: '4px 10px', fontSize: 12, width: 120, fontFamily: 'inherit' }}
                        />
                        <button style={iconBtn('#e8f5e9', '#2e7d32', '#c8e6c9')}
                          onClick={() => { if (editCat.val.trim()) { renameCategory(cat, editCat.val); setEditCat(null); } }}>✓</button>
                        <button style={iconBtn('#ffebee', '#e57373', '#ffcdd2')} onClick={() => setEditCat(null)}>✕</button>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button style={iconBtn('#eef0fb', INDIGO, '#d5d9ef')}
                          onClick={() => setEditCat({ name: cat, val: cat })}>✏️</button>
                        <button style={iconBtn('#ffebee', '#e57373', '#ffcdd2')}
                          onClick={() => { if (window.confirm(`למחוק קטגוריה "${cat}"?`)) deleteCategory(cat); }}>🗑</button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={onClose}>סגור</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <SupplierDialog
        open={supDlg.open}
        onClose={() => setSupDlg({ open: false })}
        editSupplier={supDlg.edit}
      />
    </>
  );
}

// ─── Supply History table ──────────────────────────────────────────────────────
function SupplyHistoryTable({ supplies }: { supplies: Supply[] }) {
  if (supplies.length === 0)
    return <p style={{ fontSize: 12, color: TH_COLOR, textAlign: 'center', padding: '8px 0' }}>אין היסטוריית הספקות</p>;
  return (
    <div style={{ borderRadius: 10, border: `1px solid ${BORDER}`, overflow: 'hidden' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
        <thead>
          <tr style={{ background: THEAD_BG }}>
            {['תאריך','כמות','עלות ליחידה','סה"כ'].map(h => (
              <th key={h} style={{ textAlign: 'right', padding: '8px 12px', fontWeight: 800, color: TH_COLOR, borderBottom: `1px solid ${BORDER}` }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {[...supplies].reverse().map((s, i) => (
            <tr key={s.id} style={{ borderBottom: i < supplies.length - 1 ? `1px solid ${ROW_BORDER}` : 'none' }}>
              <td style={{ padding: '8px 12px' }}>{s.date}</td>
              <td style={{ padding: '8px 12px', fontWeight: 700 }}>{s.quantity}</td>
              <td style={{ padding: '8px 12px' }}>₪{s.costPerUnit.toFixed(2)}</td>
              <td style={{ padding: '8px 12px', fontWeight: 700, color: NAVY }}>₪{(s.quantity * s.costPerUnit).toFixed(2)}</td>
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
  const headers = ['מתאריך','עד תאריך','מחיר ישיבה','מחיר חיצוני','עלות','נמכרו','הכנסה','רווח'];
  return (
    <div style={{ borderRadius: 10, border: `1px solid ${BORDER}`, overflow: 'hidden' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
        <thead>
          <tr style={{ background: THEAD_BG }}>
            {headers.map(h => (
              <th key={h} style={{ textAlign: 'right', padding: '8px 12px', fontWeight: 800, color: TH_COLOR, borderBottom: `1px solid ${BORDER}` }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {[...priceHistory].reverse().map((h, i) => (
            <tr key={h.id} style={{ borderBottom: i < priceHistory.length - 1 ? `1px solid ${ROW_BORDER}` : 'none' }}>
              <td style={{ padding: '8px 12px' }}>{h.fromDate}</td>
              <td style={{ padding: '8px 12px' }}>{h.toDate ?? <span style={{ color: '#2e7d32', fontWeight: 600 }}>נוכחי</span>}</td>
              <td style={{ padding: '8px 12px', fontWeight: 600, color: NAVY }}>₪{h.yeshivaPrice.toFixed(2)}</td>
              <td style={{ padding: '8px 12px' }}>₪{h.externalPrice.toFixed(2)}</td>
              <td style={{ padding: '8px 12px' }}>₪{h.costPrice.toFixed(2)}</td>
              <td style={{ padding: '8px 12px', fontWeight: 700 }}>{h.quantitySold}</td>
              <td style={{ padding: '8px 12px', fontWeight: 600, color: '#1565c0' }}>₪{h.totalRevenue.toFixed(2)}</td>
              <td style={{ padding: '8px 12px', fontWeight: 600, color: '#2e7d32' }}>₪{h.totalProfit.toFixed(2)}</td>
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
  const [supCatOpen,   setSupCatOpen]   = useState(false);

  // Dialogs
  const [productDlg, setProductDlg] = useState<{ open: boolean; edit?: Product }>({ open: false });
  const [variantDlg, setVariantDlg] = useState<{ open: boolean; productId: string; edit?: ProductVariant } | null>(null);
  const [supplyDlg,  setSupplyDlg]  = useState<{ open: boolean; productId: string; variantId: string } | null>(null);

  const filtered = products.filter(p => {
    const q = search.toLowerCase();
    if (!q) return true;
    const sup = suppliers.find(s => s.id === p.supplierId)?.name ?? '';
    return p.name.includes(q) || p.barcode.includes(q) || p.company.toLowerCase().includes(q)
      || p.category.toLowerCase().includes(q) || sup.toLowerCase().includes(q);
  });

  type FlatRow = { product: Product; variant: ProductVariant | null; rowKey: string; isFirst: boolean };
  const rows: FlatRow[] = filtered.flatMap((p): FlatRow[] =>
    p.variants.length === 0
      ? [{ product: p, variant: null, rowKey: `${p.id}__none`, isFirst: true }]
      : p.variants.map((v, idx) => ({ product: p, variant: v, rowKey: `${p.id}__${v.id}`, isFirst: idx === 0 }))
  );

  const allCats = [...new Set(products.map(p => p.category).filter(Boolean))];

  const toggleExpand = (key: string) =>
    setExpandedRows(prev => { const n = new Set(prev); n.has(key) ? n.delete(key) : n.add(key); return n; });

  const thStyle: React.CSSProperties = {
    textAlign: 'right', padding: '12px 14px',
    fontSize: 11, fontWeight: 800, color: TH_COLOR,
    borderBottom: `1px solid ${BORDER}`, whiteSpace: 'nowrap',
  };
  const tdStyle: React.CSSProperties = {
    padding: '12px 14px', fontSize: 13, color: '#333',
    fontWeight: 500, verticalAlign: 'middle',
  };

  return (
    <div dir="rtl">

      {/* ── Action bar ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18, flexWrap: 'wrap' }}>
        <button style={btnNavy} onClick={() => setProductDlg({ open: true })}>+ הוסף מוצר</button>
        <button style={btnLight} onClick={() => setSupCatOpen(true)}>📁 ספקים וקטגוריות</button>
        <button style={btnLight}>📄 ייבוא / ייצוא</button>
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="🔍  חיפוש לפי ברקוד, שם, ספק, סוג, מידה..."
          style={{
            marginRight: 'auto', background: '#fff',
            border: `1.5px solid ${BORDER2}`, borderRadius: 12,
            padding: '10px 16px', fontSize: 13, color: '#333',
            outline: 'none', width: 260, textAlign: 'right',
            fontFamily: 'inherit',
          }}
        />
      </div>

      {/* ── Main Card ── */}
      <div style={{ background: '#fff', borderRadius: 20, boxShadow: '0 2px 14px rgba(26,35,126,0.07)', border: `1px solid ${BORDER}` }}>
        <div style={{ borderRadius: 20, overflow: 'hidden' }}>

          {/* Sub-tabs: קטגוריות | טבלה */}
          <div style={{ display: 'flex', gap: 0, padding: '0 20px', borderBottom: `2px solid ${BORDER}` }}>
            {([
              { id: 'cat'   as const, label: 'תצוגת קטגוריות' },
              { id: 'table' as const, label: 'טבלה מלאה' },
            ]).map(t => (
              <button key={t.id} onClick={() => setView(t.id)} style={{
                padding: '13px 22px', fontSize: 13, fontWeight: 700,
                color: view === t.id ? NAVY : '#aab',
                border: 'none', background: 'none', cursor: 'pointer',
                borderBottom: `3px solid ${view === t.id ? NAVY : 'transparent'}`,
                marginBottom: -2, transition: 'all .2s', fontFamily: 'inherit',
              }}>{t.label}</button>
            ))}
          </div>

          {/* ══ TABLE VIEW ══ */}
          {view === 'table' && (
            rows.length === 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 0', color: TH_COLOR, gap: 12 }}>
                <span style={{ fontSize: 40 }}>📦</span>
                <p style={{ fontSize: 13, fontWeight: 600 }}>אין מוצרים להצגה</p>
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: THEAD_BG }}>
                      <th style={{ ...thStyle, width: 36 }} />
                      {['ברקוד','קטגוריה','ספק','חברה','שם','סוג','מידה','פרטים 1','פרטים 2','מלאי','פעולות'].map(h => (
                        <th key={h} style={thStyle}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map(({ product: p, variant: v, rowKey, isFirst }, rowIdx) => {
                      const supplier   = suppliers.find(s => s.id === p.supplierId);
                      const isExpanded = expandedRows.has(rowKey);
                      const isLast     = rowIdx === rows.length - 1;

                      return (
                        <>
                          <tr
                            key={rowKey}
                            style={{ borderBottom: isLast && !isExpanded ? 'none' : `1px solid ${ROW_BORDER}` }}
                            onMouseEnter={e => { (e.currentTarget as HTMLTableRowElement).querySelectorAll('td').forEach(td => (td.style.background = HOVER_BG)); }}
                            onMouseLeave={e => { (e.currentTarget as HTMLTableRowElement).querySelectorAll('td').forEach(td => (td.style.background = '')); }}
                          >
                            {/* Expand */}
                            <td style={{ ...tdStyle, width: 36, textAlign: 'center' }}>
                              {v && (
                                <button
                                  onClick={() => toggleExpand(rowKey)}
                                  style={{ width: 24, height: 24, borderRadius: 6, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'transparent', color: TH_COLOR, margin: '0 auto' }}
                                >
                                  {isExpanded ? <ChevronDown size={14} /> : <ChevronLeft size={14} />}
                                </button>
                              )}
                            </td>

                            {/* Barcode */}
                            <td style={tdStyle}>
                              <span style={{ fontFamily: 'monospace', fontWeight: 700, color: INDIGO }}>{p.barcode || <span style={{ color: '#ccc' }}>—</span>}</span>
                            </td>

                            {/* Category */}
                            <td style={tdStyle}>
                              {p.category
                                ? <span style={{ ...badgeBase, ...catStyle(p.category) }}>{p.category}</span>
                                : <span style={{ color: '#ccc' }}>—</span>}
                            </td>

                            {/* Supplier */}
                            <td style={tdStyle}>{supplier?.name || <span style={{ color: '#ccc' }}>—</span>}</td>

                            {/* Company */}
                            <td style={tdStyle}>{p.company || <span style={{ color: '#ccc' }}>—</span>}</td>

                            {/* Name */}
                            <td style={{ ...tdStyle, fontWeight: 800, color: NAVY }}>{p.name}</td>

                            {/* sizeType */}
                            <td style={tdStyle}>{v?.sizeType || <span style={{ color: '#ccc' }}>—</span>}</td>

                            {/* size */}
                            <td style={tdStyle}>{v?.size || <span style={{ color: '#ccc' }}>—</span>}</td>

                            {/* details1 */}
                            <td style={tdStyle}>{v?.details1 || <span style={{ color: '#ccc' }}>—</span>}</td>

                            {/* details2 */}
                            <td style={tdStyle}>{v?.details2 || <span style={{ color: '#ccc' }}>—</span>}</td>

                            {/* Stock */}
                            <td style={tdStyle}>
                              {v ? <StockBadge stock={v.currentStock} /> : <span style={{ color: '#ccc' }}>—</span>}
                            </td>

                            {/* Actions: 🗑 | ✏️ | 📦 | + */}
                            <td style={tdStyle}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                <button
                                  title={v ? 'מחק וריאנט' : 'מחק מוצר'}
                                  onClick={() => {
                                    if (v) { if (window.confirm('למחוק וריאנט זה?'))  deleteVariant(p.id, v.id); }
                                    else   { if (window.confirm('למחוק מוצר זה?'))    deleteProduct(p.id); }
                                  }}
                                  style={iconBtn('#ffebee', '#e57373', '#ffcdd2')}
                                >🗑</button>
                                <button title="ערוך מוצר"
                                  onClick={() => setProductDlg({ open: true, edit: p })}
                                  style={iconBtn('#eef0fb', INDIGO, '#d5d9ef')}>✏️</button>
                                {v && (
                                  <button title="הספקה"
                                    onClick={() => setSupplyDlg({ open: true, productId: p.id, variantId: v.id })}
                                    style={iconBtn('#e8f5e9', '#66bb6a', '#c8e6c9')}>📦</button>
                                )}
                                {isFirst && (
                                  <button title="הוסף וריאנט"
                                    onClick={() => setVariantDlg({ open: true, productId: p.id })}
                                    style={iconBtn('#eef0fb', INDIGO, '#d5d9ef')}>+</button>
                                )}
                              </div>
                            </td>
                          </tr>

                          {/* ── Expanded panel ── */}
                          {isExpanded && v && (
                            <tr key={`${rowKey}__exp`}>
                              <td colSpan={12} style={{ background: EXP_BG, padding: '16px 20px', borderBottom: `1px solid ${BORDER}` }}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

                                  {/* Info boxes */}
                                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 12 }}>
                                    {[
                                      { label: 'מחיר ישיבה',  val: `₪${v.yeshivaPrice.toFixed(2)}`,  color: NAVY },
                                      { label: 'מחיר חיצוני', val: `₪${v.externalPrice.toFixed(2)}`, color: '#1565c0' },
                                      { label: 'מחיר עלות',   val: `₪${v.costPrice.toFixed(2)}`,     color: '#e65100' },
                                      { label: 'מלאי נוכחי',  val: String(v.currentStock),           color: '#2e7d32' },
                                      { label: 'נמכר סה"כ',   val: String(v.totalSold),              color: '#6a1b9a' },
                                    ].map(box => (
                                      <div key={box.label} style={{ background: '#fff', borderRadius: 14, border: `1px solid ${BORDER}`, padding: '12px', textAlign: 'center', boxShadow: '0 1px 6px rgba(26,35,126,0.06)' }}>
                                        <div style={{ fontSize: 11, color: TH_COLOR, fontWeight: 700, marginBottom: 4 }}>{box.label}</div>
                                        <div style={{ fontSize: 18, fontWeight: 900, color: box.color }}>{box.val}</div>
                                      </div>
                                    ))}
                                  </div>

                                  {/* Supply history */}
                                  <div>
                                    <div style={{ fontSize: 11, fontWeight: 800, color: TH_COLOR, marginBottom: 6, letterSpacing: '0.5px' }}>📦 היסטוריית הספקות</div>
                                    <SupplyHistoryTable supplies={v.supplies} />
                                  </div>

                                  {/* Price history */}
                                  {v.priceHistory.length > 0 && (
                                    <div>
                                      <div style={{ fontSize: 11, fontWeight: 800, color: TH_COLOR, marginBottom: 6, letterSpacing: '0.5px' }}>💰 היסטוריית מחירים</div>
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
            <div style={{ padding: 24 }}>
              {allCats.length === 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 0', color: TH_COLOR, gap: 12 }}>
                  <span style={{ fontSize: 40 }}>🏷️</span>
                  <p style={{ fontSize: 13, fontWeight: 600 }}>אין קטגוריות מוגדרות</p>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14 }}>
                  {allCats.map(cat => (
                    <button key={cat}
                      onClick={() => { setView('table'); setSearch(cat); }}
                      style={{ background: '#f0f4ff', borderRadius: 16, padding: '18px', textAlign: 'center', border: '1.5px solid #c5cae9', cursor: 'pointer', transition: 'all .15s', fontFamily: 'inherit' }}>
                      <div style={{ fontSize: 28, marginBottom: 8 }}>🏷️</div>
                      <div style={{ fontWeight: 800, color: NAVY, fontSize: 14 }}>{cat}</div>
                      <div style={{ fontSize: 12, color: TH_COLOR, marginTop: 4 }}>{products.filter(p => p.category === cat).length} מוצרים</div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>
      </div>

      {/* ── Dialogs ── */}
      <ProductDialog
        open={productDlg.open}
        onClose={() => setProductDlg({ open: false })}
        editProduct={productDlg.edit}
        onAdded={(id) => setVariantDlg({ open: true, productId: id })}
      />
      {variantDlg && (
        <VariantDialog open={variantDlg.open} onClose={() => setVariantDlg(null)}
          productId={variantDlg.productId} editVariant={variantDlg.edit} />
      )}
      {supplyDlg && (
        <SupplyDialog open={supplyDlg.open} onClose={() => setSupplyDlg(null)}
          productId={supplyDlg.productId} variantId={supplyDlg.variantId} />
      )}
      <SuppliersCategoriesDialog open={supCatOpen} onClose={() => setSupCatOpen(false)} />

    </div>
  );
}
