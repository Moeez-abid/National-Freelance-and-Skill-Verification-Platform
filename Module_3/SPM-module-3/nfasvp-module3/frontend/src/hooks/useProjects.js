import { useState, useEffect, useCallback } from 'react';
import { projectApi } from '../services/api';

/* ─── List user's projects ────────────────────────────────────────────────── */
export function useMyProjects(filters = {}) {
  const [projects, setProjects] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState(null);
  const [meta,     setMeta]     = useState({ total: 0 });

  const fetchProjects = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await projectApi.myProjects(filters);
      if (res.success) {
        setProjects(res.data || []);
        setMeta(res.pagination || { total: res.data?.length || 0 });
      } else {
        setError(res.error || 'Failed to load projects');
      }
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [JSON.stringify(filters)]);

  useEffect(() => { fetchProjects(); }, [fetchProjects]);

  return { projects, loading, error, meta, refresh: fetchProjects };
}

/* ─── Single project detail ───────────────────────────────────────────────── */
export function useProject(projectId) {
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(!!projectId);
  const [error,   setError]   = useState(null);

  const fetchProject = useCallback(async () => {
    if (!projectId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await projectApi.getById(projectId);
      if (res.success) {
        setProject(res.data);
      } else {
        setError(res.error || 'Project not found');
      }
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => { fetchProject(); }, [fetchProject]);

  return { project, loading, error, refresh: fetchProject };
}

/* ─── Update project status ───────────────────────────────────────────────── */
export function useUpdateProjectStatus() {
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState(null);

  const updateStatus = async (projectId, status) => {
    setLoading(true);
    setError(null);
    try {
      // Re-using the generic update from api.js if it exists, or specialized one
      // projectApi.update exists in api.js: update: (id, body) => request(`/projects/${id}`, { method: 'PUT', body: JSON.stringify(body) })
      // But projectRoutes has: PUT /api/v1/projects/:id/status
      // I should probably add a specialized method to projectApi or use generic one.
      // Let's assume we can use a specialized call for status.
      
      const res = await fetch(`/api/v1/projects/${projectId}/status`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionStorage.getItem('m3_auth_token')}`
        },
        body: JSON.stringify({ status })
      });
      const json = await res.json();
      if (json.success) return json.data;
      setError(json.error || 'Failed to update status');
      return null;
    } catch (e) {
      setError(e.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { updateStatus, loading, error };
}
