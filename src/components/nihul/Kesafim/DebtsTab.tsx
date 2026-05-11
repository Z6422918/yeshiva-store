import { useState } from 'react';
import { useStore } from '../../../store/useStore';
import { Wallet, Package, ShoppingBag, Boxes, Search, Plus, Trash2, History } from 'lucide-react';
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

export default function DebtsTab() {
  const {
    suppliers, products, supplierPayments,
    getSupplierDebt, getTotalPurchaseDebt, getTotalCommissionDebt,
    paySupplier,
  } = useStore();

  const [search, setSearch] = useState('');
  const [payDlg, setPayDlg] = useState<{ open: boolean; supplierId: string; supplierName: string } | null>(null);
  const [histDlg, setHistDlg] = useState<{ open: boolean; supplierId: string; supplierName: string } | null>(null);
  const [payAmount, setPayAmount] = useState('');
  const [payDesc, setPayDesc] = useState('');

  const totalPurchase    = getTotalPurchaseDebt();
  const totalCommission  = getTotalCommissionDebt();
  const totalDebt        = totalPurchase + totalCommission;

  const filtered = suppliers.filter(s =>
    !search.trim() || s.name.toLowerCase().includes(search.toLowerCase())
  );

  const submitPay = () => {
    const n = parseFloat(payAmount);
    if (!payDlg || !n || n <= 0) return;
    paySupplier(payDlg.supplierId, n, payDesc || 'תשלום לספק');
    setPayAmount(''); setPayDesc(''); setPayDlg(null);
  };

  const supplierHistory = histDlg
    ? supplierPayments.filter(p => p.supplierId === histDlg.supplierId)
        .sort((a, b) => b.date.localeCompare(a.date))
    : [];

  return (
    <div className="space-y-4">

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="p-4 text-center shadow-soft border-destructive/30 bg-destructive/5">
          <div className="text-xs text-destructive font-bold mb-1 flex items-center justify-center gap-1">
            <Package className="w-3.5 h-3.5" /> חוב קניה
          </div>
          <div className="text-xl font-black text-destructive">{fmtMoney(totalPurchase)}</div>
        </Card>
        <Card className="p-4 text-center shadow-soft border-orange-200 bg-orange-50">
          <div className="text-xs text-orange-600 font-bold mb-1 flex items-center justify-center gap-1">
            <Boxes className="w-3.5 h-3.5" /> חוב קומיסיון
          </div>
          <div className="text-xl font-black text-orange-600">{fmtMoney(totalCommission)}</div>
        </Card>
        <Card className="p-4 text-center shadow-soft border-muted">
          <div className="text-xs text-muted-foreground font-bold mb-1">סה"כ חובות</div>
          <div className="text-xl font-black text-foreground">{fmtMoney(totalDebt)}</div>
        </Card>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="חיפוש ספק..."
          className="pr-10"
        />
      </div>

      {/* Suppliers table */}
      {filtered.length === 0 ? (
        <div className="text-center text-muted-foreground py-12">
          <ShoppingBag className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="text-sm">אין ספקים</p>
        </div>
      ) : (
        <Card className="shadow-soft overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40 hover:bg-muted/40">
                <TableHead className="text-right text-xs font-bold text-muted-foreground">ספק</TableHead>
                <TableHead className="text-right text-xs font-bold text-muted-foreground">סוג</TableHead>
                <TableHead className="text-right text-xs font-bold text-muted-foreground">שולם</TableHead>
                <TableHead className="text-right text-xs font-bold text-muted-foreground">חוב</TableHead>
                <TableHead className="text-xs font-bold text-muted-foreground">פעולות</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(s => {
                const debt = getSupplierDebt(s.id);
                const paid = supplierPayments.filter(p => p.supplierId === s.id).reduce((sum, p) => sum + p.amount, 0);
                return (
                  <TableRow key={s.id}>
                    <TableCell className="font-bold text-primary text-sm">{s.name}</TableCell>
                    <TableCell>
                      <Badge className={cn('border text-xs', s.type === 'purchase'
                        ? 'bg-orange-100 text-orange-700 border-orange-200'
                        : 'bg-purple-100 text-purple-700 border-purple-200'
                      )}>
                        {s.type === 'purchase' ? 'קניה' : 'קומיסיון'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-green-600 font-semibold">{fmtMoney(paid)}</TableCell>
                    <TableCell>
                      <span className={cn('font-bold text-sm', debt > 0 ? 'text-destructive' : 'text-green-600')}>
                        {fmtMoney(debt)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button
                          size="sm"
                          variant="outline"
                          className="gap-1.5 h-8 text-xs"
                          onClick={() => { setPayDlg({ open: true, supplierId: s.id, supplierName: s.name }); setPayAmount(''); setPayDesc(''); }}
                          disabled={debt <= 0}
                        >
                          <Wallet className="w-3.5 h-3.5" /> תשלום
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 w-8 p-0"
                          onClick={() => setHistDlg({ open: true, supplierId: s.id, supplierName: s.name })}
                        >
                          <History className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Card>
      )}

      {/* Pay dialog */}
      <Dialog open={!!payDlg?.open} onOpenChange={o => { if (!o) setPayDlg(null); }}>
        <DialogContent dir="rtl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Wallet className="w-5 h-5" /> תשלום ל-{payDlg?.supplierName}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1">
              <Label>סכום (₪)</Label>
              <Input type="number" value={payAmount} onChange={e => setPayAmount(e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label>תיאור</Label>
              <Input value={payDesc} onChange={e => setPayDesc(e.target.value)} placeholder="פרטי התשלום" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPayDlg(null)}>ביטול</Button>
            <Button onClick={submitPay}>אישור תשלום</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* History dialog */}
      <Dialog open={!!histDlg?.open} onOpenChange={o => { if (!o) setHistDlg(null); }}>
        <DialogContent dir="rtl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <History className="w-5 h-5" /> היסטוריית תשלומים — {histDlg?.supplierName}
            </DialogTitle>
          </DialogHeader>
          {supplierHistory.length === 0 ? (
            <p className="text-center text-muted-foreground py-6 text-sm">אין תשלומים</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-right">תאריך</TableHead>
                  <TableHead className="text-right">סכום</TableHead>
                  <TableHead className="text-right">תיאור</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {supplierHistory.map(p => (
                  <TableRow key={p.id}>
                    <TableCell>{fmtDate(p.date)}</TableCell>
                    <TableCell className="font-bold text-green-600">{fmtMoney(p.amount)}</TableCell>
                    <TableCell className="text-muted-foreground">{p.description}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setHistDlg(null)}>סגור</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
