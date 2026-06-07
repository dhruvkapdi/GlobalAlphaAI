import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export function useUserSettings() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['user-settings', user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', user.id)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });
}

export function useUpdateUserSettings() {
  const { user } = useAuth();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (updates: {
      theme?: string;
      notifications_enabled?: boolean;
      price_alerts?: boolean;
      ai_predictions_alerts?: boolean;
      market_news_alerts?: boolean;
      portfolio_update_alerts?: boolean;
    }) => {
      if (!user) throw new Error('Not authenticated');
      const { error } = await supabase.from('user_settings').update(updates).eq('user_id', user.id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['user-settings'] }),
  });
}
