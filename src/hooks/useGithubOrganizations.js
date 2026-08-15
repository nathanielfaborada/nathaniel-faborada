import { useState, useEffect, useCallback } from 'react';
import { fetchGithubOrganizations } from '../services/githubService';

export function useGithubOrganizations(orgs) {
  const [organizations, setOrganizations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadOrgs = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchGithubOrganizations(orgs);
      setOrganizations(data);
    } catch (err) {
      console.error('Failed to load GitHub organizations:', err);
      setError(err);
    } finally {
      setIsLoading(false);
    }
  }, [orgs]);

  useEffect(() => {
    loadOrgs();
  }, [loadOrgs]);

  return {
    organizations,
    isLoading,
    error,
    refreshOrganizations: loadOrgs,
  };
}
