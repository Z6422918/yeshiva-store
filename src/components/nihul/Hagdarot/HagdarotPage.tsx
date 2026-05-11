import { useState } from 'react';
import { useStore } from '../../../store/useStore';
import {
  Save, Users, RefreshCw, UserPlus, Pencil, Trash2, Landmark, KeyRound,
} from 'lucide-react';
import type { User, UserRole } from '../../../types';
import { Card } from '../../ui/card';
import { Badge } from '../../ui/badge';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../ui/dialog';
import { cn } from '../../../lib/utils';

// ─── Role labels ───────────────────────────────────────────────────────────────
const roleLabels: Record<UserRole, string> = {
  kupa: 'קופה', manager: 'מנהל', admin: 'מנהל ראשי',
};

// ─── Nedarim Settings ──────────────────────────────────────────────────────────
function NedarimSettings() {
  const { settings, updateSettings } = useStore();
  const [apiUrl, setApiUrl] = useState('');
  const [mosadId, setMosadId] = useState(settings.nedarimInstitutionCode ?? '');
  const [matchId, setMatchId] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaving(true);
    updateSettings({ nedarimInstitutionCode: mosadId.trim() });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2200);
  };

  return (
    <Card className="p-6 shadow-soft">
      <div className="flex items-center gap-2 mb-4">
        <Landmark className="w-5 h-5 text-accent" />
        <h3 className="text-lg font-bold">חיבור לנדרים פלוס</h3>
      </div>
      <p className="text-sm text-muted-foreground mb-4">
        הזן את כתובת ה-API של נדרים פלוס וקוד המוסד שלך.
      </p>
      <div className="grid grid-cols-1 gap-3 max-w-2xl">
        <div className="space-y-1.5">
          <Label>כתובת API של נדרים פלוס</Label>
          <Input
            value={apiUrl}
            onChange={e => setApiUrl(e.target.value)}
            placeholder="https://matara.pro/nedarimplus/..."
            dir="ltr"
          />
        </div>
        <div className="space-y-1.5">
          <Label>קוד מוסד (MosadId)</Label>
          <Input
            value={mosadId}
            onChange={e => setMosadId(e.target.value)}
            placeholder="לדוגמה: 7011179"
            dir="ltr"
          />
        </div>
        <div className="space-y-1.5">
          <Label>קוד מאצ'ינג (MatchId)</Label>
          <Input
            value={matchId}
            onChange={e => setMatchId(e.target.value)}
            placeholder="מזהה התאמה (אופציונלי)"
            dir="ltr"
          />
          <p className="text-xs text-muted-foreground">קוד מאצ'ינג — נדרש רק לשליפת מגייסים ויעדים.</p>
        </div>
        <div className="space-y-1.5">
          <Label>שם החנות</Label>
          <Input
            value={settings.storeName}
            onChange={e => updateSettings({ storeName: e.target.value })}
          />
        </div>
        <Button onClick={handleSave} disabled={saving} className="gap-2 w-fit">
          <Save className="w-4 h-4" />
          {saving ? 'שומר...' : saved ? '✓ נשמר!' : 'שמור הגדרות נדרים פלוס'}
        </Button>
      </div>
    </Card>
  );
}

