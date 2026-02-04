import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { api } from '@/lib/api';

export function useAddToLibrary() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      externalId: string;
      source: 'tmdb' | 'anilist';
      type: 'movie' | 'series' | 'anime';
      status: 'watched' | 'watching' | 'want_to_watch' | 'dropped' | 'paused';
      rating?: number;
      episodesWatched?: number;
      watchedAt?: string;
      notes?: string;
    }) => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        throw new Error('Not authenticated');
      }
      return api.addToLibrary(session.access_token, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userContent'] });
    },
  });
}

export function useUserContent(status?: 'watched' | 'watching' | 'want_to_watch' | 'dropped' | 'paused') {
  return useQuery({
    queryKey: ['userContent', status],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        throw new Error('Not authenticated');
      }
      return api.getUserContent(session.access_token, status);
    },
  });
}

export function useUpdateUserContent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      userContentId,
      data,
    }: {
      userContentId: string;
      data: {
        status?: 'watched' | 'watching' | 'want_to_watch' | 'dropped' | 'paused';
        rating?: number;
        episodesWatched?: number;
        watchedAt?: string;
        notes?: string;
      };
    }) => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        throw new Error('Not authenticated');
      }
      return api.updateUserContent(session.access_token, userContentId, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userContent'] });
    },
  });
}

export function useDeleteUserContent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userContentId: string) => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        throw new Error('Not authenticated');
      }
      return api.deleteUserContent(session.access_token, userContentId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userContent'] });
    },
  });
}
