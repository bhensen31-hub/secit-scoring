import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../lib/supabase';

// Fetches all drink logs and subscribes to real-time inserts.
// Returns { drinkCounts, loading, logDrink, isConnected }
// drinkCounts: { [playerId]: number }
export function useDrinks() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const channelRef = useRef(null);
  const channelName = useRef(`drinks_${Math.random().toString(36).slice(2)}`);

  useEffect(() => {
    supabase
      .from('drinks')
      .select('player_id')
      .then(({ data }) => {
        setRows(data || []);
        setLoading(false);
      });

    const channel = supabase
      .channel(channelName.current)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'drinks' },
        (payload) => {
          setRows(prev => [...prev, payload.new]);
        }
      )
      .subscribe((status) => {
        setIsConnected(status === 'SUBSCRIBED');
      });

    channelRef.current = channel;
    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, []);

  const logDrink = useCallback(async (playerId) => {
    const { error } = await supabase
      .from('drinks')
      .insert({ player_id: playerId });
    return { error };
  }, []);

  const drinkCounts = rows.reduce((acc, r) => {
    acc[r.player_id] = (acc[r.player_id] || 0) + 1;
    return acc;
  }, {});

  return { drinkCounts, loading, logDrink, isConnected };
}
