import { useMemo, useState } from 'react';
import { useStore } from '../../../store/useStore';
import { Search, Truck, Package, ShoppingBag, Boxes, Wallet, Plus, History } from 'lucide-react';
import { Card } from '../../ui/card';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Badge } from '../../ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../ui/dialog';

const fmtMoney = (n: number) => `₪${n.toFixed(2)}`;
const fmtDate  = (d: string) => new Date(d).toLocaleDateString('he-IL');

// ─── Summary card ──────────────────────────────────────────────────────────────
function SummaryCard({
  icon, label, value, highlight,
}: { icon: React.ReactNode; label: string; value: string; highlight?: boolean }) {
  return (
    <Card className={`p-4 flex items-center gap-3 shadow-soft ${highlight ? 'border-destructive/40 bg-destructive/5' : ''}`}>
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${highlight ? 'bg-destructive/10 text-destructive' : 'bg-primary/10 text-primary'}`}>
        {icon}
      </div>
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className={`text-base font-bold ${highlight ? 'text-destructive' : ''}`}>{value}</p>
      </div>
    </Card>
  );
}

// ─── Per-supplier stats computation ───────────────────────────────────────────
function useSupplierStats() {
  const { products, suppliers, supplierPayments } = useStore();

  return useMemo(() => {
    type Stats = {
      supplierId: string; name: string;
      productsCount: number;
      totalSupplied: number; totalSuppliedCost: number;
      totalSold: number; remaining: number; remainingCost: number;
      paid: number; debt: number;
    };

    const map = new Map<string, Stats>();

    // seed from suppliers list
    for (const s of suppliers) {
      map.set(s.id, {
        supplierId: s.id, name: s.name,
        productsCount: 0, totalSupplied: 0, totalSuppliedCost: 0,
        totalSold: 0, remaining: 0, remainingCost: 0, paid: 0, debt: 0,
      });
    }

    // aggregate from products/variants
    for (const p of products) {
      const sid = p.supplierId || '__none__';
      const name = suppliers.find(s => s.id === sid)?.name ?? 'ללא ספק';
      if (!map.has(sid)) {
        map.set(sid, {
          supplierId: sid, name,
          productsCount: 0, totalSupplied: 0, totalSuppliedCost: 0,
          totalSold: 0, remaining: 0, remainingCost: 0, paid: 0, debt: 0,
        });
      }
      const cur = map.get(sid)!;
      cur.productsCount += 1;

      for (const v of p.variants) {
        const supplies = v.supplies ?? [];
        const supplied    = supplies.reduce((s, x) => s + x.quantity, 0);
        const suppliedCost = supplies.reduce((s, x) => s + x.quantity * x.costPerUnit, 0);
        const avgCost     = supplied > 0 ? suppliedCost / supplied : (v.costPrice ?? 0);
        const remaining   = v.currentStock;
        const sold        = v.totalSold;

        cur.totalSupplied     += supplied;
        cur.totalSuppliedCost += suppliedCost;
        cur.totalSold         += sold;
        cur.remaining         += remaining;
        cur.remainingCost     += remaining * avgCost;
      }
    }

    // payments
    for (const pay of supplierPayments) {
      const cur = map.get(pay.supplierId);
      if (cur) cur.paid += pay.amount;
    }

    // compute debt
    for (const v of map.values()) {
      v.debt = Math.max(0, v.totalSuppliedCost - v.paid);
    }

    return Array.from(map.values())
      .filter(s => s.productsCount > 0 || s.paid > 0)
      .sort((a, b) => b.totalSuppliedCost - a.totalSuppliedCost);
  }, [products, suppliers, supplierPayments]);
}

// ─── Main ──────────────────────────────────────────────────────────────────────
export default function DebtsTab() {
  const { supplierPayments, paySupplier } = useStore();
  const stats = useSupplierStats();

  const [query, setQuery] = useState('');
  const [payDlg, setPayDlg]   = useState<{ supplierId: string; name: string; debt: number } | null>(null);
  const [histDlg, setHistDlg] = useState<{ supplierId: string; name: string } | null>(null);
  const [payDate,   setPayDate]   = useState(new Date().toISOString().slice(0, 10));
  const [payAmount, setPayAmount] = useState('');
  const [payNote,   setPayNote]   = useState('');

  const filtered = stats.filter(s =>
    !query.trim() || s.name.toLowerCase().includes(query.toLowerCase())
  );

  const totals = filtered.reduce(
    (acc, s) => ({
      count:        acc.count + 1,
      suppliedCost: acc.suppliedCost + s.totalSuppliedCost,
      remainingCost:acc.remainingCost + s.remainingCost,
      paid:         acc.paid + s.paid,
      debt:         acc.debt + s.debt,
    }),
    { count: 0, suppliedCost: 0, remainingCost: 0, paid: 0, debt: 0 }
  );

  const handlePay = () => {
    const n = parseFloat(payAmount);
    if (!payDlg || !n || n <= 0) return;
    paySupplier(payDlg.supplierId, n, payNote.trim() || 'תשלום לספק');
    setPayDlg(null); setPayAmount(''); setPayNote('');
    setPayDate(new Date().toISOString().slice(0, 10));
  };

  const history = histDlg
    ? supplierPayments
        .filter(p => p.supplierId === histDlg.supplierId)
        .sort((a, b) => b.date.localeCompare(a.date))
    : [];

  return (
    <div className="space-y-4">

      {/* 5 Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <SummaryCard icon={<Truck   className="w-4 h-4" />} label="ספקים"        value={String(totals.count)} />
        <SummaryCard icon={<Package className="w-4 h-4" />} label="עלות סופקה"   value={fmtMoney(totals.suppliedCost)} />
        <SummaryCard icon={<Boxes   className="w-4 h-4" />} label="עלות במלאי"   value={fmtMoney(totals.remainingCost)} />
        <SummaryCard icon={<Wallet  className="w-4 h-4" />} label="שולם לספקים"  value={fmtMoney(totals.paid)} />
        <SummaryCard icon={<ShoppingBag className="w-4 h-4" />} label="חוב לספקים" value={fmtMoney(totals.debt)} highlight />
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input value={query} onChange={e => setQuery(e.target.value)} placeholder="חיפוש ספק..." className="pr-10" />
      </div>

      {/* Table */}
      <div className="rounded-xl border bg-card shadow-soft overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-secondary/60">
              <TableHead className="text-right">ספק</TableHead>
              <TableHead className="text-right">מוצרים</TableHead>
              <TableHead className="text-right">סופק</TableHead>
              <TableHead className="text-right">עלות סופקה</TableHead>
              <TableHead className="text-right">נמכר</TableHead>
              <TableHead className="text-right">במלאי</TableHead>
              <TableHead className="text-right">שולם</TableHead>
              <TableHead className="text-right">יתרת חוב</TableHead>
              <TableHead className="text-right w-28">פעולות</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-10 text-muted-foreground">
                  אין נתוני ספקים
                </TableCell>
              </TableRow>
            )}
            {filtered.map(s => (
              <TableRow key={s.supplierId} className="hover:bg-muted/40">
                <TableCell className="font-bold text-primary">{s.name}</TableCell>
                <TableCell>{s.productsCount}</TableCell>
                <TableCell>{s.totalSupplied}</TableCell>
                <TableCell className="font-semibold">{fmtMoney(s.totalSuppliedCost)}</TableCell>
                <TableCell>{s.totalSold}</TableCell>
                <TableCell className="font-bold">{s.remaining}</TableCell>
                <TableCell className="text-green-600 font-semibold">{fmtMoney(s.paid)}</TableCell>
                <TableCell>
                  <Badge variant={s.debt > 0.01 ? 'destructive' : 'default'}>
                    {fmtMoney(s.debt)}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Button
                      size="sm" variant="default" className="gap-1 h-8"
                      onClick={() => { setPayDlg({ supplierId: s.supplierId, name: s.name, debt: s.debt }); setPayAmount(s.debt > 0 ? s.debt.toFixed(2) : ''); }}
                    >
                      <Plus className="w-3 h-3" /> תשלום
                    </Button>
                    <Button
                      size="icon" variant="ghost" className="h-8 w-8" title="היסטוריה"
                      onClick={() => setHistDlg({ supplierId: s.supplierId, name: s.name })}
                    >
                      <History className="w-4 h-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Payment dialog */}
      <Dialog open={!!payDlg} onOpenChange={o => { if (!o) { setPayDlg(null); setPayAmount(''); setPayNote(''); } }}>
        <DialogContent dir="rtl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Wallet className="w-5 h-5" /> תשלום ל-{payDlg?.name}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label>תאריך</Label>
              <Input type="date" value={payDate} onChange={e => setPayDate(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>סכום (₪)</Label>
              <Input type="number" value={payAmount} onChange={e => setPayAmount(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>הערה</Label>
              <Input value={payNote} onChange={e => setPayNote(e.target.value)} placeholder="פרטי התשלום" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setPayDlg(null); setPayAmount(''); setPayNote(''); }}>ביטול</Button>
            <Button onClick={handlePay}>אישור</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* History dialog */}
      <Dialog open={!!histDlg} onOpenChange={o => { if (!o) setHistDlg(null); }}>
        <DialogContent dir="rtl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <History className="w-5 h-5" /> היסטוריית תשלומים — {histDlg?.name}
            </DialogTitle>
          </DialogHeader>
          {history.length === 0 ? (
            <p className="text-center text-muted-foreground py-6 text-sm">אין תשלומים עדיין</p>
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
                {history.map(p => (
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
