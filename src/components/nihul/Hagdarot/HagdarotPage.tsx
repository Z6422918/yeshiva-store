import { useState } from 'react';
import { useStore } from '../../../store/useStore';
import { Plus, Trash2, Pencil, Save } from 'lucide-react';
import type { User, UserRole, Supplier, AgentType } from '../../../types';
import { Card } from '../../ui/card';
import { Badge } from '../../ui/badge';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../ui/dialog';
import { cn } from '../../../lib/utils';

// ─── Role labels & badges ──────────────────────────────────────────────────────
const roleLabels: Record<UserRole, string> = {
  kupa: 'קופה בלבד',
  manager: 'מנהל',
  admin: 'מנהל ראשי',
};

const roleBadgeClass: Record<UserRole, string> = {
  kupa:    'bg-green-100 text-green-700 border-green-200',
  manager: 'bg-primary/10 text-primary border-primary/20',
  admin:   'bg-purple-100 text-purple-700 border-purple-200',
};

// ─── Nedarim Settings ──────────────────────────────────────────────────────────
function NedarimSettings() {
  const { settings, updateSettings } = useStore();
  const [form, setForm] = useState({ ...settings });
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings(form);
    setSaved(true);
    setTimeout(() => setSaved(false), 2200);
  };

  return (
    <Card className="shadow-soft p-6">
      <div className="flex items-center gap-2 mb-5">
        <span className="text-xl">🔗</span>
        <h2 className="text-base font-black text-primary">חיבור נדרים פלוס</h2>
      </div>
      <form onSubmit={handleSave} className="space-y-4">
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">שם החנות</Label>
          <Input
            value={form.storeName}
            onChange={e => setForm(p => ({ ...p, storeName: e.target.value }))}
            className="text-sm"
          />
        </div>
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">קוד מוסד</Label>
          <p className="text-xs text-muted-foreground">מזהה הישיבה בנדרים פלוס</p>
          <Input
            value={form.nedarimInstitutionCode}
            onChange={e => setForm(p => ({ ...p, nedarimInstitutionCode: e.target.value }))}
            placeholder="IL-12345"
            className="text-sm"
          />
        </div>
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">מפתח API</Label>
          <p className="text-xs text-muted-foreground">סודי — אל תשתף</p>
          <Input
            type="password"
            value={form.nedarimApiKey}
            onChange={e => setForm(p => ({ ...p, nedarimApiKey: e.target.value }))}
            className="text-sm"
          />
        </div>
        <Button
          type="submit"
          className={cn(
            'gap-2 font-bold transition-smooth',
            saved ? 'bg-green-600 hover:bg-green-700 text-white' : 'gradient-primary'
          )}
        >
          <Save size={14} />
          {saved ? '✓ נשמר!' : 'שמור הגדרות'}
        </Button>
      </form>
    </Card>
  );
}

// ─── User Dialog ───────────────────────────────────────────────────────────────
interface UserDialogProps {
  open: boolean;
  onClose: () => void;
  editUser?: User;
}

