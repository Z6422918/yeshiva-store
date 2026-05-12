import { useState, useMemo } from 'react';
import { useStore } from '../../../store/useStore';
import SpecialApprovals from './SpecialApprovals';
import type { Transaction } from '../../../types';

// ─── Exact reference colors ────────────────────────────────────────────────────
const NAVY    = '#1e3166';
const INDIGO  = '#5c6bc0';
const BORDER  = '#eaecf5';
const ROW_BORDER = '#f4f6fb';
const TH_COLOR   = '#9fa8da';
const THEAD_BG   = '#f8f9fd';
const HOVER_BG   = '#fafbff';

// ─── Button styles ─────────────────────────────────────────────────────────────
const btnNavy = (bg?: string, shadow?: string): React.CSSProperties => ({
  display: 'inline-flex', alignItems: 'center', gap: 7,
  padding: '10px 18px', borderRadius: 12, border: 'none',
  fontSize: 13, fontWeight: 700, cursor: 'pointer',
  background: bg ?? NAVY, color: '#fff',
  boxShadow: shadow ?? '0 4px 12px rgba(30,49,102,0.25)',
  fontFamily: 'inherit', whiteSpace: 'nowrap' as const,
  transition: 'all .2s',
});

// ─── Badge helper ──────────────────────────────────────────────────────────────
function Badge({ children, bg, color }: { children: React.ReactNode; bg: string; color: string }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      padding: '3px 10px', borderRadius: 20,
      fontSize: 11, fontWeight: 700, background: bg, color,
    }}>{children}</span>
  );
}

