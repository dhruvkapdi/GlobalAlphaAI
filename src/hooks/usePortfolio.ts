import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface Holding {
  id: string;
  user_id: string;
  symbol: string;
  name: string;
  asset_type: string;
  quantity: number;
  avg_cost: number;
  currency: string;
  notes: string;
  created_at: string;
  updated_at: string;
}

export interface HoldingInput {
  symbol: string;
  name?: string;
  asset_type?: string;
  quantity: number;
  avg_cost: number;
  currency?: string;
  notes?: string;
}

export function usePortfolio() {
  return useQuery({
    queryKey: ['portfolio-holdings'],
    queryFn: async (): Promise<Holding[]> => {
      const { data, error } = await supabase
        .from('portfolio_holdings')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data || []) as Holding[];
    },
  });
}

export function useAddHolding() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: HoldingInput) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');
      const { data, error } = await supabase
        .from('portfolio_holdings')
        .insert({
          user_id: user.id,
          symbol: input.symbol.toUpperCase(),
          name: input.name || input.symbol.toUpperCase(),
          asset_type: input.asset_type || 'stock',
          quantity: input.quantity,
          avg_cost: input.avg_cost,
          currency: input.currency || 'USD',
          notes: input.notes || '',
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['portfolio-holdings'] }),
  });
}

export function useUpdateHolding() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, patch }: { id: string; patch: Partial<HoldingInput> }) => {
      const { data, error } = await supabase
        .from('portfolio_holdings')
        .update({ ...patch, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['portfolio-holdings'] }),
  });
}

export function useDeleteHolding() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('portfolio_holdings').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['portfolio-holdings'] }),
  });
}

// Generate a deterministic "current price" simulation from symbol so the UI feels live
// without requiring real-time API integration.
export function simulateCurrentPrice(symbol: string, avgCost: number): number {
  let h = 0;
  for (let i = 0; i < symbol.length; i++) h = (h * 31 + symbol.charCodeAt(i)) >>> 0;
  // Tie to date so it changes daily but is stable within the day
  const day = Math.floor(Date.now() / (1000 * 60 * 60 * 24));
  const seed = (h ^ day) >>> 0;
  const pct = ((seed % 4000) / 100 - 20) / 100; // -20% .. +20%
  return Math.max(0.01, avgCost * (1 + pct));
}