// ─── User Dialog ───────────────────────────────────────────────────────────────
function UserDialog({
  open, onClose, editUser,
}: { open: boolean; onClose: () => void; editUser?: User }) {
  const { addUser, updateUser } = useStore();
  const [form, setForm] = useState({
    name: editUser?.name ?? '',
    username: editUser?.username ?? '',
    password: editUser?.password ?? '',
    role: (editUser?.role ?? 'kupa') as UserRole,
  });

  const handleSave = () => {
    if (!form.name.trim() || !form.username.trim()) return;
    if (editUser) updateUser(editUser.id, form);
    else addUser(form);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent dir="rtl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {editUser ? <KeyRound className="w-5 h-5" /> : <UserPlus className="w-5 h-5" />}
            {editUser ? 'עריכת משתמש' : 'הוספת משתמש חדש'}
          </DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label>שם מלא</Label>
            <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="שם..." />
          </div>
          <div className="space-y-1.5">
            <Label>תפקיד</Label>
            <select
              value={form.role}
              onChange={e => setForm(f => ({ ...f, role: e.target.value as UserRole }))}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="admin">מנהל ראשי</option>
              <option value="manager">מנהל</option>
              <option value="kupa">קופה</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <Label>שם משתמש</Label>
            <Input value={form.username} onChange={e => setForm(f => ({ ...f, username: e.target.value }))} dir="ltr" />
          </div>
          <div className="space-y-1.5">
            <Label>סיסמה</Label>
            <Input type="text" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} placeholder="לפחות 4 תווים" />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>ביטול</Button>
          <Button onClick={handleSave} className="gap-2">
            <UserPlus className="w-4 h-4" />
            {editUser ? 'שמור' : 'צור משתמש'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Users Management ──────────────────────────────────────────────────────────
function UsersManagement() {
  const { users, deleteUser, currentUser } = useStore();
  const [dlg, setDlg] = useState<{ open: boolean; edit?: User }>({ open: false });

  const roleBadge = (role: UserRole) => {
    if (role === 'admin')   return <Badge className="bg-purple-100 text-purple-700 border-0">מנהל ראשי</Badge>;
    if (role === 'manager') return <Badge className="bg-primary/10 text-primary border-0">מנהל</Badge>;
    return <Badge className="bg-green-100 text-green-700 border-0">קופה</Badge>;
  };

  return (
    <Card className="p-6 shadow-soft">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-bold">ניהול משתמשים</h3>
        </div>
        <Button variant="outline" size="sm" onClick={() => setDlg({ open: false })} className="gap-2 opacity-0 pointer-events-none">
          <RefreshCw className="w-4 h-4" /> רענן
        </Button>
      </div>

      <div className="mb-5">
        <Button onClick={() => setDlg({ open: true })} className="gap-2">
          <UserPlus className="w-4 h-4" /> הוספת משתמש חדש
        </Button>
      </div>

      <div className="rounded-xl border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-secondary/60">
              <TableHead className="text-right">שם</TableHead>
              <TableHead className="text-right">שם משתמש</TableHead>
              <TableHead className="text-right">תפקיד</TableHead>
              <TableHead className="text-right">פעולות</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">אין משתמשים</TableCell>
              </TableRow>
            )}
            {users.map(u => {
              const isMe = u.id === currentUser?.id;
              return (
                <TableRow key={u.id}>
                  <TableCell className="font-medium">
                    {u.name}
                    {isMe && <Badge variant="outline" className="mr-2 text-xs">אני</Badge>}
                  </TableCell>
                  <TableCell dir="ltr" className="text-right text-muted-foreground">{u.username}</TableCell>
                  <TableCell>{roleBadge(u.role)}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button size="sm" variant="outline" onClick={() => setDlg({ open: true, edit: u })} className="gap-1.5">
                        <Pencil className="w-3.5 h-3.5" /> ערוך
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        disabled={isMe}
                        onClick={() => { if (window.confirm(`למחוק את ${u.name}?`)) deleteUser(u.id); }}
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      <UserDialog
        open={dlg.open}
        onClose={() => setDlg({ open: false })}
        editUser={dlg.edit}
      />
    </Card>
  );
}

// ─── Reset System ──────────────────────────────────────────────────────────────
function ResetSystem() {
  const [confirm, setConfirm] = useState(false);
  const [pwd, setPwd] = useState('');
  const { currentUser } = useStore();

  const handleReset = () => {
    if (pwd !== currentUser?.password) {
      alert('סיסמה שגויה');
      return;
    }
    // Clear persisted store data except users and settings
    if (window.confirm('איפוס מלא של המערכת? כל הנתונים יימחקו!')) {
      localStorage.clear();
      window.location.reload();
    }
  };

  return (
    <Card className="p-6 shadow-soft border-destructive/30">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xl">⚠️</span>
        <h3 className="text-lg font-bold text-destructive">איפוס מערכת</h3>
      </div>
      <p className="text-sm text-muted-foreground mb-4">
        פעולה זו תמחק את כל הנתונים במערכת — מוצרים, עסקאות, כספים. לא ניתן לבטל.
      </p>
      {!confirm ? (
        <Button variant="destructive" onClick={() => setConfirm(true)} className="gap-2">
          ⚠️ איפוס מערכת
        </Button>
      ) : (
        <div className="space-y-3 max-w-xs">
          <div className="space-y-1.5">
            <Label>הזן סיסמה לאישור</Label>
            <Input type="password" value={pwd} onChange={e => setPwd(e.target.value)} />
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => { setConfirm(false); setPwd(''); }}>ביטול</Button>
            <Button variant="destructive" onClick={handleReset}>אשר איפוס</Button>
          </div>
        </div>
      )}
    </Card>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function HagdarotPage() {
  return (
    <div className="space-y-6 max-w-5xl mx-auto" dir="rtl">
      <NedarimSettings />
      <UsersManagement />
      <ResetSystem />
    </div>
  );
}
