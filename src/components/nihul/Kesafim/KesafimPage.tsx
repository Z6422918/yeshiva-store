import { useState } from 'react';
import { useStore } from '../../../store/useStore';
import IncomeTab from './IncomeTab';
import ExpensesTab from './ExpensesTab';
import DebtsTab from './DebtsTab';
import { Card } from '../../ui/card';
import { cn } from '../../../lib/utils';

type SubTab = 'income' | 'expenses' | 'debts';

// ─── Mini stat card ────────────────────────────────────────────────────────────
function BalanceCard({
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
      <div className={cn('text-xs font-black uppercase tracking-wide mb-2', colorClass)}>{label}</div>
      <div className={cn('text-2xl font-black', colorClass)}>{value}</div>
      <div className="text-xs text-muted-foreground mt-2">{sub}</div>
    </div>
  );
}

// ─── Inventory summary card ────────────────────────────────────────────────────
function InventoryCard() {
  const { products, suppliers } = useStore();

  const purchaseValue = products
    .filter(p => suppliers.find(s => s.id === p.supplierId)?.type === 'purchase')
    .reduce((sum, p) => sum + p.variants.reduce((vs, v) => vs + v.currentStock * v.costPrice, 0), 0);

  const commissionValue = products
    .filter(p => suppliers.find(s => s.id === p.supplierId)?.type === 'commission')
    .reduce((sum, p) => sum + p.variants.reduce((vs, v) => vs + v.currentStock * v.costPrice, 0), 0);

  const purchaseProfit = products
    .filter(p => suppliers.find(s => s.id === p.supplierId)?.type === 'purchase')
    .reduce((sum, p) => sum + p.variants.reduce((vs, v) => vs + v.currentStock * (v.yeshivaPrice - v.costPrice), 0), 0);

  return (
    <Card className="shadow-soft p-5">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-xl">📦</span>
        <h3 className="text-sm font-black text-primary">ערך מלאי</h3>
      </div>
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-orange-50 border border-orange-200 rounded-xl p-3 text-center">
          <div className="text-xs text-orange-600 font-bold mb-1">קניה — עלות</div>
          <div className="text-lg font-black text-orange-700">₪{purchaseValue.toFixed(0)}</div>
          <div className="text-xs text-muted-foreground mt-1">סחורה שנקנתה</div>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-xl p-3 text-center">
          <div className="text-xs text-green-600 font-bold mb-1">קניה — רווח פוטנציאלי</div>
          <div className="text-lg font-black text-green-700">₪{purchaseProfit.toFixed(0)}</div>
          <div className="text-xs text-muted-foreground mt-1">הפרש מחיר</div>
        </div>
        <div className="bg-purple-50 border border-purple-200 rounded-xl p-3 text-center">
          <div className="text-xs text-purple-600 font-bold mb-1">קומיסיון — עלות</div>
          <div className="text-lg font-black text-purple-700">₪{commissionValue.toFixed(0)}</div>
          <div className="text-xs text-muted-foreground mt-1">ברשות הישיבה</div>
        </div>
      </div>
    </Card>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function KesafimPage() {
  const {
    getCashNotTransferred,
    getCreditNotTransferred,
    getSafeBalance,
    getTotalPurchaseDebt,
    getTotalCommissionDebt,
    products,
    suppliers,
  } = useStore();

  const [subTab, setSubTab] = useState<SubTab>('income');

  const cashPending     = getCashNotTransferred();
  const creditPending   = getCreditNotTransferred();
  const totalPending    = cashPending + creditPending;
  const safeBalance     = getSafeBalance();
  const purchaseDebt    = getTotalPurchaseDebt();
  const commissionDebt  = getTotalCommissionDebt();
  const totalDebt       = purchaseDebt + commissionDebt;

  const purchaseStockProfit = products
    .filter(p => suppliers.find(s => s.id === p.supplierId)?.type === 'purchase')
    .reduce((sum, p) => sum + p.variants.reduce((vs, v) => vs + v.currentStock * (v.yeshivaPrice - v.costPrice), 0), 0);

  const balance = totalPending + purchaseStockProfit - totalDebt;

  const subTabs: { id: SubTab; label: string }[] = [
    { id: 'income',   label: '💰 הכנסות' },
    { id: 'expenses', label: '📤 הוצאות' },
    { id: 'debts',    label: '🧾 חובות' },
  ];

  return (
    <div className="space-y-5" dir="rtl">

      {/* ── Big balance banner ── */}
      <div className="gradient-primary rounded-2xl p-6 flex items-center justify-between shadow-elegant">
        <div>
          <div className="text-xs font-bold text-primary-foreground/70 mb-1">
            ⚖️ מאזן כולל — הכנסות מול הוצאות
          </div>
          <div className="text-4xl font-black text-primary-foreground">
            {balance >= 0 ? '+' : ''}₪{balance.toFixed(2)}
          </div>
          <div className="text-xs text-primary-foreground/50 mt-1">לא כולל סחורה בקומיסיון</div>
        </div>
        <div className="text-5xl opacity-60">📊</div>
      </div>

      {/* ── Three summary cards ── */}
      <div className="grid grid-cols-3 gap-4">
        <BalanceCard
          icon="💵"
          label="הכנסות צפויות"
          value={`₪${totalPending.toFixed(0)}`}
          sub="מזומן + אשראי ממתין"
          colorClass="text-green-700"
          borderClass="border-green-200"
          bgClass="bg-green-50"
        />
        <BalanceCard
          icon="🏦"
          label="כספת"
          value={`₪${safeBalance.toFixed(0)}`}
          sub="יתרה נוכחית"
          colorClass="text-primary"
          borderClass="border-primary/30"
          bgClass="bg-primary/5"
        />
        <BalanceCard
          icon="📤"
          label="הוצאות צפויות"
          value={`₪${totalDebt.toFixed(0)}`}
          sub="חובות לספקים"
          colorClass="text-destructive"
          borderClass="border-destructive/30"
          bgClass="bg-destructive/5"
        />
      </div>

      {/* ── Inventory card ── */}
      <InventoryCard />

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
          {subTab === 'income'   && <IncomeTab />}
          {subTab === 'expenses' && <ExpensesTab />}
          {subTab === 'debts'    && <DebtsTab />}
        </div>
      </Card>
    </div>
  );
}
