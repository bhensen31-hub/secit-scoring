import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../lib/supabase';

// Fetches and subscribes to all hole scores for a given matchup.
// Returns: { scores, loading, error, upsertScore, isConnected }
// scores is a flat object: { "playerId-holeNum": grossStrokes }
export function useScores(matchupId) {
  const [scores, setScores] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const channelRef = useRef(null);
  const channelName = useRef(`scores_${matchupId}_${Math.random().toString(36).slice(2)}`);

  const applyRow = useCallback((row) => {
    setScores(prev => ({
      ...prev,
      [`${row.player_id}-${row.hole_number}`]: row.gross_strokes,
    }));
  }, []);

  const removeRow = useCallback((row) => {
    setScores(prev => {
      const next = { ...prev };
      delete next[`${row.player_id}-${row.hole_number}`];
      return next;
    });
  }, []);

  useEffect(() => {
    if (!matchupId) { setLoading(false); return; }

    setLoading(true);
    setError(null);

    // Initial fetch
    supabase
      .from('hole_scores')
      .select('*')
      .eq('matchup_id', matchupId)
      .then(({ data, error: fetchErr }) => {
        if (fetchErr) {
          setError(fetchErr.message);
        } else {
          const map = {};
          (data || []).forEach(row => {
            map[`${row.player_id}-${row.hole_number}`] = row.gross_strokes;
          });
          setScores(map);
        }
        setLoading(false);
      });

    // Real-time subscription
    const channel = supabase
      .channel(channelName.current)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'hole_scores',
          filter: `matchup_id=eq.${matchupId}`,
        },
        (payload) => {
          if (payload.eventType === 'DELETE') {
            removeRow(payload.old);
          } else {
            applyRow(payload.new);
          }
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
  }, [matchupId, applyRow, removeRow]);

  const upsertScore = useCallback(async (playerId, holeNumber, grossStrokes) => {
    // Optimistic update
    const key = `${playerId}-${holeNumber}`;
    setScores(prev => ({ ...prev, [key]: grossStrokes }));

    const { error: upsertErr } = await supabase
      .from('hole_scores')
      .upsert(
        {
          matchup_id: matchupId,
          hole_number: holeNumber,
          player_id: playerId,
          gross_strokes: grossStrokes,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'matchup_id,hole_number,player_id' }
      );

    if (upsertErr) {
      // Revert optimistic update on error
      setScores(prev => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
      return { error: upsertErr.message };
    }
    return { error: null };
  }, [matchupId]);

  return { scores, loading, error, upsertScore, isConnected };
}

// Hook to get all scores across all matchups (for leaderboard)
export function useAllScores() {
  const [allScores, setAllScores] = useState({});
  const [loading, setLoading] = useState(true);
  const channelRef = useRef(null);
  // Unique name per mount so StrictMode double-invoke never reuses a subscribed channel
  const channelName = useRef(`all_scores_${Math.random().toString(36).slice(2)}`);

  useEffect(() => {
    supabase
      .from('hole_scores')
      .select('*')
      .then(({ data }) => {
        const map = {};
        (data || []).forEach(row => {
          if (!map[row.matchup_id]) map[row.matchup_id] = {};
          map[row.matchup_id][`${row.player_id}-${row.hole_number}`] = row.gross_strokes;
        });
        setAllScores(map);
        setLoading(false);
      });

    const channel = supabase
      .channel(channelName.current)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'hole_scores' },
        (payload) => {
          const row = payload.new || payload.old;
          setAllScores(prev => {
            const next = { ...prev };
            if (!next[row.matchup_id]) next[row.matchup_id] = {};
            if (payload.eventType === 'DELETE') {
              const m = { ...next[row.matchup_id] };
              delete m[`${row.player_id}-${row.hole_number}`];
              next[row.matchup_id] = m;
            } else {
              next[row.matchup_id] = {
                ...next[row.matchup_id],
                [`${row.player_id}-${row.hole_number}`]: payload.new.gross_strokes,
              };
            }
            return next;
          });
        }
      )
      .subscribe();

    channelRef.current = channel;
    return () => {
      if (channelRef.current) supabase.removeChannel(channelRef.current);
    };
  }, []);

  return { allScores, loading };
}
