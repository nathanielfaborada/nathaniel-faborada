import { useState, useEffect, useCallback } from 'react';
import { fetchGithubUsers } from '../services/githubService';

export function useGithubUsers(usernames) {
  const [profileMap, setProfileMap] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadUsers = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchGithubUsers(usernames);
      setProfileMap(data);
    } catch (err) {
      console.error('Failed to load GitHub users:', err);
      setError(err);
    } finally {
      setIsLoading(false);
    }
  }, [usernames]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  return {
    profileMap,
    isLoading,
    error,
    refreshUsers: loadUsers,
  };
}
