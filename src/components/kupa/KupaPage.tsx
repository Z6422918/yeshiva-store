import { useRef, useState } from 'react';
import { useStore } from '../../store/useStore';
import {
  ScanLine, Trash2, Plus, Minus, List, UserCheck, Users, History,
  Banknote, CreditCard, ShieldCheck, ArrowRight, CheckCircle2,
  Folder, Search, KeyRound,
} from 'lucide-react';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '../ui/dialog';
import { cn } from '../../lib/utils';
import type { Product, ProductVariant } from '../../types';

type CustomerType = 'yeshiva' | 'external';

const variantLabel = (desc: string) => desc || 'רגיל';

const formatDate = (iso: string) =>
  new Date(iso).toLocaleString('he-IL', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });

export default function KupaPage() {
  const {
    cart, buyerType, setBuyerType,
    addToCart, updateCartItem, removeFromCart, clearCart,
    products, completeTransaction, transactions,
  } = useStore();

  const [customer, setCustomer] = useState<CustomerType | null>(null);
  const [barcodeInput, setBarcodeInput] = useState('');
  const [showPayment, setShowPayment] = useState(false);
  const [payMethod, setPayMethod] = useState<'cash' | 'credit' | null>(null);
  const [confirming, setConfirming] = useState(false);
  const [browseOpen, setBrowseOpen] = useState(false);
  const [browseQuery, setBrowseQuery] = useState('');
  const [browseCategory, setBrowseCategory] = useState<string | null>(null);
  const [browseProductId, setBrowseProductId] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const UNCATEGORIZED = 'ללא קטגוריה';

  // Price helper
  const priceFor = (v: ProductVariant, cust: CustomerType) =>
    cust === 'yeshiva' ? v.yeshivaPrice : v.externalPrice;

  // Total
  const total = customer
    ? cart.reduce((s, it) => {
        const p = products.find(x => x.id === it.productId);
        const v = p?.variants.find(x => x.id === it.variantId);
        return s + (v ? priceFor(v, customer) : it.unitPrice) * it.quantity;
      }, 0)
    : 0;

  // Categories & products
  const categoryMap = new Map<string, Product[]>();
  for (const p of products.filter(x => x.isActive)) {
    const cat = (p.category && p.category.trim()) || UNCATEGORIZED;
    categoryMap.set(cat, [...(categoryMap.get(cat) ?? []), p]);
  }
  const categoryNames = Array.from(categoryMap.keys()).sort((a, b) => a.localeCompare(b, 'he'));

  const selectedBrowseProduct = browseProductId
    ? products.find(p => p.id === browseProductId) || null
    : null;

  // Browse filtering
  const matchQuery = (p: Product, q: string) => {
    if (!q) return true;
    const fields = [p.barcode, p.name, p.company, p.category ?? ''];
    return fields.some(f => f.toLowerCase().includes(q));
  };

  const filteredCategories = categoryNames.filter(c => {
    const q = browseQuery.trim().toLowerCase();
    if (!q) return (categoryMap.get(c) ?? []).length > 0;
    if (c.toLowerCase().includes(q)) return true;
    return (categoryMap.get(c) ?? []).some(p => matchQuery(p, q));
  });

  const productsInCategory = browseCategory
    ? (categoryMap.get(browseCategory) ?? []).filter(p => matchQuery(p, browseQuery.trim().toLowerCase()))
    : [];

  const filteredVariants = selectedBrowseProduct?.variants ?? [];

  // Add product to cart
  const addVariant = (product: Product, variant: ProductVariant) => {
    const cust = customer ?? 'yeshiva';
    const price = priceFor(variant, cust);
    const existing = cart.find(i => i.variantId === variant.id);
    if (existing) {
      updateCartItem(variant.id, existing.quantity + 1);
    } else {
      addToCart({
        productId: product.id,
        productName: product.name,
        variantId: variant.id,
        variantDescription: [variant.sizeType, variant.details1, variant.details2].filter(Boolean).join(' • '),
        quantity: 1,
        unitPrice: price,
        totalPrice: price,
      });
    }
  };

  const scanTimer = useRef<number | null>(null);

  const submitBarcode = (raw: string) => {
    const code = raw.trim();
    if (!code) return;
    const matches: { product: Product; variant: ProductVariant }[] = [];
    for (const p of products.filter(x => x.isActive)) {
      if (p.barcode === code) {
        for (const v of p.variants) matches.push({ product: p, variant: v });
      }
    }
    if (matches.length === 0) {
      alert('מוצר לא נמצא במערכת');
    } else {
      addVariant(matches[0].product, matches[0].variant);
    }
    setBarcodeInput('');
  };

  const handleScan = (e: React.FormEvent) => {
    e.preventDefault();
    submitBarcode(barcodeInput);
  };

  const onBarcodeChange = (val: string) => {
    setBarcodeInput(val);
    if (scanTimer.current) window.clearTimeout(scanTimer.current);
    if (val.trim().length >= 6) {
      scanTimer.current = window.setTimeout(() => submitBarcode(val), 120);
    }
  };

  const handleSetCustomer = (type: CustomerType) => {
    setCustomer(type);
    setBuyerType(type === 'yeshiva' ? 'yeshiva' : 'external');
  };

  const resetSale = () => {
    clearCart();
    setCustomer(null);
    setShowPayment(false);
    setPayMethod(null);
    setConfirming(false);
  };

  const goBackPayment = () => {
    if (confirming) { setConfirming(false); setPayMethod(null); return; }
    setShowPayment(false); setPayMethod(null);
  };

  const handleCashConfirm = () => {
    completeTransaction('cash');
    resetSale();
  };

  const handleCreditConfirm = () => {
    completeTransaction('credit');
    resetSale();
  };

  const closeBrowse = () => {
    setBrowseOpen(false);
    setBrowseCategory(null);
    setBrowseProductId(null);
    setBrowseQuery('');
  };

  const recentTx = [...(transactions || [])].reverse().slice(0, 20);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-4 flex-1 min-h-0 h-full">

      {/* ═══════════════════════════════════
          LEFT COLUMN: controls + cart
      ═══════════════════════════════════ */}
      <div className="flex flex-col gap-3 min-h-0">

        {/* ── Controls Card ── */}
        <Card className="p-5 shadow-soft shrink-0">
          {/* Row 1: buyer type */}
          <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
            <div className="flex items-center gap-3 flex-wrap">
              {customer ? (
                <>
                  <Badge variant={customer === 'yeshiva' ? 'default' : 'secondary'} className="text-sm py-1 px-3">
                    {customer === 'yeshiva' ? '🏠 בן ישיבה' : '🌍 קונה מבחוץ'}
                  </Badge>
                  <Button variant="outline" size="sm" onClick={() =>
                    handleSetCustomer(customer === 'yeshiva' ? 'external' : 'yeshiva')
                  }>
                    שנה סוג קונה
                  </Button>
                </>
              ) : (
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-semibold text-muted-foreground">בחר סוג קונה:</span>
                  <Button size="sm" variant="default" onClick={() => handleSetCustomer('yeshiva')} className="gap-1.5">
                    <UserCheck className="w-4 h-4" /> בן ישיבה
                  </Button>
                  <Button size="sm" variant="secondary" onClick={() => handleSetCustomer('external')} className="gap-1.5">
                    <Users className="w-4 h-4" /> קונה מבחוץ
                  </Button>
                </div>
              )}
            </div>
            {cart.length > 0 && (
              <Button variant="ghost" size="sm" onClick={resetSale}>איפוס קנייה</Button>
            )}
          </div>

          {/* Row 2: barcode + browse */}
          <form onSubmit={handleScan} className="flex gap-2">
            <div className="relative flex-1">
              <ScanLine className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-primary" />
              <Input
                ref={inputRef}
                value={barcodeInput}
                onChange={e => onBarcodeChange(e.target.value)}
                placeholder="סרוק ברקוד — נוסף אוטומטית"
                className="pr-11 h-12 text-lg font-mono"
                autoFocus
              />
            </div>
            <Button
              type="button"
              size="lg"
              variant="outline"
              onClick={() => { setBrowseOpen(true); setBrowseCategory(null); setBrowseProductId(null); }}
              className="gap-2"
            >
              <List className="w-4 h-4" /> בחר מהרשימה
            </Button>
          </form>
        </Card>

        {/* ── Cart Card ── */}
        <Card className="shadow-soft overflow-hidden flex flex-col flex-1 min-h-0">
          <div className="p-4 border-b bg-secondary/40 shrink-0">
            <h3 className="font-semibold">פריטים בקנייה ({cart.length})</h3>
          </div>

          {cart.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground flex-1 flex flex-col items-center justify-center">
              <ScanLine className="w-12 h-12 mx-auto mb-3 opacity-30" />
              סרוק מוצר כדי להתחיל
            </div>
          ) : (
            <div className="divide-y overflow-y-auto flex-1 min-h-0">
              {cart.map(it => {
                const prod = products.find(p => p.id === it.productId);
                const variant = prod?.variants.find(v => v.id === it.variantId);
                const price = customer && variant ? priceFor(variant, customer) : it.unitPrice;
                return (
                  <div key={it.variantId} className="p-3 flex items-center gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">{it.productName}</div>
                      <div className="text-sm text-muted-foreground truncate">
                        {[variantLabel(it.variantDescription), prod?.company].filter(Boolean).join(' • ')}
                      </div>
                      {customer && (
                        <div className="text-xs text-muted-foreground mt-0.5">
                          ₪{price.toFixed(2)} ליחידה
                          {it.quantity > 1 && <> · סה״כ ₪{(price * it.quantity).toFixed(2)}</>}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        size="icon"
                        variant="outline"
                        className="h-8 w-8"
                        onClick={() => updateCartItem(it.variantId, Math.max(0, it.quantity - 1))}
                      >
                        <Minus className="w-3 h-3" />
                      </Button>
                      <span className="w-8 text-center font-semibold">{it.quantity}</span>
                      <Button
                        size="icon"
                        variant="outline"
                        className="h-8 w-8"
                        onClick={() => updateCartItem(it.variantId, it.quantity + 1)}
                      >
                        <Plus className="w-3 h-3" />
                      </Button>
                    </div>
                    <div className="w-20 text-left font-semibold">
                      {customer ? `₪${(price * it.quantity).toFixed(2)}` : '—'}
                    </div>
                    <Button size="icon" variant="ghost" onClick={() => removeFromCart(it.variantId)}>
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      </div>

      {/* ═══════════════════════════════════
          RIGHT COLUMN: total + history
      ═══════════════════════════════════ */}
      <div className="flex flex-col gap-4 min-h-0">

        {/* ── Total Card (gradient) ── */}
        <Card className="p-6 shadow-elegant gradient-primary text-primary-foreground shrink-0">
          <div className="text-sm opacity-80">סה"כ לתשלום</div>
          <div className="text-5xl font-extrabold my-2">
            {customer ? `₪${total.toFixed(2)}` : '— — —'}
          </div>
          <div className="text-sm opacity-70 mb-6">
            {customer ? `${cart.length} פריטים` : 'בחר סוג קונה כדי לראות מחיר'}
          </div>
          <Button
            size="lg"
            disabled={cart.length === 0 || !customer}
            onClick={() => setShowPayment(true)}
            className="w-full h-14 text-lg gradient-accent text-accent-foreground hover:opacity-90 border-0 shadow-glow"
          >
            {customer ? 'לתשלום' : 'בחר סוג קונה'}
          </Button>
        </Card>

        {/* ── History Card ── */}
        <Card className="shadow-soft overflow-hidden flex flex-col flex-1 min-h-0">
          <div className="w-full flex items-center gap-2 px-4 py-3 bg-secondary/40 border-b shrink-0">
            <History className="w-4 h-4 text-primary" />
            <h3 className="font-semibold">היסטוריית עסקאות</h3>
          </div>
          <div className="overflow-y-auto p-4 flex-1 min-h-0">
            {recentTx.length === 0 ? (
              <div className="text-center text-muted-foreground py-8 text-sm">אין עסקאות עדיין</div>
            ) : (
              <div className="space-y-2">
                {recentTx.map(tx => (
                  <CompactTxCard key={tx.id} tx={tx} />
                ))}
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* ═══════════════════════════════════
          BROWSE DIALOG
      ═══════════════════════════════════ */}
      <Dialog open={browseOpen} onOpenChange={o => { if (!o) closeBrowse(); }}>
        <DialogContent dir="rtl" className="max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {(browseCategory || selectedBrowseProduct) && (
                <button
                  className="inline-flex items-center justify-center rounded-lg h-10 w-10 hover:bg-muted"
                  onClick={() => {
                    if (selectedBrowseProduct) { setBrowseProductId(null); setBrowseQuery(''); }
                    else { setBrowseCategory(null); setBrowseQuery(''); }
                  }}
                >
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
              {selectedBrowseProduct
                ? `בחר סוג — ${selectedBrowseProduct.name}`
                : browseCategory
                  ? `בחר מוצר — ${browseCategory}`
                  : 'בחר מוצר'}
            </DialogTitle>
          </DialogHeader>

          <div className="relative mb-4 shrink-0">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={browseQuery}
              onChange={e => setBrowseQuery(e.target.value)}
              placeholder="חיפוש לפי ברקוד, שם, ספק, חברה, סוג, מידה..."
              className="pr-10"
              autoFocus
            />
          </div>

          <div className="flex-1 min-h-0 overflow-y-auto pr-1">

            {/* Categories */}
            {!browseCategory && !selectedBrowseProduct && (
              <div className="rounded-xl border bg-card shadow-soft p-3 space-y-1">
                {filteredCategories.length === 0 && (
                  <div className="text-center text-muted-foreground py-10">אין תוצאות</div>
                )}
                {filteredCategories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => { setBrowseCategory(cat); setBrowseQuery(''); }}
                    className="w-full flex items-center gap-3 py-3 px-4 rounded-xl hover:bg-muted/40 transition-smooth text-right"
                  >
                    <Folder className="w-5 h-5 text-primary shrink-0" />
                    <span className="font-semibold flex-1">{cat}</span>
                    <Badge variant="outline" className="text-xs">{(categoryMap.get(cat) ?? []).length}</Badge>
                  </button>
                ))}
              </div>
            )}

            {/* Products in category */}
            {browseCategory && !selectedBrowseProduct && (
              <div className="rounded-xl border bg-card shadow-soft p-3 space-y-1">
                {productsInCategory.length === 0 && (
                  <div className="text-center text-muted-foreground py-10">אין מוצרים תואמים</div>
                )}
                {productsInCategory.map(p => (
                  <button
                    key={p.id}
                    onClick={() => {
                      if (p.variants.length === 1) { addVariant(p, p.variants[0]); closeBrowse(); }
                      else { setBrowseProductId(p.id); setBrowseQuery(''); }
                    }}
                    className="w-full flex items-center gap-3 py-3 px-4 rounded-xl hover:bg-muted/40 transition-smooth text-right"
                  >
                    <Folder className="w-5 h-5 text-accent shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold">{p.name}</div>
                      <div className="text-xs text-muted-foreground truncate">
                        {[p.barcode, p.company].filter(Boolean).join(' • ')}
                      </div>
                    </div>
                    <Badge variant="outline" className="text-xs shrink-0">
                      {p.variants.length === 1 ? 'סוג יחיד' : `${p.variants.length} סוגים`}
                    </Badge>
                  </button>
                ))}
              </div>
            )}

            {/* Variants of selected product */}
            {selectedBrowseProduct && (
              <div className="rounded-xl border bg-card shadow-soft p-3 space-y-1">
                {filteredVariants.length === 0 && (
                  <div className="text-center text-muted-foreground py-10">אין סוגים תואמים</div>
                )}
                {filteredVariants.map(v => {
                  const price = customer ? priceFor(v, customer) : v.yeshivaPrice;
                  return (
                    <button
                      key={v.id}
                      onClick={() => { addVariant(selectedBrowseProduct, v); closeBrowse(); }}
                      className="w-full flex items-center gap-3 py-3 px-4 rounded-xl hover:bg-muted/40 transition-smooth text-right group"
                    >
                      <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <Plus className="w-3 h-3 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold group-hover:text-accent">{v.sizeType || 'רגיל'}</div>
                        <div className="text-xs text-muted-foreground truncate">
                          {[v.details1, v.details2].filter(Boolean).join(' • ')}
                        </div>
                      </div>
                      <span className="text-lg font-extrabold text-primary shrink-0">₪{price.toFixed(2)}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* ═══════════════════════════════════
          PAYMENT DIALOG
      ═══════════════════════════════════ */}
      <Dialog open={showPayment} onOpenChange={o => { if (!o) goBackPayment(); }}>
        <DialogContent dir="rtl">
          <DialogHeader>
            <DialogTitle>תשלום</DialogTitle>
          </DialogHeader>

          {/* Step 1: choose method */}
          {!confirming && (
            <div className="space-y-4">
              <div className="rounded-lg border p-3 bg-secondary/30">
                <div className="flex items-center justify-between mb-2">
                  <Badge variant={customer === 'yeshiva' ? 'default' : 'secondary'}>
                    {customer === 'yeshiva' ? '🏠 בן ישיבה' : '🌍 קונה מבחוץ'}
                  </Badge>
                  <button
                    className="text-sm text-muted-foreground hover:text-foreground"
                    onClick={() => handleSetCustomer(customer === 'yeshiva' ? 'external' : 'yeshiva')}
                  >
                    שנה
                  </button>
                </div>
                <div className="divide-y text-sm">
                  {cart.map(it => {
                    const prod = products.find(p => p.id === it.productId);
                    const variant = prod?.variants.find(v => v.id === it.variantId);
                    const price = customer && variant ? priceFor(variant, customer) : it.unitPrice;
                    return (
                      <div key={it.variantId} className="flex justify-between py-1">
                        <span>{it.productName} ({variantLabel(it.variantDescription)}) ×{it.quantity}</span>
                        <span className="font-semibold">₪{(price * it.quantity).toFixed(2)}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
              <div className="text-center py-2">
                <div className="text-sm text-muted-foreground">סכום לתשלום</div>
                <div className="text-4xl font-bold">₪{total.toFixed(2)}</div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => { setPayMethod('cash'); setConfirming(true); }}
                  className="p-5 rounded-xl border-2 hover:border-primary hover:bg-secondary transition-smooth flex flex-col items-center gap-2"
                >
                  <Banknote className="w-9 h-9 text-success" />
                  <div className="font-semibold">מזומן</div>
                </button>
                <button
                  onClick={() => { setPayMethod('credit'); setConfirming(true); }}
                  className="p-5 rounded-xl border-2 hover:border-primary hover:bg-secondary transition-smooth flex flex-col items-center gap-2"
                >
                  <CreditCard className="w-9 h-9 text-primary" />
                  <div className="font-semibold">אשראי</div>
                </button>
              </div>
              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setShowPayment(false)} className="gap-1.5">
                  <ArrowRight className="w-4 h-4" /> חזור לעגלה
                </Button>
              </div>
            </div>
          )}

          {/* Step 2a: Cash confirmation */}
          {confirming && payMethod === 'cash' && (
            <div className="space-y-4 text-center py-4">
              <CheckCircle2 className="w-16 h-16 mx-auto text-success" />
              <div>
                <div className="text-sm text-muted-foreground">אישור תשלום במזומן</div>
                <div className="text-3xl font-bold">₪{total.toFixed(2)}</div>
              </div>
              <p className="text-muted-foreground">האם התקבל התשלום מהקונה?</p>
              <DialogFooter className="sm:justify-center gap-2">
                <Button variant="outline" onClick={goBackPayment}>חזור</Button>
                <Button
                  onClick={handleCashConfirm}
                  className="bg-success hover:bg-success/90 text-success-foreground"
                >
                  אשר תשלום
                </Button>
              </DialogFooter>
            </div>
          )}

          {/* Step 2b: Credit — Nedarim iframe */}
          {confirming && payMethod === 'credit' && (
            <NedarimPaymentFrame
              total={total}
              customer={customer!}
              onCancel={goBackPayment}
              onSuccess={handleCreditConfirm}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ── Compact transaction card for history panel ──
function CompactTxCard({ tx }: { tx: { id: string; date: string; paymentMethod: string; totalAmount: number; items: { productName: string; quantity: number; unitPrice: number }[] } }) {
  const [open, setOpen] = useState(false);
  return (
    <Card className="p-3 shadow-soft">
      <button onClick={() => setOpen(v => !v)} className="w-full flex items-center justify-between gap-2">
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium">{formatDate(tx.date)}</span>
          <Badge variant="secondary" className="gap-1 text-xs">
            {tx.paymentMethod === 'cash' && <><Banknote className="w-3 h-3" />מזומן</>}
            {tx.paymentMethod === 'credit' && <><CreditCard className="w-3 h-3" />אשראי</>}
            {tx.paymentMethod === 'special' && <><ShieldCheck className="w-3 h-3" />מיוחד</>}
          </Badge>
        </div>
        <div className="text-lg font-bold text-primary">₪{tx.totalAmount.toFixed(2)}</div>
      </button>
      {open && (
        <div className="mt-3 pt-3 border-t space-y-1.5">
          {tx.items.map((it, idx) => (
            <div key={idx} className="flex items-center justify-between text-sm">
              <span className="font-medium">{it.productName}</span>
              <div className="flex items-center gap-4 text-muted-foreground">
                <span>{it.quantity} × ₪{it.unitPrice.toFixed(2)}</span>
                <span className="font-semibold text-foreground w-20 text-left">
                  ₪{(it.quantity * it.unitPrice).toFixed(2)}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}

// ── Nedarim Plus credit payment frame ──
function NedarimPaymentFrame({
  total, customer, onCancel, onSuccess,
}: {
  total: number;
  customer: 'yeshiva' | 'external';
  onCancel: () => void;
  onSuccess: () => void;
}) {
  const settings = useStore(s => s.settings);
  const mosadId = settings.nedarimInstitutionCode?.trim();

  if (!mosadId) {
    return (
      <div className="space-y-4 text-center py-6">
        <div className="text-destructive font-semibold">
          קוד מוסד נדרים פלוס לא הוגדר. עבור להגדרות {'>'} חיבור לנדרים פלוס.
        </div>
        <Button variant="outline" onClick={onCancel}>חזור</Button>
      </div>
    );
  }

  const params = new URLSearchParams({
    mosad: mosadId,
    Amount: total.toFixed(2),
    Comment: customer === 'yeshiva' ? 'מכירה בקופה - בן ישיבה' : 'מכירה בקופה - חיצוני',
  });
  const iframeUrl = `https://matara.pro/nedarimplus/online/?${params.toString()}`;

  return (
    <div className="space-y-3">
      <div className="text-center text-sm text-muted-foreground">
        סליקת אשראי דרך נדרים פלוס · סכום: <span className="font-bold">₪{total.toFixed(2)}</span>
      </div>
      <iframe
        src={iframeUrl}
        title="נדרים פלוס - טופס תשלום"
        className="w-full rounded-xl border bg-white"
        style={{ height: '70vh', minHeight: 600 }}
        allow="payment *"
      />
      <div className="flex justify-between gap-2">
        <Button variant="outline" onClick={onCancel}>בטל</Button>
        <Button
          onClick={onSuccess}
          className="gap-2 bg-success hover:bg-success/90 text-success-foreground"
        >
          <CheckCircle2 className="w-4 h-4" /> התשלום בוצע — אשר
        </Button>
      </div>
    </div>
  );
}