function UserDialog({ open, onClose, editUser }: UserDialogProps) {
  const { addUser, updateUser } = useStore();
  const [form, setForm] = useState({
    name: editUser?.name ?? '',
    username: editUser?.username ?? '',
    password: editUser?.password ?? '',
    role: (editUser?.role ?? 'kupa') as UserRole,
  });

  const handleSave = () => {
    if (!form.name.trim() || !form.username.trim()) return;
    if (editUser) {
      updateUser(editUser.id, form);
    } else {
      addUser(form);
    }
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{editUser ? 'עריכת משתמש' : 'הוספת משתמש'}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          {([
            { label: 'שם מלא', key: 'name', type: 'text' },
            { label: 'שם משתמש', key: 'username', type: 'text' },
            { label: 'סיסמה', key: 'password', type: 'password' },
          ] as { label: string; key: keyof typeof form; type: string }[]).map(f => (
            <div key={f.key} className="space-y-1">
              <Label className="text-xs text-muted-foreground">{f.label}</Label>
              <Input
                type={f.type}
                value={form[f.key] as string}
                onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                className="text-sm"
              />
            </div>
          ))}
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">תפקיד</Label>
            <select
              value={form.role}
              onChange={e => setForm(p => ({ ...p, role: e.target.value as UserRole }))}
              className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            >
              {(Object.entries(roleLabels) as [UserRole, string][]).map(([v, l]) => (
                <option key={v} value={v}>{l}</option>
              ))}
            </select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>ביטול</Button>
          <Button onClick={handleSave}>{editUser ? 'שמור' : 'הוסף'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Users Management ──────────────────────────────────────────────────────────
function UsersManagement() {
  const { users, deleteUser, currentUser } = useStore();
  const [dlg, setDlg] = useState<{ open: boolean; edit?: User }>({ open: false });

  return (
    <Card className="shadow-soft overflow-hidden">
      <div className="flex items-center justify-between p-5 border-b border-border">
        <Button
          onClick={() => setDlg({ open: true })}
          className="gradient-primary shadow-soft gap-2 font-bold text-sm"
        >
          <Plus size={14} />
          הוסף משתמש
        </Button>
        <div className="flex items-center gap-2">
          <span className="text-xl">👥</span>
          <h2 className="text-base font-black text-primary">ניהול משתמשים</h2>
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow className="bg-muted/40 hover:bg-muted/40">
            <TableHead className="text-xs font-bold text-muted-foreground">שם</TableHead>
            <TableHead className="text-xs font-bold text-muted-foreground">שם משתמש</TableHead>
            <TableHead className="text-xs font-bold text-muted-foreground">תפקיד</TableHead>
            <TableHead className="text-xs font-bold text-muted-foreground">פעולות</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map(u => (
            <TableRow key={u.id}>
              <TableCell className="font-bold text-primary text-sm py-2.5">{u.name}</TableCell>
              <TableCell className="text-sm text-muted-foreground py-2.5">{u.username}</TableCell>
              <TableCell className="py-2.5">
                <Badge className={cn('border text-xs', roleBadgeClass[u.role])}>
                  {roleLabels[u.role]}
                </Badge>
              </TableCell>
              <TableCell className="py-2.5">
                <div className="flex gap-1">
                  <button
                    onClick={() => setDlg({ open: true, edit: u })}
                    className="w-7 h-7 flex items-center justify-center rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-smooth"
                    title="ערוך"
                  >
                    <Pencil size={12} />
                  </button>
                  {u.id !== currentUser?.id && (
                    <button
                      onClick={() => { if (window.confirm('למחוק משתמש זה?')) deleteUser(u.id); }}
                      className="w-7 h-7 flex items-center justify-center rounded-lg bg-destructive/10 text-destructive hover:bg-destructive/20 transition-smooth"
                      title="מחק"
                    >
                      <Trash2 size={12} />
                    </button>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <UserDialog
        open={dlg.open}
        onClose={() => setDlg({ open: false })}
        editUser={dlg.edit}
      />
    </Card>
  );
}

// ─── Supplier Dialog ───────────────────────────────────────────────────────────
interface SupplierDialogProps {
  open: boolean;
  onClose: () => void;
  editSupplier?: Supplier;
}

function SupplierDialog({ open, onClose, editSupplier }: SupplierDialogProps) {
  const { addSupplier, updateSupplier } = useStore();
  const [form, setForm] = useState({
    name: editSupplier?.name ?? '',
    type: (editSupplier?.type ?? 'purchase') as AgentType,
    contactInfo: editSupplier?.contactInfo ?? '',
    phone: editSupplier?.phone ?? '',
  });

  const handleSave = () => {
    if (!form.name.trim()) return;
    if (editSupplier) {
      updateSupplier(editSupplier.id, form);
    } else {
      addSupplier(form);
    }
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{editSupplier ? 'עריכת ספק' : 'הוספת ספק'}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          {([
            { label: 'שם ספק', key: 'name', type: 'text' },
            { label: 'טלפון', key: 'phone', type: 'tel' },
            { label: 'פרטי קשר', key: 'contactInfo', type: 'text' },
          ] as { label: string; key: keyof typeof form; type: string }[]).map(f => (
            <div key={f.key} className="space-y-1">
              <Label className="text-xs text-muted-foreground">{f.label}</Label>
              <Input
                type={f.type}
                value={form[f.key] as string}
                onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                className="text-sm"
              />
            </div>
          ))}
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">סוג</Label>
            <select
              value={form.type}
              onChange={e => setForm(p => ({ ...p, type: e.target.value as AgentType }))}
              className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="purchase">קניה</option>
              <option value="commission">קומיסיון</option>
            </select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>ביטול</Button>
          <Button onClick={handleSave}>{editSupplier ? 'שמור' : 'הוסף'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Suppliers Management ──────────────────────────────────────────────────────
function SuppliersManagement() {
  const { suppliers, deleteSupplier } = useStore();
  const [dlg, setDlg] = useState<{ open: boolean; edit?: Supplier }>({ open: false });

  const typeBadge = (t: AgentType) =>
    t === 'purchase'
      ? 'bg-orange-100 text-orange-700 border-orange-200'
      : 'bg-purple-100 text-purple-700 border-purple-200';

  const typeLabel = (t: AgentType) => (t === 'purchase' ? 'קניה' : 'קומיסיון');

  return (
    <Card className="shadow-soft overflow-hidden">
      <div className="flex items-center justify-between p-5 border-b border-border">
        <Button
          onClick={() => setDlg({ open: true })}
          className="gradient-primary shadow-soft gap-2 font-bold text-sm"
        >
          <Plus size={14} />
          הוסף ספק
        </Button>
        <div className="flex items-center gap-2">
          <span className="text-xl">🏭</span>
          <h2 className="text-base font-black text-primary">ניהול ספקים וסוכנים</h2>
        </div>
      </div>

      {suppliers.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
          <div className="text-4xl mb-3">🏭</div>
          <p className="text-sm font-semibold">אין ספקים מוגדרים</p>
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40 hover:bg-muted/40">
              <TableHead className="text-xs font-bold text-muted-foreground">שם</TableHead>
              <TableHead className="text-xs font-bold text-muted-foreground">סוג</TableHead>
              <TableHead className="text-xs font-bold text-muted-foreground">טלפון</TableHead>
              <TableHead className="text-xs font-bold text-muted-foreground">פרטי קשר</TableHead>
              <TableHead className="text-xs font-bold text-muted-foreground">פעולות</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {suppliers.map(s => (
              <TableRow key={s.id}>
                <TableCell className="font-bold text-primary text-sm py-2.5">{s.name}</TableCell>
                <TableCell className="py-2.5">
                  <Badge className={cn('border text-xs', typeBadge(s.type))}>
                    {typeLabel(s.type)}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground py-2.5">{s.phone || '—'}</TableCell>
                <TableCell className="text-sm text-muted-foreground py-2.5">{s.contactInfo || '—'}</TableCell>
                <TableCell className="py-2.5">
                  <div className="flex gap-1">
                    <button
                      onClick={() => setDlg({ open: true, edit: s })}
                      className="w-7 h-7 flex items-center justify-center rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-smooth"
                      title="ערוך"
                    >
                      <Pencil size={12} />
                    </button>
                    <button
                      onClick={() => { if (window.confirm('למחוק ספק זה?')) deleteSupplier(s.id); }}
                      className="w-7 h-7 flex items-center justify-center rounded-lg bg-destructive/10 text-destructive hover:bg-destructive/20 transition-smooth"
                      title="מחק"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <SupplierDialog
        open={dlg.open}
        onClose={() => setDlg({ open: false })}
        editSupplier={dlg.edit}
      />
    </Card>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
type Section = 'nedarim' | 'users' | 'suppliers';

export default function HagdarotPage() {
  const [section, setSection] = useState<Section>('nedarim');

  const sections: { id: Section; label: string }[] = [
    { id: 'nedarim',   label: '🔗 נדרים פלוס' },
    { id: 'users',     label: '👥 משתמשים' },
    { id: 'suppliers', label: '🏭 ספקים' },
  ];

  return (
    <div className="space-y-5" dir="rtl">

      {/* ── Section pill tabs ── */}
      <div className="inline-flex gap-1.5 bg-muted/60 rounded-2xl p-1.5">
        {sections.map(s => (
          <button
            key={s.id}
            onClick={() => setSection(s.id)}
            className={cn(
              'px-5 py-2 rounded-xl text-sm font-bold transition-smooth',
              section === s.id
                ? 'bg-card text-foreground shadow-soft'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            {s.label}
          </button>
        ))}
      </div>

      {section === 'nedarim'   && <NedarimSettings />}
      {section === 'users'     && <UsersManagement />}
      {section === 'suppliers' && <SuppliersManagement />}
    </div>
  );
}
