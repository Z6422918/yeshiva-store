import { useState } from 'react';
import { useStore } from '../../../store/useStore';
import { Plus, Trash2, Edit2, Save, X } from 'lucide-react';
import type { User, UserRole, Supplier, AgentType } from '../../../types';

export default function HagdarotPage() {
  const [activeSection, setActiveSection] = useState<'nedarim' | 'users' | 'suppliers'>('nedarim');

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-xl shadow flex overflow-hidden">
        {(['nedarim', 'users', 'suppliers'] as const).map(s => (
          <button key={s} onClick={() => setActiveSection(s)}
            className={`flex-1 py-3 text-sm font-semibold transition border-b-2 ${
              activeSection === s ? 'border-blue-700 text-blue-700 bg-blue-50' : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {s === 'nedarim' ? 'נדרים פלוס' : s === 'users' ? 'משתמשים' : 'ספקים'}
          </button>
        ))}
      </div>
      {activeSection === 'nedarim' && <NedarimSettings />}
      {activeSection === 'users' && <UsersSettings />}
      {activeSection === 'suppliers' && <SuppliersSettings />}
    </div>
  );
}

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
    <div className="bg-white rounded-xl shadow p-6">
      <h3 className="font-bold text-gray-800 text-right mb-5">הגדרות נדרים פלוס וחנות</h3>
      <form onSubmit={handleSave} className="space-y-4 max-w-md mr-0 ml-auto">
        {[
          { key: 'storeName', label: 'שם החנות' },
          { key: 'nedarimInstitutionCode', label: 'קוד מוסד נדרים פלוס' },
          { key: 'nedarimApiKey', label: 'מפתח API נדרים פלוס' },
        ].map(f => (
          <div key={f.key}>
            <label className="block text-sm text-gray-600 mb-1 text-right">{f.label}</label>
            <input
              type={f.key === 'nedarimApiKey' ? 'password' : 'text'}
              value={form[f.key as keyof typeof form]}
              onChange={e => setForm(prev => ({ ...prev, [f.key]: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-right focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
        ))}
        <button type="submit"
          className={`w-full py-2.5 rounded-lg font-semibold transition flex items-center justify-center gap-2 ${
            saved ? 'bg-green-600 text-white' : 'bg-blue-700 text-white hover:bg-blue-800'
          }`}
        >
          <Save size={16} />
          {saved ? 'נשמר!' : 'שמור הגדרות'}
        </button>
      </form>
    </div>
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editId) {
      updateUser(editId, form);
      setEditId(null);
    } else {
      addUser(form);
    }
    setForm({ name: '', username: '', password: '', role: 'kupa' });
    setShowForm(false);
  };

  const startEdit = (u: User) => {
    setForm({ name: u.name, username: u.username, password: u.password, role: u.role });
    setEditId(u.id);
    setShowForm(true);
  };

  return (
    <div className="bg-white rounded-xl shadow p-6 space-y-4">
      <div className="flex items-center justify-between">
        <button onClick={() => { setShowForm(!showForm); setEditId(null); setForm({ name: '', username: '', password: '', role: 'kupa' }); }}
          className="flex items-center gap-1 bg-blue-700 text-white px-3 py-2 rounded-lg text-sm hover:bg-blue-800">
          <Plus size={15} /> משתמש חדש
        </button>
        <h3 className="font-bold text-gray-800">ניהול משתמשים</h3>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-blue-50 rounded-xl p-4 space-y-3 border border-blue-100">
          <p className="text-sm font-semibold text-gray-700 text-right">{editId ? 'עריכת משתמש' : 'משתמש חדש'}</p>
          {[
            { key: 'name', label: 'שם מלא', type: 'text' },
            { key: 'username', label: 'שם משתמש', type: 'text' },
            { key: 'password', label: 'סיסמה', type: 'password' },
          ].map(f => (
            <div key={f.key}>
              <label className="block text-xs text-gray-500 mb-1 text-right">{f.label}</label>
              <input type={f.type} value={form[f.key as keyof typeof form] as string}
                onChange={e => setForm(prev => ({ ...prev, [f.key]: e.target.value }))} required
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-right focus:outline-none focus:ring-2 focus:ring-blue-400" />
            </div>
          ))}
          <div>
            <label className="block text-xs text-gray-500 mb-1 text-right">תפקיד</label>
            <select value={form.role} onChange={e => setForm(prev => ({ ...prev, role: e.target.value as UserRole }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-right bg-white focus:outline-none focus:ring-2 focus:ring-blue-400">
              {Object.entries(roleLabels).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
          </div>
          <div className="flex gap-2">
            <button type="button" onClick={() => { setShowForm(false); setEditId(null); }} className="flex-1 py-2 border border-gray-300 rounded-lg text-sm">ביטול</button>
            <button type="submit" className="flex-1 py-2 bg-blue-700 text-white rounded-lg text-sm font-semibold">שמור</button>
          </div>
        </form>
      )}

      <div className="space-y-2">
        {users.map(u => (
          <div key={u.id} className="flex items-center justify-between bg-gray-50 rounded-lg px-4 py-3">
            <div className="flex gap-2">
              {u.id !== currentUser?.id && (
                <button onClick={() => { if (confirm('למחוק משתמש זה?')) deleteUser(u.id); }}
                  className="text-red-400 hover:text-red-600"><Trash2 size={15} /></button>
              )}
              <button onClick={() => startEdit(u)} className="text-gray-400 hover:text-gray-600">
                <Edit2 size={15} />
              </button>
            </div>
            <div className="text-right">
              <p className="font-semibold text-gray-800">{u.name}</p>
              <p className="text-xs text-gray-400">{u.username} | {roleLabels[u.role]}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SuppliersSettings() {
  const { suppliers, addSupplier, updateSupplier, deleteSupplier } = useStore();
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', type: 'purchase' as AgentType, contactInfo: '', phone: '' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editId) {
      updateSupplier(editId, form);
      setEditId(null);
    } else {
      addSupplier(form);
    }
    setForm({ name: '', type: 'purchase', contactInfo: '', phone: '' });
    setShowForm(false);
  };

  const startEdit = (s: Supplier) => {
    setForm({ name: s.name, type: s.type, contactInfo: s.contactInfo, phone: s.phone });
    setEditId(s.id);
    setShowForm(true);
  };

  return (
    <div className="bg-white rounded-xl shadow p-6 space-y-4">
      <div className="flex items-center justify-between">
        <button onClick={() => { setShowForm(!showForm); setEditId(null); setForm({ name: '', type: 'purchase', contactInfo: '', phone: '' }); }}
          className="flex items-center gap-1 bg-blue-700 text-white px-3 py-2 rounded-lg text-sm hover:bg-blue-800">
          <Plus size={15} /> ספק חדש
        </button>
        <h3 className="font-bold text-gray-800">ניהול ספקים / סוכנים</h3>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-blue-50 rounded-xl p-4 space-y-3 border border-blue-100">
          <p className="text-sm font-semibold text-gray-700 text-right">{editId ? 'עריכת ספק' : 'ספק חדש'}</p>
          <div className="grid grid-cols-2 gap-3">
            {[
              { key: 'name', label: 'שם', type: 'text' },
              { key: 'phone', label: 'טלפון', type: 'text' },
              { key: 'contactInfo', label: 'פרטי קשר', type: 'text' },
            ].map(f => (
              <div key={f.key}>
                <label className="block text-xs text-gray-500 mb-1 text-right">{f.label}</label>
                <input type={f.type} value={form[f.key as keyof typeof form] as string}
                  onChange={e => setForm(prev => ({ ...prev, [f.key]: e.target.value }))}
                  required={f.key === 'name'}
                  className="w-full border border-gray-300 rounded-lg px-2 py-1.5 text-sm text-right focus:outline-none focus:ring-2 focus:ring-blue-400" />
              </div>
            ))}
            <div>
              <label className="block text-xs text-gray-500 mb-1 text-right">סוג</label>
              <select value={form.type} onChange={e => setForm(prev => ({ ...prev, type: e.target.value as AgentType }))}
                className="w-full border border-gray-300 rounded-lg px-2 py-1.5 text-sm text-right bg-white focus:outline-none focus:ring-2 focus:ring-blue-400">
                <option value="purchase">קניה</option>
                <option value="commission">קומיסיון</option>
              </select>
            </div>
          </div>
          <div className="flex gap-2">
            <button type="button" onClick={() => { setShowForm(false); setEditId(null); }} className="flex-1 py-2 border border-gray-300 rounded-lg text-sm">ביטול</button>
            <button type="submit" className="flex-1 py-2 bg-blue-700 text-white rounded-lg text-sm font-semibold">שמור</button>
          </div>
        </form>
      )}

      <div className="space-y-2">
        {suppliers.length === 0 && <p className="text-center text-gray-400 py-4">אין ספקים מוגדרים</p>}
        {suppliers.map(s => (
          <div key={s.id} className="flex items-center justify-between bg-gray-50 rounded-lg px-4 py-3">
            <div className="flex gap-2">
              <button onClick={() => { if (confirm('למחוק ספק זה?')) deleteSupplier(s.id); }}
                className="text-red-400 hover:text-red-600"><Trash2 size={15} /></button>
              <button onClick={() => startEdit(s)} className="text-gray-400 hover:text-gray-600">
                <Edit2 size={15} />
              </button>
            </div>
            <div className="text-right">
              <p className="font-semibold text-gray-800">{s.name}</p>
              <p className="text-xs text-gray-400">
                {s.type === 'purchase' ? 'סוכן קניה' : 'סוכן קומיסיון'} | {s.phone} | {s.contactInfo}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
