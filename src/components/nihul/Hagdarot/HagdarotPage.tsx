import { useState } from 'react';
import { useStore } from '../../../store/useStore';
import { Plus, Trash2, Edit2, Save } from 'lucide-react';
import type { User, UserRole, Supplier, AgentType } from '../../../types';

const NAVY = '#1e3166';

export default function HagdarotPage() {
  const [activeSection, setActiveSection] = useState<'nedarim' | 'users' | 'suppliers'>('nedarim');

  const sections = [
    { id: 'nedarim' as const, label: '🔗 נדרים פלוס' },
    { id: 'users' as const, label: '👥 משתמשים' },
    { id: 'suppliers' as const, label: '🏭 ספקים' },
  ];

  return (
    <div className="space-y-4">

      {/* ── SECTION TABS ── */}
      <div style={{ display: 'flex', gap: 6, background: '#eef0f8', borderRadius: 16, padding: 5, width: 'fit-content' }}>
        {sections.map(s => (
          <button
            key={s.id}
            onClick={() => setActiveSection(s.id)}
            className="text-sm font-bold transition-all duration-200 px-6 py-2 rounded-xl"
            style={
              activeSection === s.id
                ? { background: '#fff', color: '#1a1a2e', boxShadow: '0 2px 8px rgba(30,49,102,0.12)', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }
                : { background: 'transparent', color: '#9fa8da', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }
            }
          >
            {s.label}
          </button>
        ))}
      </div>

      {activeSection === 'nedarim' && <NedarimSettings />}
      {activeSection === 'users' && <UsersSettings />}
      {activeSection === 'suppliers' && <SuppliersSettings />}
    </div>
  );
}

function SettingsCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ background: '#fff', borderRadius: 18, padding: 20, marginBottom: 14, border: '1px solid #eaecf5', boxShadow: '0 2px 12px rgba(26,35,126,0.06)' }}>
      <div style={{ fontSize: 14, fontWeight: 900, color: NAVY, marginBottom: 16 }}>{title}</div>
      {children}
    </div>
  );
}

function SettingRow({ label, sub, children }: { label: string; sub?: string; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #f4f6fb' }}>
      <div>
        <div style={{ fontSize: 13, fontWeight: 700, color: '#333' }}>{label}</div>
        {sub && <div style={{ fontSize: 11, color: '#bbb', marginTop: 2 }}>{sub}</div>}
      </div>
      {children}
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  border: '1.5px solid #e0e4f0',
  borderRadius: 11,
  padding: '8px 13px',
  fontSize: 13,
  fontFamily: 'inherit',
  color: '#333',
  outline: 'none',
  width: 220,
  textAlign: 'right',
  background: '#fafbff',
  transition: 'border .2s',
};

function NedarimSettings() {
  const { settings, updateSettings } = useStore();
  const [form, setForm] = useState({ ...settings });
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings(form);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <form onSubmit={handleSave}>
      <SettingsCard title="🔗 חיבור נדרים פלוס">
        <SettingRow label="שם החנות">
          <input
            style={inputStyle}
            value={form.storeName}
            onChange={e => setForm(p => ({ ...p, storeName: e.target.value }))}
          />
        </SettingRow>
        <SettingRow label="קוד מוסד" sub="מזהה הישיבה בנדרים פלוס">
          <input
            style={inputStyle}
            value={form.nedarimInstitutionCode}
            onChange={e => setForm(p => ({ ...p, nedarimInstitutionCode: e.target.value }))}
            placeholder="IL-12345"
          />
        </SettingRow>
        <SettingRow label="מפתח API" sub="סודי – אל תשתף">
          <input
            type="password"
            style={inputStyle}
            value={form.nedarimApiKey}
            onChange={e => setForm(p => ({ ...p, nedarimApiKey: e.target.value }))}
          />
        </SettingRow>
        <div style={{ marginTop: 16 }}>
          <button
            type="submit"
            className="flex items-center gap-2 text-white text-sm font-bold px-5 py-2.5 rounded-xl transition-all duration-150 hover:opacity-90"
            style={{ background: saved ? '#4caf50' : NAVY, boxShadow: '0 4px 12px rgba(30,49,102,0.2)' }}
          >
            <Save size={15} />
            {saved ? '✓ נשמר!' : 'שמור הגדרות'}
          </button>
        </div>
      </SettingsCard>
    </form>
  );
}

