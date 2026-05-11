import { useState, useMemo } from 'react';
import { useStore } from '../../../store/useStore';
import { Search, Banknote, CreditCard, ShieldCheck, Receipt, Database } from 'lucide-react';
import { Card } from '../../ui/card';
import { Badge } from '../../ui/badge';
import { Input } from '../../ui/input';
import { cn } from '../../../lib/utils';
import SpecialApprovals from './SpecialApprovals';

type SubTab = 'list' | 'approvals' | 'nedarim';

const subTabs = [
  { value: 'list'      as SubTab, label: 'עסקאות',             icon: Receipt },
  { value: 'approvals' as SubTab, label: 'אישורים',            icon: ShieldCheck },
  { value: 'nedarim'   as SubTab, label: 'אשראי - נדרים פלוס', icon: Database },
];

const fmtDate = (iso: string) => new Date(iso).toLocaleString('he-IL');

// ─── Row helper for stat cards ─────────────────────────────────────────────────
function Row({ label, value, positive }: { label: string; value: number; positive?: boolean }) {
  return (
    <div className="flex justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className={cn('font-semibold', positive && 'text-green-600')}>₪{value.toFixed(2)}</span>
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function IsakaotPage() {
  const { transactions, transferToSafe, getCashNotTransferred, getCreditNotTransferred, safeEntries } = useStore();
  const [active, setActive] = useState<SubTab>('list');
  const [query, setQuery]   = useState('');
  const [sortBy, setSortBy] = useState<'date_desc' | 'date_asc' | 'amount_desc' | 'amount_asc'>('date_desc');

  const cashNotTransferred   = getCashNotTransferred();
  const creditNotTransferred = getCreditNotTransferred();

  const totalCash   = useMemo(() => transactions.filter(t => t.paymentMethod === 'cash').reduce((s, t) => s + t.totalAmount, 0), [transactions]);
  const totalCredit = useMemo(() => transactions.filter(t => t.paymentMethod === 'credit').reduce((s, t) => s + t.totalAmount, 0), [transactions]);

  const cashToSafe   = safeEntries.filter(e => e.source === 'cash'   && e.type === 'income').reduce((s, e) => s + e.amount, 0);
  const creditToSafe = safeEntries.filter(e => e.source === 'credit' && e.type === 'income').reduce((s, e) => s + e.amount, 0);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let arr = transactions.filter(t => {
      if (!q) return true;
      if (String(t.totalAmount).includes(q)) return true;
      if (t.cashierName.toLowerCase().includes(q)) return true;
      return t.items.some(it => it.productName.toLowerCase().includes(q));
    });
    arr = [...arr].sort((a, b) => {
      switch (sortBy) {
        case 'date_asc':    return a.date.localeCompare(b.date);
        case 'amount_desc': return b.totalAmount - a.totalAmount;
        case 'amount_asc':  return a.totalAmount - b.totalAmount;
        default:            return b.date.localeCompare(a.date);
      }
    });
    return arr;
  }, [transactions, query, sortBy]);

  return (
    <div className="space-y-4" dir="rtl">

      {/* ── Two summary cards ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <Card className="p-4 border-primary/30">
          <div className="flex items-center gap-2 mb-2">
            <CreditCard className="w-4 h-4 text-primary" />
            <h4 className="font-semibold">אשראי</h4>
          </div>
          <div className="space-y-1 text-sm">
            <Row label="סך עסקאות"      value={totalCredit} />
            <Row label="הכנסות לכספת"   value={creditToSafe} positive />
            <div className="pt-2 border-t flex justify-between font-bold">
              <span>מאזן</span>
              <span className={cn(creditNotTransferred >= 0 ? 'text-yellow-600' : 'text-green-600')}>
                ₪{creditNotTransferred.toFixed(2)}
              </span>
            </div>
          </div>
        </Card>

        <Card className="p-4 border-green-200">
          <div className="flex items-center gap-2 mb-2">
            <Banknote className="w-4 h-4 text-green-600" />
            <h4 className="font-semibold">מזומן</h4>
          </div>
          <div className="space-y-1 text-sm">
            <Row label="סך עסקאות"      value={totalCash} />
            <Row label="הכנסות לכספת"   value={cashToSafe} positive />
            <div className="pt-2 border-t flex justify-between font-bold">
              <span>מאזן</span>
              <span className={cn(cashNotTransferred >= 0 ? 'text-yellow-600' : 'text-green-600')}>
                ₪{cashNotTransferred.toFixed(2)}
              </span>
            </div>
          </div>
        </Card>
      </div>

      {/* ── Sub-tab bar ── */}
      <div className="grid grid-cols-3 gap-1 bg-muted p-1 rounded-lg">
        {subTabs.map(t => (
          <button
            key={t.value}
            onClick={() => setActive(t.value)}
            className={cn(
              'inline-flex items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-medium',
              active === t.value
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <t.icon className="w-4 h-4" /> {t.label}
          </button>
        ))}
      </div>

      {/* ── List tab ── */}
      {active === 'list' && (
        <>
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative flex-1 min-w-64">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="חיפוש לפי שם, מוצר, סכום..."
                className="pr-10"
              />
            </div>
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as typeof sortBy)}
              className="h-10 rounded-md border bg-background px-3 text-sm"
            >
              <option value="date_desc">תאריך - חדש לישן</option>
              <option value="date_asc">תאריך - ישן לחדש</option>
              <option value="amount_desc">סכום - גבוה לנמוך</option>
              <option value="amount_asc">סכום - נמוך לגבוה</option>
            </select>
          </div>

          <div className="space-y-2">
            {filtered.length === 0 && (
              <Card className="p-8 text-center text-muted-foreground">אין עסקאות</Card>
            )}
            {filtered.map(tx => (
              <Card key={tx.id} className="p-4">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-medium">{fmtDate(tx.date)}</span>
                    <Badge variant="secondary" className="gap-1">
                      {tx.paymentMethod === 'cash'   && <><Banknote   className="w-3 h-3" />מזומן</>}
                      {tx.paymentMethod === 'credit' && <><CreditCard className="w-3 h-3" />אשראי</>}
                    </Badge>
                    <Badge variant="outline">
                      {tx.buyerType === 'yeshiva' ? 'בן ישיבה' : 'מבחוץ'}
                    </Badge>
                    {tx.transferredToSafe && (
                      <Badge variant="outline" className="text-muted-foreground">הועבר לכספת</Badge>
                    )}
                  </div>
                  <div className="text-lg font-bold text-primary">₪{tx.totalAmount.toFixed(2)}</div>
                </div>
                <div className="mt-2 text-xs text-muted-foreground">
                  {tx.items.map((it, i) => (
                    <span key={i} className="ml-2">
                      {it.productName}
                      {it.variantDescription && ` (${it.variantDescription})`}
                      {' ×'}{it.quantity}
                    </span>
                  ))}
                </div>
              </Card>
            ))}
          </div>
        </>
      )}

      {/* ── Approvals tab ── */}
      {active === 'approvals' && <SpecialApprovals />}

      {/* ── Nedarim tab ── */}
      {active === 'nedarim' && <NedarimTab />}
    </div>
  );
}

