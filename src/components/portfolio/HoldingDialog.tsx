import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useAddHolding, useUpdateHolding, type Holding } from '@/hooks/usePortfolio';
import { toast } from '@/hooks/use-toast';

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  holding?: Holding | null;
}

export const HoldingDialog = ({ open, onOpenChange, holding }: Props) => {
  const isEdit = !!holding;
  const add = useAddHolding();
  const update = useUpdateHolding();

  const [symbol, setSymbol] = useState('');
  const [name, setName] = useState('');
  const [assetType, setAssetType] = useState('stock');
  const [quantity, setQuantity] = useState('');
  const [avgCost, setAvgCost] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (open) {
      setSymbol(holding?.symbol || '');
      setName(holding?.name || '');
      setAssetType(holding?.asset_type || 'stock');
      setQuantity(holding ? String(holding.quantity) : '');
      setAvgCost(holding ? String(holding.avg_cost) : '');
      setCurrency(holding?.currency || 'USD');
      setNotes(holding?.notes || '');
    }
  }, [open, holding]);

  const submit = async () => {
    const q = parseFloat(quantity);
    const c = parseFloat(avgCost);
    if (!symbol.trim() || !isFinite(q) || q <= 0 || !isFinite(c) || c < 0) {
      toast({ title: 'Invalid input', description: 'Please provide a symbol, quantity > 0 and a valid cost.', variant: 'destructive' });
      return;
    }
    try {
      if (isEdit && holding) {
        await update.mutateAsync({
          id: holding.id,
          patch: { symbol, name, asset_type: assetType, quantity: q, avg_cost: c, currency, notes },
        });
        toast({ title: 'Holding updated' });
      } else {
        await add.mutateAsync({ symbol, name, asset_type: assetType, quantity: q, avg_cost: c, currency, notes });
        toast({ title: 'Holding added' });
      }
      onOpenChange(false);
    } catch (e: any) {
      toast({ title: 'Error', description: e.message, variant: 'destructive' });
    }
  };

  const loading = add.isPending || update.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass-card-strong border-white/[0.08] max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit holding' : 'Add new holding'}</DialogTitle>
          <DialogDescription className="text-xs">
            Track a position in your portfolio. AI will analyze allocation, risk and P&L.
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-3 py-2">
          <div className="space-y-1.5 col-span-2 sm:col-span-1">
            <Label htmlFor="symbol" className="text-xs">Symbol *</Label>
            <Input id="symbol" placeholder="AAPL" value={symbol} onChange={e => setSymbol(e.target.value)} className="h-9" />
          </div>
          <div className="space-y-1.5 col-span-2 sm:col-span-1">
            <Label htmlFor="asset" className="text-xs">Asset type</Label>
            <Select value={assetType} onValueChange={setAssetType}>
              <SelectTrigger id="asset" className="h-9 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="stock">Stock</SelectItem>
                <SelectItem value="etf">ETF</SelectItem>
                <SelectItem value="crypto">Crypto</SelectItem>
                <SelectItem value="forex">Forex</SelectItem>
                <SelectItem value="commodity">Commodity</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5 col-span-2">
            <Label htmlFor="name" className="text-xs">Name</Label>
            <Input id="name" placeholder="Apple Inc." value={name} onChange={e => setName(e.target.value)} className="h-9" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="qty" className="text-xs">Quantity *</Label>
            <Input id="qty" type="number" step="any" placeholder="10" value={quantity} onChange={e => setQuantity(e.target.value)} className="h-9" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="cost" className="text-xs">Avg cost *</Label>
            <Input id="cost" type="number" step="any" placeholder="150" value={avgCost} onChange={e => setAvgCost(e.target.value)} className="h-9" />
          </div>
          <div className="space-y-1.5 col-span-2">
            <Label htmlFor="cur" className="text-xs">Currency</Label>
            <Select value={currency} onValueChange={setCurrency}>
              <SelectTrigger id="cur" className="h-9 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                {['USD', 'EUR', 'GBP', 'JPY', 'INR', 'CNY', 'CHF', 'CAD', 'AUD'].map(c => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5 col-span-2">
            <Label htmlFor="notes" className="text-xs">Notes</Label>
            <Textarea id="notes" placeholder="Thesis, target, etc." value={notes} onChange={e => setNotes(e.target.value)} className="text-xs min-h-[60px]" />
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" size="sm" onClick={() => onOpenChange(false)} disabled={loading}>Cancel</Button>
          <Button size="sm" onClick={submit} disabled={loading} className="bg-gradient-to-r from-primary to-accent">
            {loading && <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />}
            {isEdit ? 'Save changes' : 'Add holding'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
