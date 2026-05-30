/**
 * useJobs.js — React hooks for the Job Posting domain.
 *
 * Usage:
 *   import { useJobs, useJob } from '../../hooks/useJobs';
 *   const { jobs, loading, error } = useJobs({ status: 'open', category_id });
 */

import { useState, useEffect, useCallback } from 'react';
import { jobApi } from '../services/api';

/* ─── Browse open jobs ──────────────────────────────────────────────────────── */
export function useJobs(filters = {}) {
  const [jobs,    setJobs]    = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);
  const [meta,    setMeta]    = useState({ page: 1, limit: 20, total: 0 });

  const fetchJobs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await jobApi.list(filters);
      if (res.success) {
        setJobs(res.data || []);
        setMeta(res.meta || meta);
      } else {
        setError(res.error || 'Failed to load jobs');
      }
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(filters)]);

  useEffect(() => { fetchJobs(); }, [fetchJobs]);

  return { jobs, loading, error, meta, refresh: fetchJobs };
}

/* ─── Single job detail ─────────────────────────────────────────────────────── */
export function useJob(jobId) {
  const [job,     setJob]     = useState(null);
  const [loading, setLoading] = useState(!!jobId);
  const [error,   setError]   = useState(null);

  useEffect(() => {
    if (!jobId) return;
    setLoading(true);
    jobApi.getById(jobId)
      .then(res => {
        if (res.success) setJob(res.data);
        else setError(res.error || 'Job not found');
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [jobId]);

  return { job, loading, error };
}

/* ─── Client's own posted jobs ──────────────────────────────────────────────── */
export function useMyJobs(filters = {}) {
  const [jobs,    setJobs]    = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);
  const [meta,    setMeta]    = useState({ total: 0 });

  const fetchMyJobs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await jobApi.dashboard(filters);
      if (res.success) {
        setJobs(res.data || []);
        setMeta(res.meta || meta);
      } else {
        setError(res.error || 'Failed to load your jobs');
      }
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(filters)]);

  useEffect(() => { fetchMyJobs(); }, [fetchMyJobs]);

  return { jobs, loading, error, meta, refresh: fetchMyJobs };
}

/* ─── Post a new job ────────────────────────────────────────────────────────── */
export function usePostJob() {
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState(null);
  const [job,     setJob]     = useState(null);

  const postJob = async (jobData) => {
    setLoading(true);
    setError(null);
    setJob(null);
    try {
      const res = await jobApi.create(jobData);
      if (res.success) {
        setJob(res.data);
        return res.data;
      }
      const message = res.error || 'Failed to post job';
      setError(message);
      throw new Error(message);
    } catch (e) {
      setError(e.message);
      throw e;
    } finally {
      setLoading(false);
    }
  };

  return { postJob, loading, error, job };
}

/* ─── Update a job ──────────────────────────────────────────────────────────── */
export function useUpdateJob() {
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState(null);

  const updateJob = async (jobId, updates) => {
    setLoading(true);
    setError(null);
    try {
      const res = await jobApi.update(jobId, updates);
      if (res.success) return res.data;
      setError(res.error || 'Failed to update job');
      return null;
    } catch (e) {
      setError(e.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { updateJob, loading, error };
}

/* ─── Delete (cancel) a job ─────────────────────────────────────────────────── */
export function useDeleteJob() {
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState(null);

  const deleteJob = async (jobId) => {
    setLoading(true);
    setError(null);
    try {
      const res = await jobApi.delete(jobId);
      if (res.success) return true;
      setError(res.error || 'Failed to delete job');
      return false;
    } catch (e) {
      setError(e.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { deleteJob, loading, error };
}