// ─── Nedarim placeholder ───────────────────────────────────────────────────────
function NedarimTab() {
  const settings = useStore(s => s.settings);
  return (
    <div className="flex flex-col items-center justify-center py-12 gap-4">
      <div className="bg-primary/5 border-2 border-primary/20 rounded-2xl p-8 text-center max-w-sm">
        <div className="text-5xl mb-4">🔄</div>
        <h3 className="text-base font-black text-primary mb-2">שאיבת נתוני נדרים פלוס</h3>
        <p className="text-sm text-muted-foreground mb-5">
          {settings.nedarimInstitutionCode
            ? `קוד מוסד: ${settings.nedarimInstitutionCode}`
            : 'יש להגדיר קוד מוסד בהגדרות'}
        </p>
        {settings.nedarimInstitutionCode ? (
          <a
            href={`https://www.nedarim.co.il/organizations/reports/?mosad=${settings.nedarimInstitutionCode}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 gradient-primary text-primary-foreground text-sm font-bold px-5 py-2.5 rounded-xl hover:opacity-90 transition-smooth shadow-soft"
          >
            <Database className="w-4 h-4" />
            פתח דוחות נדרים פלוס
          </a>
        ) : (
          <p className="text-sm font-semibold text-orange-600 bg-orange-50 rounded-lg px-4 py-2 border border-orange-200">
            הגדר קוד מוסד בהגדרות תחילה
          </p>
        )}
      </div>
    </div>
  );
}
