import { useMemo } from 'react';

export type Role = 'admin' | 'editor' | 'viewer';

/**
 * useRoles - simple hook to normalize roles and check membership.
 * Accepts an array of roles, a comma-separated string, or nothing.
 */
export default function useRoles(input?: Role[] | string | null) {
  const roles = useMemo(() => {
	if (!input) return [] as Role[];
	if (Array.isArray(input)) return input;
	return String(input)
	  .split(',')
	  .map(r => r.trim())
	  .filter(Boolean) as Role[];
  }, [input]);

  const hasRole = (role: Role | string) => roles.includes(role as Role);

  return { roles, hasRole };
}
