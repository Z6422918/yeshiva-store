import { useState, useMemo } from 'react';
import { useStore } from '../../../store/useStore';
import SpecialApprovals from './SpecialApprovals';
import type { Transaction } from '../../../types';

// ─── Colors ────────────────────────────────────────────────────────────────────
const NAVY   = '#1e3166';
const INDIGO = '#5c6bc0';
const TH_COLOR  = '#9fa8da';
const THEAD_BG  = '#f8f9fd';
const BORDER    = '#eaecf5';
const ROW_BORDER = '#f4f6fb';
const HOVER_BG  = '#fafbff';

type InnerTab = 'txlist' | 'app' | 'nedarim';

// ─── Transaction list ──────────────────────────────────────────────────────────
function TxList({ transactions }: { transactions: Transaction[] }) {
  const fmtDate = (iso: string) => {
    const d = new Date(iso);
    return `${d.getDate().toString().padStart(2,'0')}/${(d.getMonth()+1).toString().padStart(2,'0')}`;
  };
  const fmtTime = (iso: string) => {
    const d = new Date(iso);
    return `${d.getHours().toString().padStart(2,'0')}:${d.getMinutes().toString().padStart(2,'0')}`;
  };

  const thS: React.CSSProperties = {
    textAlign: 'right', padding: '12px 14px',
    fontSize: 11, fontWeight: 800, color: TH_COLOR,
    borderBottom: `1px solid ${BORDER}`, whiteSpace: 'nowrap',
  };
  const tdS = (isLast: boolean): React.CSSProperties => ({
    padding: '12px 14px', fontSize: 13, color: '#333',
    fontWeight: 500, verticalAlign: 'middle',
    borderBottom: isLast ? 'none' : `1px solid ${ROW_BORDER}`,
  });

  if (transactions.length === 0)
    return <div style={{ textAlign: 'center', padding: '32px', color: TH_COLOR, fontSize: 13 }}>אין עסקאות</div>;

  const sorted = [...transactions].sort((a,b) => b.date.localeCompare(a.date));

  return (
    <div style={{ overflowX: 'auto', borderRadius: '0 0 20px 20px' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ background: THEAD_BG }}>
            {['תאריך','שעה','סכום','קונה','תשלום','פריטים'].map(h => (
              <th key={h} style={thS}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sorted.map((tx, i) => {
            const isLast = i === sorted.length - 1;
            return (
            <tr
              key={tx.id}
              onMouseEnter={e => e.currentTarget.querySelectorAll('td').forEach(td => (td.style.background = HOVER_BG))}
              onMouseLeave={e => e.currentTarget.querySelectorAll('td').forEach(td => (td.style.background = ''))}
            >
              <td style={tdS(isLast)}>{fmtDate(tx.date)}</td>
              <td style={{ ...tdS(isLast), color: TH_COLOR }}>{fmtTime(tx.date)}</td>
              <td style={{ ...tdS(isLast), fontWeight: 900, color: '#2e7d32' }}>₪{tx.totalAmount.toFixed(2)}</td>
              <td style={tdS(isLast)}>
                {tx.buyerType === 'yeshiva'
                  ? <span style={{ display:'inline-flex', alignItems:'center', padding:'3px 10px', borderRadius:20, fontSize:11, fontWeight:700, background:'#eef0fb', color:NAVY }}>💙 ישיבה</span>
                  : <span style={{ display:'inline-flex', alignItems:'center', padding:'3px 10px', borderRadius:20, fontSize:11, fontWeight:700, background:'#f0f2f8', color:'#666' }}>🧑 חיצוני</span>}
              </td>
              <td style={tdS(isLast)}>
                {tx.paymentMethod === 'cash'
                  ? <span style={{ display:'inline-flex', alignItems:'center', padding:'3px 10px', borderRadius:20, fontSize:11, fontWeight:700, background:'#e8f5e9', color:'#2e7d32' }}>💵 מזומן</span>
                  : tx.paymentMethod === 'credit'
                  ? <span style={{ display:'inline-flex', alignItems:'center', padding:'3px 10px', borderRadius:20, fontSize:11, fontWeight:700, background:'#eef0fb', color:NAVY }}>💳 אשראי</span>
                  : <span style={{ display:'inline-flex', alignItems:'center', padding:'3px 10px', borderRadius:20, fontSize:11, fontWeight:700, background:'#fff3e0', color:'#e65100' }}>🔐 מיוחד</span>}
              </td>
              <td style={{ ...tdS(isLast), fontWeight: 700 }}>{tx.items.length}</td>
            </tr>
          )})}
        </tbody>
      </table>
    </div>
  );
}

// ─── Nedarim tab ───────────────────────────────────────────────────────────────
function NedarimTab() {
  const settings = useStore(s => s.settings);
  const hasCode  = !!settings.nedarimInstitutionCode;
  return (
    <div style={{ background:'#f0f4ff', borderRadius:16, padding:24, textAlign:'center' }}>
      <div style={{ fontSize:36, marginBottom:10 }}>🔄</div>
      <div style={{ fontSize:15, fontWeight:800, color:NAVY, marginBottom:6 }}>שאיבת נתוני נדרים פלוס</div>
      <div style={{ fontSize:12, color:TH_COLOR, marginBottom:16 }}>
        {hasCode ? `קוד מוסד: ${settings.nedarimInstitutionCode}` : 'יש להגדיר קוד מוסד בהגדרות'}
      </div>
      {hasCode ? (
        <a
          href={`https://www.nedarim.co.il/organizations/reports/?mosad=${settings.nedarimInstitutionCode}`}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display:'inline-flex', alignItems:'center', gap:8,
            padding:'10px 22px', borderRadius:12, border:'none',
            fontSize:13, fontWeight:700, cursor:'pointer',
            background:NAVY, color:'#fff',
            boxShadow:'0 4px 12px rgba(30,49,102,0.25)',
            textDecoration:'none', fontFamily:"'Heebo', sans-serif",
          }}
        >
          פתח דוחות נדרים פלוס
        </a>
      ) : (
        <button
          disabled
          style={{
            display:'inline-flex', alignItems:'center', gap:8,
            padding:'10px 22px', borderRadius:12, border:'none',
            fontSize:13, fontWeight:700,
            background:'#c5cae9', color:'#fff',
            cursor:'not-allowed', fontFamily:"'Heebo', sans-serif",
          }}
        >
          פתח דוחות נדרים פלוס
        </button>
      )}
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function IsakaotPage() {
  const {
    transactions, safeEntries,
    getCashNotTransferred, getCreditNotTransferred,
    transferToSafe,
  } = useStore();

  const [active, setActive] = useState<InnerTab>('txlist');

  const totalCash    = useMemo(() => transactions.filter(t => t.paymentMethod === 'cash').reduce((s,t) => s+t.totalAmount, 0), [transactions]);
  const totalCredit  = useMemo(() => transactions.filter(t => t.paymentMethod === 'credit').reduce((s,t) => s+t.totalAmount, 0), [transactions]);
  const cashToSafe   = safeEntries.filter(e => e.source === 'cash'   && e.type === 'income').reduce((s,e) => s+e.amount, 0);
  const creditToSafe = safeEntries.filter(e => e.source === 'credit' && e.type === 'income').reduce((s,e) => s+e.amount, 0);

  const cashPending   = getCashNotTransferred();
  const creditPending = getCreditNotTransferred();

  const handleTransfer = (src: 'cash' | 'credit') => {
    const pending = src === 'cash' ? cashPending : creditPending;
    if (pending <= 0) return;
    const ids = transactions.filter(t => t.paymentMethod === src && !t.transferredToSafe).map(t => t.id);
    transferToSafe(src, ids, pending);
  };

  const innerTabStyle = (val: InnerTab): React.CSSProperties => ({
    padding: '7px 18px',
    borderRadius: 12,
    border: 'none',
    fontSize: 12,
    fontWeight: 700,
    cursor: 'pointer',
    transition: 'all .2s',
    fontFamily: "'Heebo', sans-serif",
    background: active === val ? NAVY : '#f0f2f8',
    color: active === val ? '#fff' : TH_COLOR,
    boxShadow: active === val ? '0 3px 10px rgba(30,49,102,0.25)' : 'none',
  });

  return (
    <div style={{ direction: 'rtl' }}>

      {/* ── 4 stat cards ── */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:14, marginBottom:18 }}>
        {[
          { emoji:'💵', val:`₪${totalCash.toFixed(2)}`,   label:'קניות מזומן',    sub:'סה"כ',  subColor:'#4caf50' },
          { emoji:'🏦', val:`₪${cashToSafe.toFixed(2)}`,  label:'הועבר לכספת',   sub:'מזומן', subColor:'#5c6bc0' },
          { emoji:'💳', val:`₪${totalCredit.toFixed(2)}`, label:'קניות אשראי',   sub:'סה"כ',  subColor:'#e65100' },
          { emoji:'📥', val:`₪${creditToSafe.toFixed(2)}`,label:'נמשך לכספת',    sub:'אשראי', subColor:'#9c27b0' },
        ].map(({ emoji, val, label, sub, subColor }) => (
          <div key={label} style={{
            background:'#fff', borderRadius:18, padding:'18px 16px',
            boxShadow:'0 2px 14px rgba(26,35,126,0.07)', border:`1px solid ${BORDER}`, textAlign:'center',
          }}>
            <div style={{ fontSize:28, marginBottom:8 }}>{emoji}</div>
            <div style={{ fontSize:22, fontWeight:900, color:NAVY, lineHeight:1 }}>{val}</div>
            <div style={{ fontSize:11, color:'#aab', fontWeight:600, marginTop:5 }}>{label}</div>
            <div style={{ fontSize:11, fontWeight:700, marginTop:4, color:subColor }}>{sub}</div>
          </div>
        ))}
      </div>

      {/* ── Transfer buttons ── */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:18 }}>
        {/* Cash */}
        <div style={{
          background:'#f0faf0', borderRadius:18, padding:'16px 20px',
          border:'1.5px solid #a5d6a7', display:'flex', alignItems:'center', justifyContent:'space-between',
        }}>
          <button
            onClick={() => handleTransfer('cash')}
            disabled={cashPending <= 0}
            style={{
              display:'inline-flex', alignItems:'center', gap:7,
              padding:'10px 18px', borderRadius:12, border:'none',
              fontSize:13, fontWeight:700, cursor: cashPending > 0 ? 'pointer' : 'not-allowed',
              fontFamily:"'Heebo', sans-serif", whiteSpace:'nowrap',
              background: cashPending > 0 ? '#4caf50' : '#a5d6a7',
              color:'#fff',
              boxShadow: cashPending > 0 ? '0 4px 10px rgba(76,175,80,0.3)' : 'none',
              transition:'all .2s',
            }}
          >
            ↓ העבר לכספת
          </button>
          <div style={{ textAlign:'right' }}>
            <div style={{ fontSize:14, fontWeight:900, color:'#2e7d32' }}>₪{cashPending.toFixed(2)}</div>
            <div style={{ fontSize:11, color:'#aaa', marginTop:2 }}>ממתין — מזומן</div>
          </div>
        </div>
        {/* Credit */}
        <div style={{
          background:'#e3f2fd', borderRadius:18, padding:'16px 20px',
          border:'1.5px solid #90caf9', display:'flex', alignItems:'center', justifyContent:'space-between',
        }}>
          <button
            onClick={() => handleTransfer('credit')}
            disabled={creditPending <= 0}
            style={{
              display:'inline-flex', alignItems:'center', gap:7,
              padding:'10px 18px', borderRadius:12, border:'none',
              fontSize:13, fontWeight:700, cursor: creditPending > 0 ? 'pointer' : 'not-allowed',
              fontFamily:"'Heebo', sans-serif", whiteSpace:'nowrap',
              background: creditPending > 0 ? '#1565c0' : '#90caf9',
              color:'#fff',
              boxShadow: creditPending > 0 ? '0 4px 10px rgba(21,101,192,0.3)' : 'none',
              transition:'all .2s',
            }}
          >
            ↓ העבר לכספת
          </button>
          <div style={{ textAlign:'right' }}>
            <div style={{ fontSize:14, fontWeight:900, color:'#1565c0' }}>₪{creditPending.toFixed(2)}</div>
            <div style={{ fontSize:11, color:'#aaa', marginTop:2 }}>ממתין — אשראי</div>
          </div>
        </div>
      </div>

      {/* ── Main card ── */}
      <div style={{
        background:'#fff', borderRadius:20,
        boxShadow:'0 2px 14px rgba(26,35,126,0.07)', border:`1px solid ${BORDER}`,
        overflow:'visible',
      }}>
        <div style={{ overflow:'hidden', borderRadius:20 }}>

          {/* inner tabs */}
          <div style={{ display:'flex', gap:6, padding:'16px 20px', borderBottom:'1px solid #f0f2fa' }}>
            <button style={innerTabStyle('txlist')} onClick={() => setActive('txlist')}>📋 רשימת עסקאות</button>
            <button style={innerTabStyle('app')}    onClick={() => setActive('app')}>✅ אישורים מיוחדים</button>
            <button style={innerTabStyle('nedarim')} onClick={() => setActive('nedarim')}>🔄 שאיבת נדרים פלוס</button>
          </div>

          {/* tab content */}
          {active === 'txlist' && (
            <div style={{ padding:20 }}>
              <TxList transactions={transactions} />
            </div>
          )}
          {active === 'app' && (
            <div style={{ padding:20 }}>
              <SpecialApprovals />
            </div>
          )}
          {active === 'nedarim' && (
            <div style={{ padding:20 }}>
              <NedarimTab />
            </div>
          )}

        </div>
      </div>

    </div>
  );
}
