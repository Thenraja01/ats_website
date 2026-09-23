import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useEffect, useState } from 'react';
import { notificationsAPI } from '../../services/api';

export function useNotifications() {
  const [unread, setUnread] = useState(0);
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['notifications'],
    queryFn: () => notificationsAPI.list({ limit: 30 }).then((r) => r.data),
  });

  const unreadQuery = useQuery({
    queryKey: ['notifications', 'unread'],
    queryFn: () => notificationsAPI.unreadCount().then((r) => r.data.count || 0),
  });

  useEffect(() => {
    setUnread(unreadQuery.data ?? 0);
  }, [unreadQuery.data]);

  const markRead = useMutation({
    mutationFn: (id) => notificationsAPI.markRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications', 'unread'] });
    },
  });

  const markAllRead = useMutation({
    mutationFn: () => notificationsAPI.markAllRead(),
    onSuccess: () => {
      toast.success('All notifications marked as read');
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications', 'unread'] });
    },
  });

  return { list: query.data || [], isLoading: query.isLoading, unread, markRead, markAllRead };
}

export function safeDate(value) {
  if (!value) return '—';
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? '—' : d.toLocaleDateString();
}