function UsersSettings() {
  const { users, addUser, updateUser, deleteUser, currentUser } = useStore();
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', username: '', password: '', role: 'kupa' as UserRole });

  const roleLabels: Record<UserRole, string> = {
    kupa: 'קופה בלבד',
    manager: 'מנהל',
    admin: 'מנהל ראשי',
  };

  const roleBadge: Record<UserRole, { bg: string; color: string }> = {
    kupa: { bg: '#e8f5e9', color: '#2e7d32' },
    manager: { bg: '#eef0fb', color: NAVY },
    admin: { bg: '#f3e5f5', color: '#6a1b9a' },
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editId) { updateUser(editId, form); setEditId(null); }
    else addUser(form);
    setForm({ name: '', username: '', password: '', role: 'kupa' });
    setShowForm(false);
  };

  const startEdit = (u: User) => {
    setForm({ name: u.name, username: u.username, password: u.password, role: u.role });
    setEditId(u.id);
    setShowForm(true);
  };

  return (
    <SettingsCard title="👥 ניהול משתמשים">
      <div style={{ marginBottom: 14 }}>
        <button
          onClick={() => { setShowForm(!showForm); setEditId(null); setForm({ name: '', username: '', password: '', role: 'kupa' }); }}
          className="flex items-center gap-2 text-white text-sm font-bold px-4 py-2.5 rounded-xl hover:opacity-90 transition"
          style={{ background: NAVY }}
        >
          <Plus size={14} /> הוסף משתמש
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} style={{ background: '#eef0fb', borderRadius: 14, padding: 16, marginBottom: 14, border: '1.5px solid #c5cae9' }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: NAVY, marginBottom: 12, textAlign: 'right' }}>
            {editId ? 'עריכת משתמש' : 'משתמש חדש'}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
            {[
              { key: 'name', label: 'שם מלא', type: 'text' },
              { key: 'username', label: 'שם משתמש', type: 'text' },
              { key: 'password', label: 'סיסמה', type: 'password' },
            ].map(f => (
              <div key={f.key}>
                <label style={{ display: 'block', fontSize: 11, color: '#666', marginBottom: 4, textAlign: 'right' }}>{f.label}</label>
                <input
                  type={f.type}
                  value={form[f.key as keyof typeof form] as string}
                  onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                  required
                  style={{ ...inputStyle, width: '100%' }}
                />
              </div>
            ))}
            <div>
              <label style={{ display: 'block', fontSize: 11, color: '#666', marginBottom: 4, textAlign: 'right' }}>תפקיד</label>
              <select
                value={form.role}
                onChange={e => setForm(p => ({ ...p, role: e.target.value as UserRole }))}
                style={{ ...inputStyle, width: '100%', cursor: 'pointer' }}
              >
                {Object.entries(roleLabels).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button type="button" onClick={() => { setShowForm(false); setEditId(null); }}
              style={{ flex: 1, padding: '8px', border: '1.5px solid #e0e4f0', borderRadius: 10, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit', background: '#fff' }}>
              ביטול
            </button>
            <button type="submit"
              style={{ flex: 1, padding: '8px', background: NAVY, color: '#fff', border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
              שמור
            </button>
          </div>
        </form>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {users.map(u => {
          const rb = roleBadge[u.role];
          return (
            <div key={u.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#f8f9fd', borderRadius: 14, padding: '12px 16px' }}>
              <div style={{ display: 'flex', gap: 6 }}>
                {u.id !== currentUser?.id && (
                  <button onClick={() => { if (window.confirm('למחוק משתמש זה?')) deleteUser(u.id); }}
                    style={{ width: 28, height: 28, borderRadius: 8, border: 'none', cursor: 'pointer', background: '#ffebee', color: '#e57373', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Trash2 size={13} />
                  </button>
                )}
                <button onClick={() => startEdit(u)}
                  style={{ width: 28, height: 28, borderRadius: 8, border: 'none', cursor: 'pointer', background: '#eef0fb', color: '#5c6bc0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Edit2 size={13} />
                </button>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 13, fontWeight: 800, color: NAVY }}>{u.name}</div>
                <div style={{ fontSize: 11, color: '#9fa8da', marginTop: 2 }}>{u.username}</div>
              </div>
              <span style={{ display: 'inline-flex', alignItems: 'center', padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700, background: rb.bg, color: rb.color }}>
                {roleLabels[u.role]}
              </span>
            </div>
          );
        })}
      </div>
    </SettingsCard>
  );
}

function SuppliersSettings() {
  const { suppliers, addSupplier, updateSupplier, deleteSupplier } = useStore();
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', type: 'purchase' as AgentType, contactInfo: '', phone: '' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editId) { updateSupplier(editId, form); setEditId(null); }
    else addSupplier(form);
    setForm({ name: '', type: 'purchase', contactInfo: '', phone: '' });
    setShowForm(false);
  };

  const startEdit = (s: Supplier) => {
    setForm({ name: s.name, type: s.type, contactInfo: s.contactInfo, phone: s.phone });
    setEditId(s.id);
    setShowForm(true);
  };

  const typeBadge = (t: AgentType) => t === 'purchase'
    ? { label: 'קניה', bg: '#fff3e0', color: '#e65100' }
    : { label: 'קומיסיון', bg: '#f3e5f5', color: '#6a1b9a' };

  return (
    <SettingsCard title="🏭 ניהול ספקים וסוכנים">
      <div style={{ marginBottom: 14 }}>
        <button
          onClick={() => { setShowForm(!showForm); setEditId(null); setForm({ name: '', type: 'purchase', contactInfo: '', phone: '' }); }}
          className="flex items-center gap-2 text-white text-sm font-bold px-4 py-2.5 rounded-xl hover:opacity-90 transition"
          style={{ background: NAVY }}
        >
          <Plus size={14} /> הוסף ספק
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} style={{ background: '#eef0fb', borderRadius: 14, padding: 16, marginBottom: 14, border: '1.5px solid #c5cae9' }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: NAVY, marginBottom: 12, textAlign: 'right' }}>
            {editId ? 'עריכת ספק' : 'ספק חדש'}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
            {[
              { key: 'name', label: 'שם', type: 'text', required: true },
              { key: 'phone', label: 'טלפון', type: 'text', required: false },
              { key: 'contactInfo', label: 'פרטי קשר', type: 'text', required: false },
            ].map(f => (
              <div key={f.key}>
                <label style={{ display: 'block', fontSize: 11, color: '#666', marginBottom: 4, textAlign: 'right' }}>{f.label}</label>
                <input
                  type={f.type}
                  value={form[f.key as keyof typeof form] as string}
                  onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                  required={f.required}
                  style={{ ...inputStyle, width: '100%' }}
                />
              </div>
            ))}
            <div>
              <label style={{ display: 'block', fontSize: 11, color: '#666', marginBottom: 4, textAlign: 'right' }}>סוג</label>
              <select
                value={form.type}
                onChange={e => setForm(p => ({ ...p, type: e.target.value as AgentType }))}
                style={{ ...inputStyle, width: '100%', cursor: 'pointer' }}
              >
                <option value="purchase">קניה</option>
                <option value="commission">קומיסיון</option>
              </select>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button type="button" onClick={() => { setShowForm(false); setEditId(null); }}
              style={{ flex: 1, padding: '8px', border: '1.5px solid #e0e4f0', borderRadius: 10, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit', background: '#fff' }}>
              ביטול
            </button>
            <button type="submit"
              style={{ flex: 1, padding: '8px', background: NAVY, color: '#fff', border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
              שמור
            </button>
          </div>
        </form>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {suppliers.length === 0 && (
          <p style={{ textAlign: 'center', color: '#aaa', padding: '16px 0', fontSize: 13 }}>אין ספקים מוגדרים</p>
        )}
        {suppliers.map(s => {
          const tb = typeBadge(s.type);
          return (
            <div key={s.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#f8f9fd', borderRadius: 14, padding: '12px 16px' }}>
              <div style={{ display: 'flex', gap: 6 }}>
                <button onClick={() => { if (window.confirm('למחוק ספק זה?')) deleteSupplier(s.id); }}
                  style={{ width: 28, height: 28, borderRadius: 8, border: 'none', cursor: 'pointer', background: '#ffebee', color: '#e57373', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Trash2 size={13} />
                </button>
                <button onClick={() => startEdit(s)}
                  style={{ width: 28, height: 28, borderRadius: 8, border: 'none', cursor: 'pointer', background: '#eef0fb', color: '#5c6bc0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Edit2 size={13} />
                </button>
              </div>
              <div style={{ textAlign: 'right', flex: 1, margin: '0 12px' }}>
                <div style={{ fontSize: 13, fontWeight: 800, color: NAVY }}>{s.name}</div>
                <div style={{ fontSize: 11, color: '#9fa8da', marginTop: 2 }}>{s.phone} {s.contactInfo && `| ${s.contactInfo}`}</div>
              </div>
              <span style={{ display: 'inline-flex', alignItems: 'center', padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700, background: tb.bg, color: tb.color, whiteSpace: 'nowrap' }}>
                {tb.label}
              </span>
            </div>
          );
        })}
      </div>
    </SettingsCard>
  );
}
