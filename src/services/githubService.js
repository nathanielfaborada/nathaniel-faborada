import { getCache, setCache } from './cacheService';
import { GITHUB_USERS, GITHUB_ORGANIZATIONS } from '../data/collaboratorsData';

export const GITHUB_USERS_CACHE_KEY = 'github_users_cache_v2';
export const GITHUB_ORGS_CACHE_KEY = 'github_orgs_cache_v1';

/**
 * Fetch GitHub user profiles by username list with caching.
 * @param {string[]} usernames
 * @returns {Promise<Record<string, any>>}
 */
export async function fetchGithubUsers(usernames = GITHUB_USERS) {
  // 1. Check local cache first
  const cached = getCache(GITHUB_USERS_CACHE_KEY);
  if (cached) {
    return cached;
  }

  // 2. Fetch from GitHub REST API concurrently
  const results = await Promise.allSettled(
    usernames.map((username) =>
      fetch(`https://api.github.com/users/${username}`).then((res) => {
        if (!res.ok) throw new Error(`Failed to fetch user ${username}`);
        return res.json();
      })
    )
  );

  // 3. Build username -> profile map
  const profileMap = {};
  results.forEach((result, index) => {
    const username = usernames[index];
    if (result.status === 'fulfilled' && result.value && result.value.avatar_url) {
      profileMap[username] = result.value;
    }
  });

  // 4. Save to cache and return
  setCache(GITHUB_USERS_CACHE_KEY, profileMap);
  return profileMap;
}

/**
 * Fetch GitHub organizations by organization name list with caching.
 * @param {string[]} orgs
 * @returns {Promise<any[]>}
 */
export async function fetchGithubOrganizations(orgs = GITHUB_ORGANIZATIONS) {
  // 1. Check local cache first
  const cached = getCache(GITHUB_ORGS_CACHE_KEY);
  if (cached) {
    return cached;
  }

  // 2. Fetch from GitHub REST API concurrently
  const results = await Promise.allSettled(
    orgs.map((org) =>
      fetch(`https://api.github.com/orgs/${org}`).then((res) => {
        if (!res.ok) throw new Error(`Failed to fetch org ${org}`);
        return res.json();
      })
    )
  );

  // 3. Filter successful responses with avatar_url
  const validOrgs = results
    .filter(
      (result) =>
        result.status === 'fulfilled' &&
        result.value &&
        result.value.avatar_url
    )
    .map((result) => result.value);

  // 4. Save to cache and return
  setCache(GITHUB_ORGS_CACHE_KEY, validOrgs);
  return validOrgs;
}
