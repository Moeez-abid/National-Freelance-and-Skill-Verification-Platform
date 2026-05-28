/**
 * useGigs.js — React hooks for the Gig Listing domain.
 * All components import from this file instead of calling api.js directly.
 *
 * Usage in any screen:
 *   import { useGigs, useGig } from '../../hooks/useGigs';
 *   const { gigs, loading, error, meta } = useGigs({ category_id, page: 1, limit: 6 });
 */

import { useState, useEffect, useCallback } from 'react';
import { gigApi } from '../services/api';

/* ─── List gigs (browse / marketplace) ─────────────────────────────────────── */
export function useGigs(filters = {}) {
  const [gigs,    setGigs]    = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);
  const [meta,    setMeta]    = useState({ page: 1, limit: 20, total: 0, totalPages: 0 });

  const fetchGigs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await gigApi.list(filters);
      if (res.success) {
        setGigs(res.data || []);
        setMeta(res.meta || meta);
      } else {
        setError(res.error || 'Failed to load gigs');
      }
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(filters)]);

  useEffect(() => { fetchGigs(); }, [fetchGigs]);

  return { gigs, loading, error, meta, refresh: fetchGigs };
}

/* ─── Single gig detail ─────────────────────────────────────────────────────── */
export function useGig(gigId) {
  const [gig,     setGig]     = useState(null);
  const [loading, setLoading] = useState(!!gigId);
  const [error,   setError]   = useState(null);

  useEffect(() => {
    if (!gigId) return;
    setLoading(true);
    setError(null);
    gigApi.getById(gigId)
      .then(res => {
        if (res.success) setGig(res.data);
        else setError(res.error || 'Gig not found');
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [gigId]);

  return { gig, loading, error };
}

/* ─── Freelancer's own gigs dashboard ──────────────────────────────────────── */
export function useMyGigs(filters = {}) {
  const [gigs,    setGigs]    = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);
  const [meta,    setMeta]    = useState({ total: 0 });

  const fetchMyGigs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await gigApi.myGigs(filters);
      if (res.success) {
        setGigs(res.data || []);
        setMeta(res.meta || meta);
      } else {
        setError(res.error || 'Failed to load your gigs');
      }
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(filters)]);

  useEffect(() => { fetchMyGigs(); }, [fetchMyGigs]);

  return { gigs, loading, error, meta, refresh: fetchMyGigs };
}

/* ─── Create gig action ─────────────────────────────────────────────────────── */
export function useCreateGig() {
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState(null);
  const [created, setCreated] = useState(null);

  const createGig = async (gigData) => {
    setLoading(true);
    setError(null);
    setCreated(null);
    try {
      const res = await gigApi.create(gigData);
      if (res.success) {
        setCreated(res.data);
        return res.data;
      } else {
        setError(res.error || 'Failed to create gig');
        return null;
      }
    } catch (e) {
      setError(e.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { createGig, loading, error, created };
}

/* ─── Update gig action ─────────────────────────────────────────────────────── */
export function useUpdateGig() {
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState(null);

  const updateGig = async (gigId, updates) => {
    setLoading(true);
    setError(null);
    try {
      const res = await gigApi.update(gigId, updates);
      if (res.success) return res.data;
      setError(res.error || 'Failed to update gig');
      return null;
    } catch (e) {
      setError(e.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { updateGig, loading, error };
}
