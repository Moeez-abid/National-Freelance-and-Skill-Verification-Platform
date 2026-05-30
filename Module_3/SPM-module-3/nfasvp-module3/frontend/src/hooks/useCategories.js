import { useState, useEffect } from 'react';
import { categoryApi } from '../services/api';

export function useCategories() {
  const [categories, setCategories] = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState(null);

  useEffect(() => {
    categoryApi.getAll()
      .then(res => {
        if (res.success) setCategories(res.data || []);
        else setError(res.error || 'Failed to load categories');
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  return { categories, loading, error };
}
