import { useState } from 'react';
import { useStore } from '../../../store/useStore';
import { Plus, Trash2, Receipt, Wallet } from 'lucide-react';
import { Card } from '../../ui/card';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../ui/dialog';

const fmtMoney = (n: number) => `₪${n.toFixed(2)}`;
const fmtDate = (d: string) => new Date(d).toLocaleDateString('he-IL');

export default function ExpensesTab() {
  const {
    safeEntries, addSafeEntry, deleteSafeEntry,
    suppliers, paySupplier,
    getSafeBalance,
  } = useStore();

  const [open, setOpen] = useState(false);
  const [supplierPayOpen, setSupplierPayOpen] = useState(false);

  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');

  const [supplierId, setSupplierId] = useState('');
  const [supplierAmount, setSupplierAmount] = useState('');
  const [supplierDesc, setSupplierDesc] = useState('');

  const available = getSafeBalance();

  const expenses = safeEntries
    .filter(e => e.type === 'expense')
    .sort((a, b) => b.date.localeCompare(a.date));

  const submitExpense = () => {
    const n = parseFloat(amount);
    if (!description.trim() || !n || n <= 0) return;
    addSafeEntry({ date, type: 'expense', source: 'special', amount: n, description: description.trim() });
    setAmount(''); setDescription(''); setOpen(false);
  };

  const submitSupplierPay = () => {
    const n = parseFloat(supplierAmount);
    if (!supplierId || !n || n <= 0) return;
    paySupplier(supplierId, n, supplierDesc || 'תשלום לספק');
    setSupplierId(''); setSupplierAmount(''); setSupplierDesc(''); setSupplierPayOpen(false);
  };

  return (
    <Card className="p-4 shadow-soft">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <div>
          <h3 className="font-semibold flex items-center gap-2"><Receipt className="w-4 h-4" />הוצאות</h3>
          <p className="text-xs text-muted-foreground">יורדות מיתרת הכספת • זמין: {fmtMoney(available)}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={() => setSupplierPayOpen(true)} variant="outline" className="gap-2">
            <Wallet className="w-4 h-4" /> תשלום לספק
          </Button>
          <Button className="gap-2" onClick={() => setOpen(true)}>
            <Plus className="w-4 h-4" /> הוצאה חדשה
          </Button>
        </div>
      </div>

      {/* New expense dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent dir="rtl">
          <DialogHeader><DialogTitle>הוצאה חדשה</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1">
              <Label>תאריך</Label>
              <Input type="date" value={date} onChange={e => setDate(e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label>תיאור</Label>
              <Input value={description} onChange={e => setDescription(e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label>סכום (₪)</Label>
              <Input type="number" value={amount} onChange={e => setAmount(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>ביטול</Button>
            <Button onClick={submitExpense}>אישור</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Supplier payment dialog */}
      <Dialog open={supplierPayOpen} onOpenChange={setSupplierPayOpen}>
        <DialogContent dir="rtl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><Wallet className="w-5 h-5" />תשלום לספק</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1">
              <Label>ספק</Label>
              <select
                value={supplierId}
                onChange={e => setSupplierId(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="">בחר ספק</option>
                {suppliers.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.type === 'purchase' ? 'קניה' : 'קומיסיון'})
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <Label>סכום (₪)</Label>
              <Input type="number" value={supplierAmount} onChange={e => setSupplierAmount(e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label>תיאור</Label>
              <Input value={supplierDesc} onChange={e => setSupplierDesc(e.target.value)} placeholder="פרטי התשלום" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSupplierPayOpen(false)}>ביטול</Button>
            <Button onClick={submitSupplierPay}>אישור</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {expenses.length === 0 ? (
        <div className="text-center text-muted-foreground py-8 text-sm">אין הוצאות מיוחדות</div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-right">תאריך</TableHead>
              <TableHead className="text-right">תיאור</TableHead>
              <TableHead className="text-right">סכום</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {expenses.map(e => (
              <TableRow key={e.id}>
                <TableCell>{fmtDate(e.date)}</TableCell>
                <TableCell>{e.description}</TableCell>
                <TableCell className="font-bold text-destructive">{fmtMoney(e.amount)}</TableCell>
                <TableCell>
                  {deleteSafeEntry && (
                    <button
                      onClick={() => deleteSafeEntry(e.id)}
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
