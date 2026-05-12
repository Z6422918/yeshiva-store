import { useState, useMemo } from 'react';
import { useStore } from '../../../store/useStore';
import { Banknote, CreditCard, ShieldCheck, Receipt, Database } from 'lucide-react';
import { Card } from '../../ui/card';
import { Badge } from '../../ui/badge';
import { cn } from '../../../lib/utils';
import SpecialApprovals from './SpecialApprovals';
import type { Transaction } from '../../../types';

// ─── Colors ────────────────────────────────────────────────────────────────────
const NAVY    = '#1e3166';
const INDIGO  = '#5c6bc0';
const BORDER  = '#eaecf5';
const ROW_BORDER = '#f4f6fb';
const TH_COLOR   = '#9fa8da';
const THEAD_BG   = '#f8f9fd';
const HOVER_BG   = '#fafbff';

type SubTab = 'list' | 'approvals' | 'nedarim';

const subTabs: { value: SubTab; label: string; Icon: typeof Receipt }[] = [
  { value: 'list',      label: 'עסקאות',             Icon: Receipt },
  { value: 'approvals', label: 'אישורים',            Icon: ShieldCheck },
  { value: 'nedarim',   label: 'אשראי - נדרים פלוס', Icon: Database },
];

// ─── Nedarim Tab ───────────────────────────────────────────────────────────────
function NedarimTab() {
  const settings = useStore(s => s.settings);
  const hasCode  = !!settings.nedarimInstitutionCode;
  return (
    <Card className="p-0 overflow-hidden">
      <div style={{ padding: 24, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div style={{
          background: '#f0f4ff', borderRadius: 16, padding: 32,
          textAlign: 'center', width: '100%', maxWidth: 400,
        }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>🔄</div>
          <div style={{ fontSize: 15, fontWeight: 800, color: NAVY, marginBottom: 6 }}>
            שאיבת נתוני נדרים פלוס
          </div>
          <div style={{ fontSize: 12, color: TH_COLOR, marginBottom: 20 }}>
            {hasCode
              ? `קוד מוסד: ${settings.nedarimInstitutionCode}`
              : 'יש להגדיר קוד מוסד בהגדרות'}
          </div>
          {hasCode ? (
            <a
              href={`https://www.nedarim.co.il/organizations/reports/?mosad=${settings.nedarimInstitutionCode}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                padding: '10px 22px', borderRadius: 12, border: 'none',
                fontSize: 13, fontWeight: 700, cursor: 'pointer',
                background: NAVY, color: '#fff',
                boxShadow: '0 4px 12px rgba(30,49,102,0.25)',
                textDecoration: 'none', fontFamily: 'inherit',
              }}
            >
              פתח דוחות נדרים פלוס
            </a>
          ) : (
            <button
              disabled
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                padding: '10px 22px', borderRadius: 12, border: 'none',
                fontSize: 13, fontWeight: 700,
                background: '#c5cae9', color: '#fff',
                cursor: 'not-allowed', fontFamily: 'inherit',
              }}
            >
              פתח דוחות נדרים פלוס
            </button>
          )}
        </div>
      </div>
    </Card>
  );
}

// ─── Transactions List Tab ─────────────────────────────────────────────────────
function TxListTab({ transactions }: { transactions: Transaction[] }) {
  const fmtDate = (iso: string) => {
    const d = new Date(iso);
    return `${d.getDate().toString().padStart(2,'0')}/${(d.getMonth()+1).toString().padStart(2,'0')}`;
  };
  const fmtTime = (iso: string) => {
    const d = new Date(iso);
    return `${d.getHours().toString().padStart(2,'0')}:${d.getMinutes().toString().padStart(2,'0')}`;
  };

  const thS: React.CSSProperties = {
    textAlign: 'right', padding: '10px 14px',
    fontSize: 11, fontWeight: 800, color: TH_COLOR,
    borderBottom: `1px solid ${BORDER}`, whiteSpace: 'nowrap',
    background: THEAD_BG,
  };
  const tdS: React.CSSProperties = {
    padding: '10px 14px', fontSize: 13, color: '#333',
    fontWeight: 500, verticalAlign: 'middle',
  };

  if (transactions.length === 0)
    return <Card className="p-8 text-center text-muted-foreground">אין עסקאות</Card>;

  return (
    <Card className="p-0 overflow-hidden">
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              {['תאריך','שעה','סכום','קונה','תשלום','פריטים'].map(h => (
                <th key={h} style={thS}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[...transactions].sort((a,b) => b.date.localeCompare(a.date)).map((tx, i, arr) => (
              <tr
                key={tx.id}
                style={{ borderBottom: i < arr.length-1 ? `1px solid ${ROW_BORDER}` : 'none' }}
                onMouseEnter={e => e.currentTarget.querySelectorAll('td').forEach(td => (td.style.background = HOVER_BG))}
                onMouseLeave={e => e.currentTarget.querySelectorAll('td').forEach(td => (td.style.background = ''))}
              >
                <td style={tdS}>{fmtDate(tx.date)}</td>
                <td style={{ ...tdS, color: TH_COLOR }}>{fmtTime(tx.date)}</td>
                <td style={{ ...tdS, fontWeight: 900, color: '#2e7d32' }}>₪{tx.totalAmount.toFixed(2)}</td>
                <td style={tdS}>
                  {tx.buyerType === 'yeshiva'
                    ? <span style={{ display:'inline-flex', alignItems:'center', padding:'3px 10px', borderRadius:20, fontSize:11, fontWeight:700, background:'#eef0fb', color:NAVY }}>💙 ישיבה</span>
                    : <span style={{ display:'inline-flex', alignItems:'center', padding:'3px 10px', borderRadius:20, fontSize:11, fontWeight:700, background:'#f0f2f8', color:'#666' }}>🧑 חיצוני</span>}
                </td>
                <td style={tdS}>
                  {tx.paymentMethod === 'cash'
                    ? <span style={{ display:'inline-flex', alignItems:'center', padding:'3px 10px', borderRadius:20, fontSize:11, fontWeight:700, background:'#e8f5e9', color:'#2e7d32' }}>💵 מזומן</span>
                    : tx.paymentMethod === 'credit'
                    ? <span style={{ display:'inline-flex', alignItems:'center', padding:'3px 10px', borderRadius:20, fontSize:11, fontWeight:700, background:'#eef0fb', color:INDIGO }}>💳 אשראי</span>
                    : <span style={{ display:'inline-flex', alignItems:'center', padding:'3px 10px', borderRadius:20, fontSize:11, fontWeight:700, background:'#fff3e0', color:'#e65100' }}>🔐 מיוחד</span>}
                </td>
                <td style={{ ...tdS, fontWeight: 700 }}>{tx.items.length}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function IsakaotPage() {
  const { transactions, getCashNotTransferred, getCreditNotTransferred, safeEntries } = useStore();
  const [active, setActive] = useState<SubTab>('list');

  const cashNotTransferred   = getCashNotTransferred();
  const creditNotTransferred = getCreditNotTransferred();

  const totalCash   = useMemo(() => transactions.filter(t => t.paymentMethod === 'cash').reduce((s,t) => s+t.totalAmount, 0), [transactions]);
  const totalCredit = useMemo(() => transactions.filter(t => t.paymentMethod === 'credit').reduce((s,t) => s+t.totalAmount, 0), [transactions]);
  const cashToSafe   = safeEntries.filter(e => e.source === 'cash'   && e.type === 'income').reduce((s,e) => s+e.amount, 0);
  const creditToSafe = safeEntries.filter(e => e.source === 'credit' && e.type === 'income').reduce((s,e) => s+e.amount, 0);

  return (
    <div className="space-y-4" dir="rtl">

      {/* ── Two summary cards ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">

        {/* מזומן */}
        <Card className="p-4 border-green-200">
          <div className="flex items-center gap-2 mb-3">
            <Banknote className="w-4 h-4 text-green-600" />
            <h4 className="font-bold text-sm">מזומן</h4>
          </div>
          <div className="space-y-1.5 text-sm">
            <div className="flex justify-between">
              <span className="font-semibold">₪{totalCash.toFixed(2)}</span>
              <span className="text-muted-foreground">סך עסקאות</span>
            </div>
            <div className="flex justify-between">
              <span className="font-semibold text-green-600">₪{cashToSafe.toFixed(2)}</span>
              <span className="text-muted-foreground">הכנסות לכספת</span>
            </div>
            <div className="flex justify-between pt-1.5 border-t font-bold">
              <span>₪{cashNotTransferred.toFixed(2)}</span>
              <span>מאזן</span>
            </div>
          </div>
        </Card>

        {/* אשראי */}
        <Card className="p-4 border-primary/30">
          <div className="flex items-center gap-2 mb-3">
            <CreditCard className="w-4 h-4 text-primary" />
            <h4 className="font-bold text-sm">אשראי</h4>
          </div>
          <div className="space-y-1.5 text-sm">
            <div className="flex justify-between">
              <span className="font-semibold">₪{totalCredit.toFixed(2)}</span>
              <span className="text-muted-foreground">סך עסקאות</span>
            </div>
            <div className="flex justify-between">
              <span className="font-semibold text-green-600">₪{creditToSafe.toFixed(2)}</span>
              <span className="text-muted-foreground">הכנסות לכספת</span>
            </div>
            <div className="flex justify-between pt-1.5 border-t font-bold">
              <span>₪{creditNotTransferred.toFixed(2)}</span>
              <span>מאזן</span>
            </div>
          </div>
        </Card>

      </div>

      {/* ── Tab bar ── */}
      <div className="grid grid-cols-3 gap-1 bg-muted p-1 rounded-lg">
        {subTabs.map(({ value, label, Icon }) => (
          <button
            key={value}
            onClick={() => setActive(value)}
            className={cn(
              'inline-flex items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-all',
              active === value
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <Icon className="w-4 h-4" /> {label}
          </button>
        ))}
      </div>

      {/* ── Tab content ── */}
      {active === 'list'      && <TxListTab transactions={transactions} />}
      {active === 'approvals' && <SpecialApprovals />}
      {active === 'nedarim'   && <NedarimTab />}

    </div>
  );
}
