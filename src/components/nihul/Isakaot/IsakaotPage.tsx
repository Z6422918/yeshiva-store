import { useState } from 'react';
import { useStore } from '../../../store/useStore';
import { ArrowDownToLine, ChevronDown, ChevronUp, RefreshCw, Search } from 'lucide-react';
import { Card } from '../../ui/card';
import { Badge } from '../../ui/badge';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { cn } from '../../../lib/utils';
import SpecialApprovals from './SpecialApprovals';

// ─── Sub-tab type ──────────────────────────────────────────────────────────────
type SubTab = 'list' | 'approvals' | 'nedarim';

// ─── Summary stat card ─────────────────────────────────────────────────────────
function StatCard({
  icon,
  label,
  value,
  sub,
  colorClass,
  borderClass,
  bgClass,
}: {
  icon: string;
  label: string;
  value: string;
  sub: string;
  colorClass: string;
  borderClass: string;
  bgClass: string;
}) {
  return (
    <div className={cn('rounded-2xl border-2 p-5 text-center shadow-soft', borderClass, bgClass)}>
      <div className="text-3xl mb-2">{icon}</div>
      <div className={cn('text-2xl font-black', colorClass)}>{value}</div>
      <div className="text-sm font-bold text-foreground/80 mt-1">{label}</div>
      <div className="text-xs text-muted-foreground mt-1">{sub}</div>
    </div>
  );
}

// ─── Transfer action card ──────────────────────────────────────────────────────
function TransferCard({
  label,
  pending,
  colorClass,
  bgClass,
  borderClass,
  onTransfer,
}: {
  label: string;
  pending: number;
  colorClass: string;
  bgClass: string;
  borderClass: string;
  onTransfer: () => void;
}) {
  return (
    <div className={cn('rounded-2xl border-2 p-5 flex items-center justify-between shadow-soft', borderClass, bgClass)}>
      <Button
        onClick={onTransfer}
        disabled={pending <= 0}
        className={cn('gap-2 font-bold', colorClass)}
        variant="outline"
      >
        <ArrowDownToLine size={14} />
        העבר לכספת
      </Button>
      <div className="text-right">
        <p className={cn('text-lg font-black', colorClass)}>₪{pending.toFixed(2)}</p>
        <p className="text-xs text-muted-foreground mt-0.5">ממתין — {label}</p>
      </div>
    </div>
  );
}

