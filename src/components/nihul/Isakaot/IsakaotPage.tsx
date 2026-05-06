import { useState } from 'react';
import { useStore } from '../../../store/useStore';
import { ArrowDownToLine, RefreshCw, CheckSquare } from 'lucide-react';
import SpecialApprovals from './SpecialApprovals';
import TransactionsList from './TransactionsList';

type SubTab = 'approvals' | 'nedarim' | 'list';

export default function IsakaotPage() {
  const { transactions, transferToSafe, getCashNotTransferred, getCreditNotTransferred } = useStore();
  const [subTab, setSubTab] = useState<SubTab>('list');

  const cashPending = getCashNotTransferred();
  const creditPending = getCreditNotTransferred();

  const cashTransferred = transactions
    .filter(t => t.paymentMethod === 'cash' && t.transferredToSafe)
    .reduce((s, t) => s + t.totalAmount, 0);

  const creditTransferred = transactions
    .filter(t => t.paymentMethod === 'credit' && t.transferredToSafe)
    .reduce((s, t) => s + t.totalAmount, 0);

  const handleTransfer = (source: 'cash' | 'credit') => {
    const pending = source === 'cash' ? cashPending : creditPending;
    if (pending <= 0) return;
    const ids = transactions
      .filter(t => t.paymentMethod === source && !t.transferredToSafe)
      .map(t => t.id);
    transferToSafe(source, ids, pending);
  };

  return (
    <div className="space-y-4">
      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-4">
        {/* Cash */}
        <div className="bg-white rounded-xl shadow p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-green-600 bg-green-100 px-2 py-1 rounded-full">מזומן</span>
            <span className="text-gray-500 text-sm">תקבולים</span>
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-800">₪{(cashPending + cashTransferred).toFixed(2)}</p>
            <p className="text-xs text-gray-400 mt-1">סה"כ קניות מזומן</p>
          </div>
          <div className="border-t pt-3 flex items-center justify-between">
            <button
              onClick={() => handleTransfer('cash')}
              disabled={cashPending <= 0}
              className="flex items-center gap-1 text-xs bg-green-600 text-white px-3 py-1.5 rounded-lg hover:bg-green-700 disabled:opacity-40 disabled:cursor-not-allowed transition"
            >
              <ArrowDownToLine size={13} />
              העבר לכספת
            </button>
            <div className="text-right">
              <p className="text-sm font-bold text-green-700">₪{cashPending.toFixed(2)}</p>
              <p className="text-xs text-gray-400">ממתין להעברה</p>
            </div>
          </div>
          <div className="flex justify-between text-xs text-gray-500">
            <span className="text-green-600">₪{cashTransferred.toFixed(2)} הועבר</span>
          </div>
        </div>

        {/* Credit */}
        <div className="bg-white rounded-xl shadow p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-blue-600 bg-blue-100 px-2 py-1 rounded-full">אשראי</span>
            <span className="text-gray-500 text-sm">תקבולים</span>
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-800">₪{(creditPending + creditTransferred).toFixed(2)}</p>
            <p className="text-xs text-gray-400 mt-1">סה"כ קניות אשראי</p>
          </div>
          <div className="border-t pt-3 flex items-center justify-between">
            <button
              onClick={() => handleTransfer('credit')}
              disabled={creditPending <= 0}
              className="flex items-center gap-1 text-xs bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition"
            >
              <ArrowDownToLine size={13} />
              העבר לכספת
            </button>
            <div className="text-right">
              <p className="text-sm font-bold text-blue-700">₪{creditPending.toFixed(2)}</p>
              <p className="text-xs text-gray-400">ממתין להעברה</p>
            </div>
          </div>
          <div className="flex justify-between text-xs text-gray-500">
            <span className="text-blue-600">₪{creditTransferred.toFixed(2)} הועבר</span>
          </div>
        </div>
      </div>

      {/* Sub-tabs */}
      <div className="bg-white rounded-xl shadow">
        <div className="flex border-b">
          {([
            { id: 'list', label: 'כל העסקאות' },
            { id: 'approvals', label: 'אישורים מיוחדים' },
            { id: 'nedarim', label: 'שאיבת נדרים' },
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
          {subTab === 'list' && <TransactionsList />}
          {subTab === 'approvals' && <SpecialApprovals />}
          {subTab === 'nedarim' && <NedarimData />}
        </div>
      </div>
    </div>
  );
}

function NedarimData() {
  const settings = useStore(s => s.settings);
  return (
    <div className="text-center py-8 space-y-3">
      <RefreshCw size={36} className="mx-auto text-gray-300" />
      <p className="text-gray-500 font-medium">שאיבת נתונים מנדרים פלוס</p>
      {settings.nedarimInstitutionCode ? (
        <a
          href={`https://www.nedarim.co.il/organizations/reports/?mosad=${settings.nedarimInstitutionCode}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 bg-blue-700 text-white px-5 py-2.5 rounded-lg hover:bg-blue-800 transition text-sm font-semibold"
        >
          פתח דוחות נדרים פלוס
        </a>
      ) : (
        <p className="text-sm text-yellow-600 bg-yellow-50 border border-yellow-200 rounded-lg px-4 py-2 inline-block">
          הגדר קוד מוסד בהגדרות תחילה
        </p>
      )}
    </div>
  );
}
