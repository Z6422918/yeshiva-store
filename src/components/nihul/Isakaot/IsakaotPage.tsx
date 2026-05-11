import { useState } from 'react';
import { useStore } from '../../../store/useStore';
import { ArrowDownToLine, RefreshCw } from 'lucide-react';
import SpecialApprovals from './SpecialApprovals';
import TransactionsList from './TransactionsList';

type SubTab = 'approvals' | 'nedarim' | 'list';

const NAVY = '#1e3166';

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

  // Stat cards data
  const stats = [
    { emoji: '💵', val: `₪${(cashPending + cashTransferred).toFixed(0)}`, label: 'קניות מזומן', sub: 'סה"כ', subColor: '#4caf50' },
    { emoji: '🏦', val: `₪${cashTransferred.toFixed(0)}`, label: 'הועבר לכספת', sub: 'מזומן', subColor: '#5c6bc0' },
    { emoji: '💳', val: `₪${(creditPending + creditTransferred).toFixed(0)}`, label: 'קניות אשראי', sub: 'סה"כ', subColor: '#e65100' },
    { emoji: '📥', val: `₪${creditTransferred.toFixed(0)}`, label: 'נמשך לכספת', sub: 'אשראי', subColor: '#9c27b0' },
  ];

  return (
    <div className="space-y-4">

      {/* ── STAT CARDS ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14 }}>
        {stats.map((s, i) => (
          <div key={i} style={{ background: '#fff', borderRadius: 18, padding: '18px 16px', boxShadow: '0 2px 14px rgba(26,35,126,0.07)', border: '1px solid #eaecf5', textAlign: 'center' }}>
            <div style={{ fontSize: 28, marginBottom: 8 }}>{s.emoji}</div>
            <div style={{ fontSize: 22, fontWeight: 900, color: NAVY, lineHeight: 1 }}>{s.val}</div>
            <div style={{ fontSize: 11, color: '#aab', fontWeight: 600, marginTop: 5 }}>{s.label}</div>
            <div style={{ fontSize: 11, fontWeight: 700, marginTop: 4, color: s.subColor }}>{s.sub}</div>
          </div>
        ))}
      </div>

      {/* ── TRANSFER ACTIONS ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        {[
          { source: 'cash' as const, label: 'מזומן', pending: cashPending, color: '#4caf50', bgLight: '#f0faf0', borderColor: '#a5d6a7' },
          { source: 'credit' as const, label: 'אשראי', pending: creditPending, color: '#1565c0', bgLight: '#e3f2fd', borderColor: '#90caf9' },
        ].map(item => (
          <div key={item.source} style={{ background: item.bgLight, borderRadius: 18, padding: '16px 20px', border: `1.5px solid ${item.borderColor}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <button
              onClick={() => handleTransfer(item.source)}
              disabled={item.pending <= 0}
              className="flex items-center gap-2 text-white text-sm font-bold px-4 py-2 rounded-xl transition-all duration-150 hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
              style={{ background: item.color }}
            >
              <ArrowDownToLine size={14} />
              העבר לכספת
            </button>
            <div className="text-right">
              <p className="text-sm font-black" style={{ color: item.color }}>₪{item.pending.toFixed(2)}</p>
              <p className="text-xs" style={{ color: '#aaa', marginTop: 2 }}>ממתין — {item.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── MAIN CARD WITH SUB-TABS ── */}
      <div style={{ background: '#fff', borderRadius: 20, boxShadow: '0 2px 14px rgba(26,35,126,0.07)', border: '1px solid #eaecf5', overflow: 'hidden' }}>

        {/* Inner tabs (pill style) */}
        <div style={{ display: 'flex', gap: 6, padding: '14px 20px', borderBottom: '1px solid #f0f2fa' }}>
          {([
            { id: 'list', label: '📋 רשימת עסקאות' },
            { id: 'approvals', label: '✅ אישורים מיוחדים' },
            { id: 'nedarim', label: '🔄 שאיבת נדרים פלוס' },
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
    <div className="text-center py-8 space-y-4">
      <div style={{ background: '#f0f4ff', borderRadius: 16, padding: 24, display: 'inline-block', minWidth: 320 }}>
        <div style={{ fontSize: 36, marginBottom: 10 }}>🔄</div>
        <div style={{ fontSize: 15, fontWeight: 800, color: NAVY, marginBottom: 6 }}>שאיבת נתוני נדרים פלוס</div>
        <div style={{ fontSize: 12, color: '#9fa8da', marginBottom: 16 }}>יש להגדיר קוד מוסד בהגדרות</div>
        {settings.nedarimInstitutionCode ? (
          <a
            href={`https://www.nedarim.co.il/organizations/reports/?mosad=${settings.nedarimInstitutionCode}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-white text-sm font-bold px-5 py-2.5 rounded-xl hover:opacity-90 transition"
            style={{ background: NAVY }}
          >
            <RefreshCw size={15} />
            פתח דוחות נדרים פלוס
          </a>
        ) : (
          <p className="text-sm font-semibold" style={{ color: '#e65100', background: '#fff3e0', borderRadius: 10, padding: '8px 16px' }}>
            הגדר קוד מוסד בהגדרות תחילה
          </p>
        )}
      </div>
    </div>
  );
}
