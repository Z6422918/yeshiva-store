import { useState } from 'react';
import { useStore } from '../../../store/useStore';
import IncomeTab from './IncomeTab';
import ExpensesTab from './ExpensesTab';
import DebtsTab from './DebtsTab';
import { Card } from '../../ui/card';
import { cn } from '../../../lib/utils';
import {
  TrendingUp, TrendingDown, Vault, Wallet, Banknote, CreditCard,
  ShieldCheck, HandCoins, Package,
} from 'lucide-react';

type SubTab = 'income' | 'expenses' | 'debts';

const fmtMoney = (n: number) => `₪${n.toFixed(2)}`;

// ─── Row inside a card ─────────────────────────────────────────────────────────
function Row({
  label, icon, value, bold, positive, negative,
}: {
  label: string; icon?: React.ReactNode; value: number;
  bold?: boolean; positive?: boolean; negative?: boolean;
}) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2 text-muted-foreground">
        {icon}<span>{label}</span>
      </div>
      <span className={cn(
        bold && 'font-bold text-base',
        positive && 'text-green-600 font-semibold',
        negative && 'text-destructive font-semibold',
      )}>{fmtMoney(value)}</span>
    </div>
  );
}

// ─── Inventory card ────────────────────────────────────────────────────────────
function InventoryCard() {
  const { products, suppliers } = useStore();

  let purchaseInv = 0, commissionInv = 0, purchaseProfit = 0, commissionProfit = 0;

  for (const p of products) {
    const stype = suppliers.find(s => s.id === p.supplierId)?.type ?? 'purchase';
    for (const v of p.variants) {
      const supplies = v.supplies ?? [];
      const supplied = supplies.reduce((s, x) => s + x.quantity, 0);
      const suppliedCost = supplies.reduce((s, x) => s + x.quantity * x.costPerUnit, 0);
      const avgCost = supplied > 0 ? suppliedCost / supplied : v.costPrice;
      const remaining = v.currentStock;
      const projectedPrice = v.yeshivaPrice || 0;

      if (stype === 'commission') {
        commissionInv += remaining * avgCost;
        commissionProfit += remaining * Math.max(0, projectedPrice - avgCost);
      } else {
        purchaseInv += remaining * avgCost;
        purchaseProfit += remaining * Math.max(0, projectedPrice - avgCost);
      }
    }
  }

  const inventoryValue = purchaseInv + commissionInv;
  const expectedProfit = purchaseProfit + commissionProfit;

  return (
    <Card className="p-4 shadow-soft">
      <div className="flex items-center gap-2 mb-3 pb-2 border-b">
        <Package className="w-4 h-4 text-primary" />
        <h3 className="font-semibold">סחורה במלאי</h3>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-1 text-sm">
          <div className="font-semibold mb-1">שווי הסחורה (עלות)</div>
          <Row label="מסוכני קנייה" value={purchaseInv} />
          <Row label="מסוכני קומיסיון" value={commissionInv} />
          <div className="pt-1 border-t flex justify-between font-bold">
            <span>סך הכל</span><span>{fmtMoney(inventoryValue)}</span>
          </div>
        </div>
        <div className="space-y-1 text-sm">
          <div className="font-semibold mb-1">רווח עצמי מהסחורה</div>
          <Row label="קומיסיון" value={commissionProfit} positive />
          <Row label="קנייה" value={purchaseProfit} positive />
          <div className="pt-1 border-t flex justify-between font-bold text-green-600">
            <span>סך הכל</span><span>{fmtMoney(expectedProfit)}</span>
          </div>
        </div>
        <div className="space-y-1 text-sm">
          <div className="font-semibold mb-1">סך כולל (עלות + רווח)</div>
          <Row label="קנייה" value={purchaseInv + purchaseProfit} />
          <Row label="קומיסיון" value={commissionInv + commissionProfit} />
          <div className="pt-1 border-t flex justify-between font-bold text-primary">
            <span>סך הכל</span><span>{fmtMoney(inventoryValue + expectedProfit)}</span>
          </div>
        </div>
      </div>
    </Card>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function KesafimPage() {
  const {
    getCashNotTransferred, getCreditNotTransferred, getSafeBalance,
    specialApprovals, safeEntries, supplierPayments,
  } = useStore();
  const [subTab, setSubTab] = useState<SubTab>('income');

  const cashPending    = getCashNotTransferred();
  const creditPending  = getCreditNotTransferred();
  const safeBalance    = getSafeBalance();

  const totalIncomes   = safeEntries.filter(e => e.type === 'income').reduce((s, e) => s + e.amount, 0);
  const totalExpenses  = safeEntries.filter(e => e.type === 'expense').reduce((s, e) => s + e.amount, 0);

  const pendingApprovals = specialApprovals.filter(a => a.status === 'pending').reduce((s, a) => s + a.total, 0);
  const projectedIncomes = cashPending + creditPending + pendingApprovals;

  const gemachDebt = safeEntries
    .filter(e => e.type === 'income' && e.description.startsWith('הלוואה'))
    .reduce((s, e) => s + e.amount, 0);

  const totalSupplierPaid = supplierPayments.reduce((s, p) => s + p.amount, 0);
  const projectedExpenses = gemachDebt;

  const finalBalance = safeBalance + cashPending + projectedIncomes - projectedExpenses;

  return (
    <div className="space-y-4" dir="rtl">

      {/* ── Big balance (text only, no card) ── */}
      <div className="text-center py-3">
        <div className="text-sm text-muted-foreground mb-1">מאזן סופי צפוי</div>
        <div className={cn(
          'text-5xl md:text-6xl font-extrabold tracking-tight',
          finalBalance >= 0 ? 'text-green-600' : 'text-destructive'
        )}>
          {fmtMoney(finalBalance)}
        </div>
      </div>

      {/* ── 3-column overview ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">

        {/* Projected Incomes */}
        <Card className="p-4 shadow-soft border-green-200 bg-green-50/50">
          <div className="flex items-center gap-2 mb-3 pb-2 border-b">
            <TrendingUp className="w-4 h-4 text-green-600" />
            <h3 className="font-semibold">הכנסות צפויות</h3>
          </div>
          <div className="space-y-2 text-sm">
            <Row label="מזומן" icon={<Banknote className="w-4 h-4" />} value={cashPending} />
            <Row label="אשראי" icon={<CreditCard className="w-4 h-4" />} value={creditPending} />
            <Row label="אישורים מיוחדים" icon={<ShieldCheck className="w-4 h-4" />} value={pendingApprovals} />
            <div className="pt-2 border-t flex items-center justify-between font-bold text-green-600">
              <span>סך הכל</span>
              <span>{fmtMoney(projectedIncomes)}</span>
            </div>
          </div>
        </Card>

        {/* Safe */}
        <Card className="p-4 shadow-soft border-primary/30 bg-primary/5">
          <div className="flex items-center gap-2 mb-3 pb-2 border-b">
            <Vault className="w-4 h-4 text-primary" />
            <h3 className="font-semibold">כספת</h3>
          </div>
          <div className="space-y-2 text-sm">
            <Row label="סכום קיים" icon={<Wallet className="w-4 h-4" />} value={safeBalance} bold />
            <Row label="סך הכנסות" icon={<TrendingUp className="w-4 h-4" />} value={totalIncomes} positive />
            <Row label="סך הוצאות" icon={<TrendingDown className="w-4 h-4" />} value={totalExpenses} negative />
          </div>
        </Card>

        {/* Projected Expenses */}
        <Card className="p-4 shadow-soft border-destructive/30 bg-destructive/5">
          <div className="flex items-center gap-2 mb-3 pb-2 border-b">
            <TrendingDown className="w-4 h-4 text-destructive" />
            <h3 className="font-semibold">הוצאות צפויות</h3>
          </div>
          <div className="space-y-2 text-sm">
            <Row label='חוב לגמ"חים' icon={<HandCoins className="w-4 h-4" />} value={gemachDebt} negative />
            <div className="pt-2 border-t flex items-center justify-between font-bold text-destructive">
              <span>סך הכל</span>
              <span>{fmtMoney(projectedExpenses)}</span>
            </div>
          </div>
        </Card>
      </div>

      {/* ── Inventory card ── */}
      <InventoryCard />

      {/* ── Sub-tabs ── */}
      <div style={{ display: 'flex', gap: 6 }}>
        {[
          { value: 'income'   as SubTab, emoji: '💰', label: 'הכנסות' },
          { value: 'expenses' as SubTab, emoji: '📤', label: 'הוצאות' },
          { value: 'debts'    as SubTab, emoji: '🧾', label: 'חובות'  },
        ].map(t => (
          <button
            key={t.value}
            onClick={() => setSubTab(t.value)}
            style={{
              padding: '7px 18px', borderRadius: 12, border: 'none',
              fontSize: 12, fontWeight: 700, cursor: 'pointer',
              transition: 'all .2s', fontFamily: "'Heebo', sans-serif",
              background: subTab === t.value ? '#1e3166' : '#f0f2f8',
              color:      subTab === t.value ? '#fff'    : '#9fa8da',
              boxShadow:  subTab === t.value ? '0 3px 10px rgba(30,49,102,0.25)' : 'none',
            }}
          >
            {t.emoji} {t.label}
          </button>
        ))}
      </div>

      {subTab === 'income'   && <IncomeTab />}
      {subTab === 'expenses' && <ExpensesTab />}
      {subTab === 'debts'    && <DebtsTab />}
    </div>
  );
}
