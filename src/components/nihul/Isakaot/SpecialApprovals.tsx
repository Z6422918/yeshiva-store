import { useState } from 'react';
import { useStore } from '../../../store/useStore';
import { Save, ShieldCheck, KeyRound, Check, X, Clock, Banknote, CreditCard, RefreshCw } from 'lucide-react';
import { Card } from '../../ui/card';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Badge } from '../../ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../ui/dialog';
import type { SpecialApproval } from '../../../types';

const fmtDate = (d: string) => { try { return new Date(d).toLocaleString('he-IL'); } catch { return d; } };
const fmtMoney = (n: number | undefined | null) => `₪${(n ?? 0).toFixed(2)}`;

export default function SpecialApprovals() {
  const {
    specialApprovals, updateApprovalStatus, completeSpecialApproval,
    transactions, moveTransactionToMethod,
    settings, updateSettings,
  } = useStore();
  const [refreshKey, setRefreshKey] = useState(0);

  // Code management (loaded from settings)
  const [specialCode, setSpecialCode] = useState(settings?.specialApprovalCode ?? '1234');

  // Approve dialog
  const [approveDialog, setApproveDialog] = useState<SpecialApproval | null>(null);
  const [approverName, setApproverName] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSaveCode = () => {
    if (!specialCode.trim()) return;
    updateSettings({ specialApprovalCode: specialCode.trim() });
  };

  const handleApprove = () => {
    if (!approveDialog) return;
    if (!approverName.trim()) { alert('יש להזין שם מאשר'); return; }
    setSubmitting(true);
    completeSpecialApproval(approveDialog.id, approverName.trim());
    setApproveDialog(null);
    setApproverName('');
    setSubmitting(false);
  };

  const handleReject = (approval: SpecialApproval) => {
    updateApprovalStatus(approval.id, 'rejected');
  };

  const pending = [...(specialApprovals ?? [])]
    .filter(a => a.status === 'pending')
    .sort((a, b) => (b.date ?? '').localeCompare(a.date ?? ''));

  const resolved = [...(specialApprovals ?? [])]
    .filter(a => a.status !== 'pending')
    .sort((a, b) => (b.date ?? '').localeCompare(a.date ?? ''));

  // Special transactions awaiting classification (not yet moved to cash/credit)
  const specialTxs = [...(transactions ?? [])]
    .filter(t => t.paymentMethod === 'special')
    .sort((a, b) => (b.date ?? '').localeCompare(a.date ?? ''));

  return (
    <div className="space-y-6">

      {/* ── Special code inline row ── */}
      <div className="flex items-center gap-2 flex-wrap" dir="rtl">
        <KeyRound className="w-4 h-4 text-accent shrink-0" />
        <span className="text-sm font-semibold shrink-0">קוד אישור מיוחד</span>
        <Input
          type="text"
          value={specialCode}
          onChange={e => setSpecialCode(e.target.value)}
          placeholder="קוד..."
          className="h-9 max-w-[180px]"
        />
        <Button onClick={handleSaveCode} size="sm" className="gap-2 h-9">
          <Save className="w-4 h-4" /> שמור
        </Button>
      </div>

      {/* ── Pending approvals ── */}
      <Card className="p-6 shadow-soft">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-accent" />
            <h3 className="text-lg font-bold">בקשות ממתינות לאישור</h3>
            {pending.length > 0 && (
              <Badge variant="destructive" className="text-xs">{pending.length}</Badge>
            )}
          </div>
          <Button
            variant="outline" size="sm"
            onClick={() => setRefreshKey(k => k + 1)}
            className="gap-1.5 text-muted-foreground"
          >
            <RefreshCw className="w-3.5 h-3.5" /> רענן
          </Button>
        </div>

        {pending.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">אין בקשות ממתינות</div>
        ) : (
          <div className="rounded-xl border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-secondary/60">
                  <TableHead className="text-right">תאריך</TableHead>
                  <TableHead className="text-right">שם</TableHead>
                  <TableHead className="text-right">סיבה</TableHead>
                  <TableHead className="text-right">סכום</TableHead>
                  <TableHead className="text-right">סוג קונה</TableHead>
                  <TableHead className="text-right">פעולות</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pending.map(a => (
                  <TableRow key={a.id}>
                    <TableCell className="text-sm">{fmtDate(a.date)}</TableCell>
                    <TableCell className="font-medium">{a.firstName} {a.lastName}</TableCell>
                    <TableCell className="text-sm max-w-[200px] truncate">{a.reason}</TableCell>
                    <TableCell className="font-semibold">{fmtMoney(a.total)}</TableCell>
                    <TableCell>
                      <Badge variant={a.customerType === 'yeshiva' ? 'default' : 'secondary'}>
                        {a.customerType === 'yeshiva' ? 'בן ישיבה' : 'חיצוני'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          onClick={() => setApproveDialog(a)}
                          className="gap-1 bg-green-600 hover:bg-green-700 text-white"
                        >
                          <Check className="w-3 h-3" /> אשר
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleReject(a)}
                          className="gap-1"
                        >
                          <X className="w-3 h-3" /> דחה
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </Card>

      {/* ── Transaction sorting (special → cash or credit) ── */}
      {specialTxs.length > 0 && (
        <Card className="p-4 bg-accent/5 border-accent/30">
          <div className="flex items-center gap-2 mb-2">
            <ShieldCheck className="w-5 h-5 text-accent" />
            <h3 className="font-bold">מיון עסקאות אישור מיוחד</h3>
            <Badge variant="destructive">{specialTxs.length}</Badge>
          </div>
          <p className="text-xs text-muted-foreground mb-3">
            עסקאות שאושרו באישור מיוחד וטרם שויכו לאופן תשלום סופי
          </p>
          <div className="space-y-2">
            {specialTxs.map(t => {
              // Look up reason from matching approved approval
              const matchApproval = specialApprovals.find(a =>
                a.status === 'approved' &&
                a.approverName === t.cashierName &&
                Math.abs((a.total ?? 0) - t.totalAmount) < 0.01
              );
              return (
                <Card key={t.id} className="p-3 bg-background">
                  <div className="flex items-start justify-between flex-wrap gap-3">
                    <div className="space-y-1 flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-medium">{fmtDate(t.date)}</span>
                        <Badge variant="outline">
                          {t.buyerType === 'yeshiva' ? 'בן ישיבה' : 'מבחוץ'}
                        </Badge>
                        {t.cashierName && (
                          <Badge variant="secondary" className="text-xs">{t.cashierName}</Badge>
                        )}
                      </div>
                      {matchApproval?.reason && (
                        <div className="text-xs text-muted-foreground">
                          סיבה: {matchApproval.reason}
                          {matchApproval.approverName && ` [אושר ע"י ${matchApproval.approverName}]`}
                        </div>
                      )}
                      <div className="text-xs text-muted-foreground">
                        {t.items.map((it, i) => (
                          <span key={i} className="ml-2">{it.productName} ×{it.quantity}</span>
                        ))}
                      </div>
                    </div>
                    <div className="text-left shrink-0">
                      <div className="text-lg font-bold text-primary mb-2">{fmtMoney(t.totalAmount)}</div>
                      <div className="flex gap-2 flex-wrap justify-end">
                        <Button
                          size="sm"
                          onClick={() => moveTransactionToMethod(t.id, 'cash')}
                          className="gap-1 bg-green-600 hover:bg-green-700 text-white"
                        >
                          <Banknote className="w-4 h-4" /> העברה למזומן
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => moveTransactionToMethod(t.id, 'credit')}
                          className="gap-1"
                        >
                          <CreditCard className="w-4 h-4" /> שיוך לאשראי
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </Card>
      )}

      {/* ── Resolved history ── */}
      {resolved.length > 0 && (
        <Card className="p-6 shadow-soft">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="w-5 h-5 text-muted-foreground" />
            <h3 className="text-lg font-bold">היסטוריית בקשות</h3>
          </div>
          <div className="rounded-xl border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-secondary/60">
                  <TableHead className="text-right">תאריך</TableHead>
                  <TableHead className="text-right">שם</TableHead>
                  <TableHead className="text-right">סכום</TableHead>
                  <TableHead className="text-right">סטטוס</TableHead>
                  <TableHead className="text-right">מאשר</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {resolved.map(a => (
                  <TableRow key={a.id}>
                    <TableCell className="text-sm">{fmtDate(a.date)}</TableCell>
                    <TableCell className="font-medium">{a.firstName} {a.lastName}</TableCell>
                    <TableCell className="font-semibold">{fmtMoney(a.total)}</TableCell>
                    <TableCell>
                      <Badge variant={a.status === 'approved' ? 'default' : 'destructive'}>
                        {a.status === 'approved' ? 'אושר' : a.status === 'rejected' ? 'נדחה' : 'בוטל'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm">{a.approverName || '—'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>
      )}

      {/* ── Approve dialog ── */}
      <Dialog open={!!approveDialog} onOpenChange={o => !o && setApproveDialog(null)}>
        <DialogContent dir="rtl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-accent" /> אישור בקשה
            </DialogTitle>
          </DialogHeader>
          {approveDialog && (
            <div className="space-y-4">
              <div className="rounded-lg border bg-secondary/30 p-3 text-sm space-y-1">
                <div><strong>שם:</strong> {approveDialog.firstName} {approveDialog.lastName}</div>
                <div><strong>סיבה:</strong> {approveDialog.reason}</div>
                <div><strong>סכום:</strong> {fmtMoney(approveDialog.total)}</div>
                <div><strong>סוג קונה:</strong> {approveDialog.customerType === 'yeshiva' ? 'בן ישיבה' : 'חיצוני'}</div>
              </div>
              <div className="space-y-1.5">
                <Label>שם המאשר</Label>
                <Input
                  value={approverName}
                  onChange={e => setApproverName(e.target.value)}
                  placeholder="שם מלא של המאשר..."
                  autoFocus
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setApproveDialog(null)}>ביטול</Button>
            <Button
              onClick={handleApprove}
              disabled={submitting}
              className="gap-2 bg-green-600 hover:bg-green-700 text-white"
            >
              <Check className="w-4 h-4" /> {submitting ? 'מאשר...' : 'אשר ורשום עסקה'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