// ─── Nedarim Plus Tab ──────────────────────────────────────────────────────────
function NedarimTab() {
  const settings = useStore(s => s.settings);
  const hasCode  = !!settings.nedarimInstitutionCode;
  return (
    <div style={{ padding: 20 }}>
      <div style={{
        background: '#f0f4ff', borderRadius: 16, padding: 24, textAlign: 'center',
      }}>
        <div style={{ fontSize: 36, marginBottom: 10 }}>🔄</div>
        <div style={{ fontSize: 15, fontWeight: 800, color: NAVY, marginBottom: 6 }}>
          שאיבת נתוני נדרים פלוס
        </div>
        <div style={{ fontSize: 12, color: TH_COLOR, marginBottom: 16 }}>
          {hasCode
            ? `קוד מוסד: ${settings.nedarimInstitutionCode}`
            : 'יש להגדיר קוד מוסד בהגדרות'}
        </div>
        {hasCode ? (
          <a
            href={`https://www.nedarim.co.il/organizations/reports/?mosad=${settings.nedarimInstitutionCode}`}
            target="_blank"
            rel="noopener noreferrer"
            style={btnNavy()}
          >
            פתח דוחות נדרים פלוס
          </a>
        ) : (
          <button style={btnNavy()} disabled>
            פתח דוחות נדרים פלוס
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Transaction List Tab ──────────────────────────────────────────────────────
function TxListTab({ transactions }: { transactions: Transaction[] }) {
  const fmtDate = (iso: string) => {
    const d = new Date(iso);
    const day   = d.getDate().toString().padStart(2, '0');
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    return `${day}/${month}`;
  };
  const fmtTime = (iso: string) => {
    const d = new Date(iso);
    const h  = d.getHours().toString().padStart(2, '0');
    const m  = d.getMinutes().toString().padStart(2, '0');
    return `${h}:${m}`;
  };

  const thStyle: React.CSSProperties = {
    textAlign: 'right', padding: '12px 14px',
    fontSize: 11, fontWeight: 800, color: TH_COLOR,
    borderBottom: `1px solid ${BORDER}`, whiteSpace: 'nowrap',
  };
  const tdStyle: React.CSSProperties = {
    padding: '12px 14px', fontSize: 13, color: '#333',
    fontWeight: 500, verticalAlign: 'middle',
    borderBottom: `1px solid ${ROW_BORDER}`,
  };

  if (transactions.length === 0) {
    return (
      <div style={{ padding: 20, textAlign: 'center', color: TH_COLOR, fontSize: 13 }}>
        אין עסקאות
      </div>
    );
  }

  return (
    <div style={{ padding: 20 }}>
      <div style={{ borderRadius: 12, border: `1px solid ${BORDER}`, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: THEAD_BG }}>
                {['תאריך', 'שעה', 'סכום', 'קונה', 'תשלום', 'פריטים'].map(h => (
                  <th key={h} style={thStyle}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[...transactions]
                .sort((a, b) => b.date.localeCompare(a.date))
                .map((tx, idx, arr) => (
                  <tr
                    key={tx.id}
                    style={{ borderBottom: idx < arr.length - 1 ? `1px solid ${ROW_BORDER}` : 'none' }}
                    onMouseEnter={e => e.currentTarget.querySelectorAll('td').forEach(td => (td.style.background = HOVER_BG))}
                    onMouseLeave={e => e.currentTarget.querySelectorAll('td').forEach(td => (td.style.background = ''))}
                  >
                    <td style={{ ...tdStyle, borderBottom: 'none' }}>{fmtDate(tx.date)}</td>
                    <td style={{ ...tdStyle, borderBottom: 'none', color: TH_COLOR }}>{fmtTime(tx.date)}</td>
                    <td style={{ ...tdStyle, borderBottom: 'none', fontWeight: 900, color: '#2e7d32' }}>
                      ₪{tx.totalAmount.toFixed(2)}
                    </td>
                    <td style={{ ...tdStyle, borderBottom: 'none' }}>
                      {tx.buyerType === 'yeshiva'
                        ? <Badge bg="#eef0fb" color={NAVY}>💙 ישיבה</Badge>
                        : <Badge bg="#f0f2f8" color="#666">🧑 חיצוני</Badge>}
                    </td>
                    <td style={{ ...tdStyle, borderBottom: 'none' }}>
                      {tx.paymentMethod === 'cash'
                        ? <Badge bg="#e8f5e9" color="#2e7d32">💵 מזומן</Badge>
                        : tx.paymentMethod === 'credit'
                        ? <Badge bg="#eef0fb" color={INDIGO}>💳 אשראי</Badge>
                        : <Badge bg="#fff3e0" color="#e65100">🔐 מיוחד</Badge>}
                    </td>
                    <td style={{ ...tdStyle, borderBottom: 'none', fontWeight: 700 }}>
                      {tx.items.length}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function IsakaotPage() {
  const { transactions, transferToSafe, getCashNotTransferred, getCreditNotTransferred, safeEntries } = useStore();
  const [activeTab, setActiveTab] = useState<'list' | 'approvals' | 'nedarim'>('list');

  const cashNotTransferred   = getCashNotTransferred();
  const creditNotTransferred = getCreditNotTransferred();

  const totalCash   = useMemo(() => transactions.filter(t => t.paymentMethod === 'cash').reduce((s, t) => s + t.totalAmount, 0), [transactions]);
  const totalCredit = useMemo(() => transactions.filter(t => t.paymentMethod === 'credit').reduce((s, t) => s + t.totalAmount, 0), [transactions]);
  const cashToSafe   = safeEntries.filter(e => e.source === 'cash'   && e.type === 'income').reduce((s, e) => s + e.amount, 0);
  const creditToSafe = safeEntries.filter(e => e.source === 'credit' && e.type === 'income').reduce((s, e) => s + e.amount, 0);

  const handleTransfer = (source: 'cash' | 'credit') => {
    const pending = transactions.filter(t => t.paymentMethod === source && !t.transferredToSafe);
    if (pending.length === 0) return;
    const amount = pending.reduce((s, t) => s + t.totalAmount, 0);
    transferToSafe(source, pending.map(t => t.id), amount);
  };

  // ── Stat card helper ──────────────────────────────────────────────────────────
  const StatCard = ({ emoji, val, label, subColor, sub }: {
    emoji: string; val: number; label: string; subColor: string; sub: string;
  }) => (
    <div style={{
      background: '#fff', borderRadius: 18, padding: '18px 16px',
      boxShadow: '0 2px 14px rgba(26,35,126,0.07)', border: `1px solid ${BORDER}`,
      textAlign: 'center',
    }}>
      <div style={{ fontSize: 28, marginBottom: 8 }}>{emoji}</div>
      <div style={{ fontSize: 22, fontWeight: 900, color: NAVY, lineHeight: 1 }}>
        ₪{val.toFixed(0)}
      </div>
      <div style={{ fontSize: 11, color: '#aab', fontWeight: 600, marginTop: 5 }}>{label}</div>
      <div style={{ fontSize: 11, fontWeight: 700, marginTop: 4, color: subColor }}>{sub}</div>
    </div>
  );

  // ── Inner tab button ─────────────────────────────────────────────────────────
  const InnerTab = ({ id, label }: { id: typeof activeTab; label: string }) => (
    <button
      onClick={() => setActiveTab(id)}
      style={{
        padding: '7px 18px', borderRadius: 12, border: 'none',
        fontSize: 12, fontWeight: 700, cursor: 'pointer',
        transition: 'all .2s', fontFamily: 'inherit',
        background: activeTab === id ? NAVY : '#f0f2f8',
        color:      activeTab === id ? '#fff' : TH_COLOR,
        boxShadow:  activeTab === id ? '0 3px 10px rgba(30,49,102,0.25)' : 'none',
      }}
    >{label}</button>
  );

  return (
    <div dir="rtl">

      {/* ── 4 Stat cards ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, marginBottom: 18 }}>
        <StatCard emoji="💵" val={totalCash}    label="קניות מזומן"   subColor="#4caf50" sub='סה"כ' />
        <StatCard emoji="🏦" val={cashToSafe}   label="הועבר לכספת"  subColor={INDIGO}  sub="מזומן" />
        <StatCard emoji="💳" val={totalCredit}  label="קניות אשראי"  subColor="#e65100" sub='סה"כ' />
        <StatCard emoji="📥" val={creditToSafe} label="נמשך לכספת"   subColor="#9c27b0" sub="אשראי" />
      </div>

      {/* ── Transfer buttons ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 18 }}>
        {/* Cash */}
        <div style={{
          background: '#f0faf0', borderRadius: 18, padding: '16px 20px',
          border: '1.5px solid #a5d6a7',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <button
            onClick={() => handleTransfer('cash')}
            style={btnNavy('#4caf50', '0 4px 10px rgba(76,175,80,0.3)')}
          >↓ העבר לכספת</button>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 14, fontWeight: 900, color: '#2e7d32' }}>₪{cashNotTransferred.toFixed(2)}</div>
            <div style={{ fontSize: 11, color: '#aaa', marginTop: 2 }}>ממתין — מזומן</div>
          </div>
        </div>
        {/* Credit */}
        <div style={{
          background: '#e3f2fd', borderRadius: 18, padding: '16px 20px',
          border: '1.5px solid #90caf9',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <button
            onClick={() => handleTransfer('credit')}
            style={btnNavy('#1565c0', '0 4px 10px rgba(21,101,192,0.3)')}
          >↓ העבר לכספת</button>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 14, fontWeight: 900, color: '#1565c0' }}>₪{creditNotTransferred.toFixed(2)}</div>
            <div style={{ fontSize: 11, color: '#aaa', marginTop: 2 }}>ממתין — אשראי</div>
          </div>
        </div>
      </div>

      {/* ── Main card with inner tabs ── */}
      <div style={{
        background: '#fff', borderRadius: 20,
        boxShadow: '0 2px 14px rgba(26,35,126,0.07)',
        border: `1px solid ${BORDER}`, overflow: 'visible',
      }}>
        <div style={{ borderRadius: 20, overflow: 'hidden' }}>

          {/* Inner tabs */}
          <div style={{
            display: 'flex', gap: 6, padding: '16px 20px',
            borderBottom: '1px solid #f0f2fa',
          }}>
            <InnerTab id="list"      label="📋 רשימת עסקאות" />
            <InnerTab id="approvals" label="✅ אישורים מיוחדים" />
            <InnerTab id="nedarim"   label="🔄 שאיבת נדרים פלוס" />
          </div>

          {/* Tab content */}
          {activeTab === 'list'      && <TxListTab transactions={transactions} />}
          {activeTab === 'approvals' && (
            <div style={{ padding: 20 }}>
              <SpecialApprovals />
            </div>
          )}
          {activeTab === 'nedarim'   && <NedarimTab />}

        </div>
      </div>

    </div>
  );
}
