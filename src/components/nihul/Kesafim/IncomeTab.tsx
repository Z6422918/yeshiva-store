import { useState } from 'react';
import { useStore } from '../../../store/useStore';
import { Plus, Trash2, Banknote, CreditCard, Sparkles } from 'lucide-react';
import { Card } from '../../ui/card';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Badge } from '../../ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../ui/dialog';
import { cn } from '../../../lib/utils';

const fmtMoney = (n: number) => `₪${n.toFixed(2)}`;
const fmtDate = (d: string) => new Date(d).toLocaleDateString('he-IL');

export default function IncomeTab() {
  const {
    safeEntries, addSafeEntry, deleteSafeEntry,
    transactions, transferToSafe,
    getCashNotTransferred, getCreditNotTransferred,
  } = useStore();

  const [open, setOpen] = useState(false);
  const [type, setType] = useState<'cash' | 'credit' | 'special' | 'loan'>('cash');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [amount, setAmount] = useState('');
  const [reason, setReason] = useState('');
  const [note, setNote] = useState('');

  const cashPending   = getCashNotTransferred();
  const creditPending = getCreditNotTransferred();

  const incomes = safeEntries
    .filter(e => e.type === 'income')
    .sort((a, b) => b.date.localeCompare(a.date));

  const handleTransfer = (src: 'cash' | 'credit') => {
    const pending = src === 'cash' ? cashPending : creditPending;
    if (pending <= 0) return;
    const ids = transactions.filter(t => t.paymentMethod === src && !t.transferredToSafe).map(t => t.id);
    transferToSafe(src, ids, pending);
  };

  const submit = () => {
    const n = parseFloat(amount);
    if (!n || n <= 0) return;

    if (type === 'cash') {
      // transferToSafe already records the safe entry
      handleTransfer('cash');
    } else if (type === 'credit') {
      handleTransfer('credit');
    } else {
      // special income or loan — manual safe entry
      const desc =
        type === 'loan'
          ? `הלוואה${reason.trim() ? ` - ${reason.trim()}` : ''}`
          : reason.trim() || 'הכנסה מיוחדת';
      addSafeEntry({ date, type: 'income', source: 'special', amount: n, description: desc });
    }

    setAmount(''); setReason(''); setNote(''); setOpen(false);
  };

  const typeBadge = (source: string) => {
    if (source === 'cash')    return <Badge variant="secondary" className="gap-1"><Banknote className="w-3 h-3" />מזומן</Badge>;
    if (source === 'credit')  return <Badge variant="secondary" className="gap-1"><CreditCard className="w-3 h-3" />אשראי</Badge>;
    return <Badge className="gap-1 bg-purple-100 text-purple-700 border-0"><Sparkles className="w-3 h-3" />מיוחדת</Badge>;
  };

  return (
    <Card className="p-4 shadow-soft">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <div>
          <h3 className="font-semibold">פדיונות והכנסות לכספת</h3>
          <p className="text-xs text-muted-foreground">
            ממתין לפדיון: מזומן {fmtMoney(cashPending)} • אשראי {fmtMoney(creditPending)}
          </p>
        </div>
        <Button className="gap-2" onClick={() => setOpen(true)}>
          <Plus className="w-4 h-4" /> הכנסה חדשה
        </Button>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent dir="rtl">
          <DialogHeader><DialogTitle>הכנסה לכספת</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1">
              <Label>סוג</Label>
              <select
                value={type}
                onChange={e => setType(e.target.value as typeof type)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="cash">פדיון מזומן</option>
                <option value="credit">פדיון אשראי</option>
                <option value="special">הכנסה מיוחדת</option>
                <option value="loan">הלוואה</option>
              </select>
            </div>
            <div className="space-y-1">
              <Label>תאריך</Label>
              <Input type="date" value={date} onChange={e => setDate(e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label>סכום (₪)</Label>
              <Input type="number" value={amount} onChange={e => setAmount(e.target.value)} />
            </div>
            {(type === 'special' || type === 'loan') && (
              <div className="space-y-1">
                <Label>{type === 'loan' ? 'מקור / הערה' : 'סיבה'}</Label>
                <Input
                  value={reason}
                  onChange={e => setReason(e.target.value)}
                  placeholder={type === 'loan' ? 'ממי התקבלה ההלוואה' : 'פירוט מקור ההכנסה'}
                />
              </div>
            )}
            <div className="space-y-1">
              <Label>הערה</Label>
              <Input value={note} onChange={e => setNote(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>ביטול</Button>
            <Button onClick={submit}>אישור</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {incomes.length === 0 ? (
        <div className="text-center text-muted-foreground py-8 text-sm">אין רשומות הכנסה</div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-right">תאריך</TableHead>
              <TableHead className="text-right">סוג</TableHead>
              <TableHead className="text-right">פירוט / סיבה</TableHead>
              <TableHead className="text-right">סכום</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {incomes.map(r => (
              <TableRow key={r.id}>
                <TableCell>{fmtDate(r.date)}</TableCell>
                <TableCell>{typeBadge(r.source)}</TableCell>
                <TableCell>{r.description}</TableCell>
                <TableCell className="font-bold text-green-600">{fmtMoney(r.amount)}</TableCell>
                <TableCell>
                  {deleteSafeEntry && (
                    <button
                      onClick={() => deleteSafeEntry(r.id)}
                      className="w-8 h-8 flex items-center justify-center rounded text-destructive hover:bg-destructive/10 transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </Card>
  );
}
