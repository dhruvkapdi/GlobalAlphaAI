import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export function useAIHistory() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['ai-history', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('ai_insights_history')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);
      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
  });
}

export function useSaveAIInsight() {
  const { user } = useAuth();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({ prompt, response, metadata }: { prompt: string; response: string; metadata?: any }) => {
      if (!user) throw new Error('Not authenticated');
      const { error } = await supabase.from('ai_insights_history').insert({
        user_id: user.id,
        prompt,
        response,
        response_metadata: metadata || {},
      });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['ai-history'] }),
  });
}
