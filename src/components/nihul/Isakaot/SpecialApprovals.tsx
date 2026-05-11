import { useState } from 'react';
import { useStore } from '../../../store/useStore';
import { Plus, Check, X, Clock, ShieldCheck, RefreshCw } from 'lucide-react';
import { Card } from '../../ui/card';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Badge } from '../../ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../ui/dialog';
import { cn } from '../../../lib/utils';

export default function SpecialApprovals() {
  const { specialApprovals, addSpecialApproval, updateApprovalStatus, currentUser } = useStore();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ description: '', amount: '', requestedBy: '' });

  const handleAdd = () => {
    if (!form.description || !form.amount) return;
    addSpecialApproval({
      description: form.description,
      amount: Number(form.amount),
      requestedBy: form.requestedBy || currentUser?.name || '',
      approvedBy: '',
      status: 'pending',
    });
    setForm({ description: '', amount: '', requestedBy: '' });
    setOpen(false);
  };

  const statusBadge = (status: string) => {
    if (status === 'approved') return <Badge className="bg-green-100 text-green-700 border-0 gap-1"><Check className="w-3 h-3" />אושר</Badge>;
    if (status === 'rejected') return <Badge className="bg-red-100 text-red-700 border-0 gap-1"><X className="w-3 h-3" />נדחה</Badge>;
    return <Badge className="bg-yellow-100 text-yellow-700 border-0 gap-1"><Clock className="w-3 h-3" />ממתין</Badge>;
  };

  const sorted = [...specialApprovals].sort((a, b) => b.date.localeCompare(a.date));

  return (
    <Card className="p-4 shadow-soft">
      <div className="flex items-center justify-between mb-4">
        <Button className="gap-2" onClick={() => setOpen(true)}>
          <Plus className="w-4 h-4" /> אישור חדש
        </Button>
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-primary" />
          <h3 className="font-semibold">אישורים מיוחדים</h3>
        </div>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent dir="rtl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5" /> בקשת אישור מיוחד
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1">
              <Label>תיאור</Label>
              <Input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="תיאור הבקשה" />
            </div>
            <div className="space-y-1">
              <Label>סכום (₪)</Label>
              <Input type="number" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} />
            </div>
            <div className="space-y-1">
              <Label>מבוקש ע"י</Label>
              <Input value={form.requestedBy} onChange={e => setForm(f => ({ ...f, requestedBy: e.target.value }))} placeholder={currentUser?.name} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>ביטול</Button>
            <Button onClick={handleAdd}>שמור</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {sorted.length === 0 ? (
        <div className="text-center text-muted-foreground py-8">
          <ShieldCheck className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="text-sm">אין אישורים מיוחדים</p>
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40 hover:bg-muted/40">
              <TableHead className="text-right text-xs font-bold text-muted-foreground">תאריך</TableHead>
              <TableHead className="text-right text-xs font-bold text-muted-foreground">תיאור</TableHead>
              <TableHead className="text-right text-xs font-bold text-muted-foreground">סכום</TableHead>
              <TableHead className="text-right text-xs font-bold text-muted-foreground">מבוקש ע"י</TableHead>
              <TableHead className="text-right text-xs font-bold text-muted-foreground">סטטוס</TableHead>
              {currentUser?.role === 'admin' && (
                <TableHead className="text-xs font-bold text-muted-foreground">פעולות</TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {sorted.map(a => (
              <TableRow key={a.id}>
                <TableCell className="text-sm text-muted-foreground">{a.date}</TableCell>
                <TableCell className="font-medium text-sm">{a.description}</TableCell>
                <TableCell className="font-bold text-primary">₪{a.amount}</TableCell>
                <TableCell className="text-sm text-muted-foreground">{a.requestedBy}</TableCell>
                <TableCell>{statusBadge(a.status)}</TableCell>
                {currentUser?.role === 'admin' && (
                  <TableCell>
                    {a.status === 'pending' && (
                      <div className="flex items-center gap-1">
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 text-xs gap-1 border-green-300 text-green-700 hover:bg-green-50"
                          onClick={() => updateApprovalStatus(a.id, 'approved', currentUser.name)}
                        >
                          <Check className="w-3 h-3" /> אשר
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 text-xs gap-1 border-red-300 text-red-600 hover:bg-red-50"
                          onClick={() => updateApprovalStatus(a.id, 'rejected', currentUser.name)}
                        >
                          <X className="w-3 h-3" /> דחה
                        </Button>
                      </div>
                    )}
                    {a.status !== 'pending' && a.approvedBy && (
                      <span className="text-xs text-muted-foreground">ע"י {a.approvedBy}</span>
                    )}
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </Card>
  );
}