// ─── Transaction list ──────────────────────────────────────────────────────────
function TransactionsList() {
  const transactions = useStore(s => s.transactions);
  const [search, setSearch] = useState('');
  const [expanded, setExpanded] = useState<string | null>(null);

  const sorted = [...transactions]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .filter(t => {
      if (!search.trim()) return true;
      const q = search.toLowerCase();
      return (
        t.cashierName.toLowerCase().includes(q) ||
        t.totalAmount.toString().includes(q) ||
        t.items.some(i => i.productName.toLowerCase().includes(q))
      );
    });

  if (sorted.length === 0 && !search) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <div className="text-4xl mb-3">📋</div>
        <p className="text-sm font-semibold">אין עסקאות עדיין</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="relative">
        <Search size={14} className="absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground pointer-events-none" />
        <Input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="חיפוש עסקאות..."
          className="pr-9 text-sm"
        />
      </div>

      {sorted.length === 0 && (
        <p className="text-center text-muted-foreground text-sm py-6">לא נמצאו תוצאות</p>
      )}

      {sorted.map(tx => (
        <div
          key={tx.id}
          className="rounded-xl border border-border overflow-hidden shadow-soft"
        >
          {/* Header row */}
          <button
            onClick={() => setExpanded(expanded === tx.id ? null : tx.id)}
            className="w-full flex items-center justify-between px-4 py-3 bg-muted/30 hover:bg-muted/50 transition-smooth text-right"
          >
            <div className="flex items-center gap-2">
              {expanded === tx.id
                ? <ChevronUp size={15} className="text-muted-foreground" />
                : <ChevronDown size={15} className="text-muted-foreground" />
              }
              <Badge
                className={cn(
                  'text-xs border-0',
                  tx.paymentMethod === 'cash'
                    ? 'bg-green-100 text-green-700'
                    : 'bg-blue-100 text-blue-700'
                )}
              >
                {tx.paymentMethod === 'cash' ? '💵 מזומן' : '💳 אשראי'}
              </Badge>
              {tx.transferredToSafe && (
                <Badge className="text-xs border-0 bg-muted text-muted-foreground">
                  הועבר לכספת
                </Badge>
              )}
              <Badge className="text-xs border-0 bg-secondary/50 text-secondary-foreground">
                {tx.buyerType === 'yeshiva' ? 'בן ישיבה' : 'חיצוני'}
              </Badge>
            </div>
            <div className="text-right">
              <p className="font-black text-primary">₪{tx.totalAmount.toFixed(2)}</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {new Date(tx.date).toLocaleDateString('he-IL', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                {' · '}
                {tx.cashierName}
              </p>
            </div>
          </button>

          {/* Expanded items */}
          {expanded === tx.id && (
            <div className="px-4 py-3 bg-card border-t border-border/50 space-y-1.5">
              {tx.items.map(item => (
                <div key={item.variantId} className="flex justify-between text-sm items-center">
                  <span className="font-bold text-primary">₪{item.totalPrice.toFixed(2)}</span>
                  <span className="text-foreground">
                    {item.productName}
                    {item.variantDescription && (
                      <span className="text-muted-foreground"> ({item.variantDescription})</span>
                    )}
                    {' × '}
                    <span className="font-semibold">{item.quantity}</span>
                  </span>
                </div>
              ))}
              {tx.nedarimReference && (
                <p className="text-xs text-muted-foreground pt-1 border-t border-border/30 mt-2">
                  אסמכתא נדרים: {tx.nedarimReference}
                </p>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// ─── Nedarim tab ───────────────────────────────────────────────────────────────
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
            <RefreshCw size={14} />
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

// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function IsakaotPage() {
  const { transactions, transferToSafe, getCashNotTransferred, getCreditNotTransferred } = useStore();
  const [subTab, setSubTab] = useState<SubTab>('list');

  const cashPending   = getCashNotTransferred();
  const creditPending = getCreditNotTransferred();

  const cashTransferred   = transactions.filter(t => t.paymentMethod === 'cash'   && t.transferredToSafe).reduce((s, t) => s + t.totalAmount, 0);
  const creditTransferred = transactions.filter(t => t.paymentMethod === 'credit' && t.transferredToSafe).reduce((s, t) => s + t.totalAmount, 0);

  const handleTransfer = (source: 'cash' | 'credit') => {
    const pending = source === 'cash' ? cashPending : creditPending;
    if (pending <= 0) return;
    const ids = transactions.filter(t => t.paymentMethod === source && !t.transferredToSafe).map(t => t.id);
    transferToSafe(source, ids, pending);
  };

  const subTabs: { id: SubTab; label: string }[] = [
    { id: 'list',      label: '📋 רשימת עסקאות' },
    { id: 'approvals', label: '✅ אישורים מיוחדים' },
    { id: 'nedarim',   label: '🔄 נדרים פלוס' },
  ];

  return (
    <div className="space-y-5" dir="rtl">

      {/* ── 4 Summary cards ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          icon="💵"
          label="קניות מזומן"
          value={`₪${(cashPending + cashTransferred).toFixed(0)}`}
          sub='סה"כ'
          colorClass="text-green-700"
          borderClass="border-green-200"
          bgClass="bg-green-50"
        />
        <StatCard
          icon="🏦"
          label="הועבר לכספת"
          value={`₪${cashTransferred.toFixed(0)}`}
          sub="מזומן"
          colorClass="text-primary"
          borderClass="border-primary/30"
          bgClass="bg-primary/5"
        />
        <StatCard
          icon="💳"
          label="קניות אשראי"
          value={`₪${(creditPending + creditTransferred).toFixed(0)}`}
          sub='סה"כ'
          colorClass="text-blue-700"
          borderClass="border-blue-200"
          bgClass="bg-blue-50"
        />
        <StatCard
          icon="📥"
          label="נמשך לכספת"
          value={`₪${creditTransferred.toFixed(0)}`}
          sub="אשראי"
          colorClass="text-purple-700"
          borderClass="border-purple-200"
          bgClass="bg-purple-50"
        />
      </div>

      {/* ── Transfer actions ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <TransferCard
          label="מזומן"
          pending={cashPending}
          colorClass="text-green-700 border-green-300 hover:bg-green-50"
          bgClass="bg-green-50/50"
          borderClass="border-green-200"
          onTransfer={() => handleTransfer('cash')}
        />
        <TransferCard
          label="אשראי"
          pending={creditPending}
          colorClass="text-blue-700 border-blue-300 hover:bg-blue-50"
          bgClass="bg-blue-50/50"
          borderClass="border-blue-200"
          onTransfer={() => handleTransfer('credit')}
        />
      </div>

      {/* ── Main card with sub-tabs ── */}
      <Card className="shadow-soft overflow-hidden">
        {/* Tab bar */}
        <div className="flex gap-2 p-4 border-b border-border">
          {subTabs.map(t => (
            <button
              key={t.id}
              onClick={() => setSubTab(t.id)}
              className={cn(
                'text-xs font-bold px-4 py-2 rounded-xl transition-smooth',
                subTab === t.id
                  ? 'gradient-primary text-primary-foreground shadow-soft'
                  : 'bg-muted text-muted-foreground hover:text-foreground'
              )}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="p-5">
          {subTab === 'list'      && <TransactionsList />}
          {subTab === 'approvals' && <SpecialApprovals />}
          {subTab === 'nedarim'   && <NedarimTab />}
        </div>
      </Card>
    </div>
  );
}
