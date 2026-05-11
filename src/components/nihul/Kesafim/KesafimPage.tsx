import { useState } from 'react';
import { useStore } from '../../../store/useStore';
import IncomeTab from './IncomeTab';
import ExpensesTab from './ExpensesTab';
import DebtsTab from './DebtsTab';

type SubTab = 'income' | 'expenses' | 'debts';

const NAVY = '#1e3166';

export default function KesafimPage() {
  const {
    getCashNotTransferred, getCreditNotTransferred, getSafeBalance,
    getTotalPurchaseDebt, getTotalCommissionDebt,
    products, suppliers,
  } = useStore();

  const [subTab, setSubTab] = useState<SubTab>('income');

  const cashPending = getCashNotTransferred();
  const creditPending = getCreditNotTransferred();
  const totalPendingIncome = cashPending + creditPending;
  const safeBalance = getSafeBalance();
  const purchaseDebt = getTotalPurchaseDebt();
  const commissionDebt = getTotalCommissionDebt();
  const totalDebt = purchaseDebt + commissionDebt;

  const purchaseStockProfit = products
    .filter(p => suppliers.find(s => s.id === p.supplierId)?.type === 'purchase')
    .reduce((sum, p) => sum + p.variants.reduce((vs, v) => vs + v.currentStock * (v.yeshivaPrice - v.costPrice), 0), 0);

  const balance = totalPendingIncome + purchaseStockProfit - totalDebt;

  return (
    <div className="space-y-4">

      {/* ── BIG BALANCE BAR ── */}
      <div style={{
        background: 'linear-gradient(135deg,#1e3166,#3949ab)',
        borderRadius: 20,
        padding: '20px 28px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        boxShadow: '0 6px 20px rgba(30,49,102,0.25)',
      }}>
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: 'rgba(197,202,233,0.8)' }}>⚖️ מאזן כולל — הכנסות מול הוצאות</div>
          <div style={{ fontSize: 34, fontWeight: 900, color: '#fff', marginTop: 4 }}>
            {balance >= 0 ? '+' : ''}₪{balance.toFixed(2)}
          </div>
          <div style={{ fontSize: 11, color: 'rgba(197,202,233,0.6)', marginTop: 3 }}>לא כולל סחורה בקומיסיון</div>
        </div>
        <div style={{ fontSize: 48 }}>📊</div>
      </div>

      {/* ── THREE BOXES ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14 }}>
        <div style={{ borderRadius: 18, padding: 20, textAlign: 'center', border: '2px solid #a5d6a7', background: '#f0faf0' }}>
          <div style={{ fontSize: 28, marginBottom: 8 }}>💵</div>
          <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: 1, textTransform: 'uppercase' as const, color: '#4caf50', marginBottom: 6 }}>הכנסות צפויות</div>
          <div style={{ fontSize: 26, fontWeight: 900, color: '#2e7d32' }}>₪{totalPendingIncome.toFixed(0)}</div>
          <div style={{ fontSize: 11, color: '#aaa', marginTop: 6 }}>מזומן + אשראי ממתין</div>
        </div>
        <div style={{ borderRadius: 18, padding: 20, textAlign: 'center', border: '2px solid #9fa8da', background: '#f0f4ff' }}>
          <div style={{ fontSize: 28, marginBottom: 8 }}>🏦</div>
          <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: 1, textTransform: 'uppercase' as const, color: '#5c6bc0', marginBottom: 6 }}>כספת</div>
          <div style={{ fontSize: 26, fontWeight: 900, color: NAVY }}>₪{safeBalance.toFixed(0)}</div>
          <div style={{ fontSize: 11, color: '#aaa', marginTop: 6 }}>יתרה נוכחית</div>
        </div>
        <div style={{ borderRadius: 18, padding: 20, textAlign: 'center', border: '2px solid #ef9a9a', background: '#fff4f4' }}>
          <div style={{ fontSize: 28, marginBottom: 8 }}>📤</div>
          <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: 1, textTransform: 'uppercase' as const, color: '#ef5350', marginBottom: 6 }}>הוצאות צפויות</div>
          <div style={{ fontSize: 26, fontWeight: 900, color: '#c62828' }}>₪{totalDebt.toFixed(0)}</div>
          <div style={{ fontSize: 11, color: '#aaa', marginTop: 6 }}>חובות לספקים</div>
        </div>
      </div>

      {/* ── MAIN CARD WITH SUB-TABS ── */}
      <div style={{ background: '#fff', borderRadius: 20, boxShadow: '0 2px 14px rgba(26,35,126,0.07)', border: '1px solid #eaecf5', overflow: 'hidden' }}>

        {/* Inner tabs (pill style) */}
        <div style={{ display: 'flex', gap: 6, padding: '14px 20px', borderBottom: '1px solid #f0f2fa' }}>
          {([
            { id: 'income', label: '💰 הכנסות' },
            { id: 'expenses', label: '📤 הוצאות' },
            { id: 'debts', label: '🧾 חובות' },
          ] as { id: SubTab; label: string }[]).map(t => (
            <button
              key={t.id}
              onClick={() => setSubTab(t.id)}
              className="text-xs font-bold transition-all duration-150 px-4 py-2 rounded-xl"
              style={
                subTab === t.id
                  ? { background: NAVY, color: '#fff', boxShadow: '0 3px 10px rgba(30,49,102,0.25)', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }
                  : { background: '#f0f2f8', color: '#9fa8da', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }
              }
            >
              {t.label}
            </button>
          ))}
        </div>

        <div style={{ padding: 20 }}>
          {subTab === 'income' && <IncomeTab />}
          {subTab === 'expenses' && <ExpensesTab />}
          {subTab === 'debts' && <DebtsTab />}
        </div>
      </div>
    </div>
  );
}
