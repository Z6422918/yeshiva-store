import { useState } from 'react';
import { useStore } from '../../../store/useStore';
import { TrendingUp, TrendingDown, Vault, Scale } from 'lucide-react';
import IncomeTab from './IncomeTab';
import ExpensesTab from './ExpensesTab';
import DebtsTab from './DebtsTab';

type SubTab = 'income' | 'expenses' | 'debts';

export default function KesafimPage() {
  const {
    getCashNotTransferred, getCreditNotTransferred, getSafeBalance,
    getTotalPurchaseDebt, getTotalCommissionDebt,
    products, suppliers, transactions
  } = useStore();

  const [subTab, setSubTab] = useState<SubTab>('income');

  const cashPending = getCashNotTransferred();
  const creditPending = getCreditNotTransferred();
  const totalPendingIncome = cashPending + creditPending;
  const safeBalance = getSafeBalance();
  const purchaseDebt = getTotalPurchaseDebt();
  const commissionDebt = getTotalCommissionDebt();

  // Value of purchase-agent merchandise (all stock at cost)
  const purchaseStockValue = products
    .filter(p => {
      const sup = suppliers.find(s => s.id === p.supplierId);
      return sup?.type === 'purchase';
    })
    .reduce((sum, p) =>
      sum + p.variants.reduce((vs, v) => vs + v.currentStock * v.costPrice, 0), 0);

  // Expected profit from purchase stock (at yeshiva price)
  const purchaseStockProfit = products
    .filter(p => {
      const sup = suppliers.find(s => s.id === p.supplierId);
      return sup?.type === 'purchase';
    })
    .reduce((sum, p) =>
      sum + p.variants.reduce((vs, v) => vs + v.currentStock * (v.yeshivaPrice - v.costPrice), 0), 0);

  // Value of commission merchandise (unsold stock)
  const commissionStockValue = products
    .filter(p => {
      const sup = suppliers.find(s => s.id === p.supplierId);
      return sup?.type === 'commission';
    })
    .reduce((sum, p) =>
      sum + p.variants.reduce((vs, v) => vs + v.currentStock * v.costPrice, 0), 0);

  const commissionStockProfit = products
    .filter(p => {
      const sup = suppliers.find(s => s.id === p.supplierId);
      return sup?.type === 'commission';
    })
    .reduce((sum, p) =>
      sum + p.variants.reduce((vs, v) => vs + v.currentStock * (v.yeshivaPrice - v.costPrice), 0), 0);

  const totalExpected = totalPendingIncome + purchaseStockProfit;
  const totalDebt = purchaseDebt + commissionDebt;
  const balance = totalExpected - totalDebt;

  return (
    <div className="space-y-4">
      {/* Top balance indicator */}
      <div className={`rounded-xl p-4 text-center ${balance >= 0 ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
        <p className="text-sm text-gray-500 mb-1">מאזן צפוי (לא כולל כספת וסחורת קומיסיון)</p>
        <p className={`text-4xl font-bold ${balance >= 0 ? 'text-green-700' : 'text-red-600'}`}>
          {balance >= 0 ? '+' : ''}₪{balance.toFixed(2)}
        </p>
        <p className="text-xs text-gray-400 mt-1">הכנסות צפויות למול הוצאות צפויות</p>
      </div>

      {/* Cards row 1 */}
      <div className="grid grid-cols-3 gap-4">
        {/* Pending income */}
        <div className="bg-white rounded-xl shadow p-4">
          <div className="flex items-center justify-between mb-3">
            <TrendingUp size={20} className="text-green-500" />
            <span className="text-xs font-semibold text-green-600 bg-green-100 px-2 py-0.5 rounded-full">הכנסות צפויות</span>
          </div>
          <p className="text-2xl font-bold text-gray-800">₪{totalPendingIncome.toFixed(2)}</p>
          <div className="mt-2 space-y-1 text-xs text-gray-500">
            <div className="flex justify-between">
              <span className="text-green-600">₪{cashPending.toFixed(2)}</span>
              <span>מזומן</span>
            </div>
            <div className="flex justify-between">
              <span className="text-blue-600">₪{creditPending.toFixed(2)}</span>
              <span>אשראי</span>
            </div>
          </div>
        </div>

        {/* Safe */}
        <div className="bg-white rounded-xl shadow p-4">
          <div className="flex items-center justify-between mb-3">
            <Scale size={20} className="text-purple-500" />
            <span className="text-xs font-semibold text-purple-600 bg-purple-100 px-2 py-0.5 rounded-full">כספת</span>
          </div>
          <p className="text-2xl font-bold text-gray-800">₪{safeBalance.toFixed(2)}</p>
          <p className="text-xs text-gray-400 mt-2">יתרה נוכחית בכספת</p>
        </div>

        {/* Expenses */}
        <div className="bg-white rounded-xl shadow p-4">
          <div className="flex items-center justify-between mb-3">
            <TrendingDown size={20} className="text-red-500" />
            <span className="text-xs font-semibold text-red-600 bg-red-100 px-2 py-0.5 rounded-full">הוצאות צפויות</span>
          </div>
          <p className="text-2xl font-bold text-gray-800">₪{totalDebt.toFixed(2)}</p>
          <div className="mt-2 space-y-1 text-xs text-gray-500">
            <div className="flex justify-between">
              <span className="text-red-600">₪{purchaseDebt.toFixed(2)}</span>
              <span>חובות קניה</span>
            </div>
            <div className="flex justify-between">
              <span className="text-orange-600">₪{commissionDebt.toFixed(2)}</span>
              <span>חובות קומיסיון</span>
            </div>
          </div>
        </div>
      </div>

      {/* Cards row 2 */}
      <div className="grid grid-cols-2 gap-4">
        {/* Purchase stock */}
        <div className="bg-white rounded-xl shadow p-4 border-r-4 border-blue-400">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full">נכלל בחישוב</span>
            <span className="text-sm font-semibold text-gray-700">סחורת קניה קיימת</span>
          </div>
          <p className="text-xl font-bold text-gray-800">₪{purchaseStockValue.toFixed(2)}</p>
          <p className="text-sm text-green-600 font-semibold mt-1">צפי רווח: ₪{purchaseStockProfit.toFixed(2)}</p>
        </div>

        {/* Commission stock - not included */}
        <div className="bg-gray-50 rounded-xl shadow p-4 border-r-4 border-gray-300">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-gray-500 bg-gray-200 px-2 py-0.5 rounded-full">לא נכלל</span>
            <span className="text-sm font-semibold text-gray-700">סחורת קומיסיון קיימת</span>
          </div>
          <p className="text-xl font-bold text-gray-600">₪{commissionStockValue.toFixed(2)}</p>
          <p className="text-sm text-green-500 font-semibold mt-1">צפי רווח: ₪{commissionStockProfit.toFixed(2)}</p>
        </div>
      </div>

      {/* Sub-tabs */}
      <div className="bg-white rounded-xl shadow">
        <div className="flex border-b">
          {([
            { id: 'income', label: 'הכנסות' },
            { id: 'expenses', label: 'הוצאות' },
            { id: 'debts', label: 'חובות לספקים' },
          ] as { id: SubTab; label: string }[]).map(t => (
            <button
              key={t.id}
              onClick={() => setSubTab(t.id)}
              className={`flex-1 py-3 text-sm font-semibold transition border-b-2 -mb-px ${
                subTab === t.id
                  ? 'border-blue-700 text-blue-700'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
        <div className="p-4">
          {subTab === 'income' && <IncomeTab />}
          {subTab === 'expenses' && <ExpensesTab />}
          {subTab === 'debts' && <DebtsTab />}
        </div>
      </div>
    </div>
  );
}
