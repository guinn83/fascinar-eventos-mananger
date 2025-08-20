import { STAFF_ROLE_LABELS, getRoleRank } from '../types/staff'
import type { EventStaffTemplate } from '../types/staff'

export function summarizeTemplate(template: EventStaffTemplate) {
  // build a roles_by_type map and reuse formatRolesByType for the breakdown
  const roles_by_type = template.default_roles.reduce<Record<string, number>>((acc, r) => {
    const qty = r.quantity || 0
    if (qty > 0) acc[r.staff_role] = (acc[r.staff_role] || 0) + qty
    return acc
  }, {})

  const total = Object.values(roles_by_type).reduce((s, n) => s + n, 0)
  const breakdown = formatRolesByType(roles_by_type)
  return { total, breakdown }
}

export function formatRolesByType(roles_by_type: Record<string, number>) {
  return Object.entries(roles_by_type)
    .filter(([, count]) => count > 0)
    .sort((a, b) => getRoleRank(a[0]) - getRoleRank(b[0]))
    .map(([role, count]) => {
      const label = (STAFF_ROLE_LABELS as Record<string, string>)[role] ?? role
      return `${count} ${label}`
    })
    .join(', ')
}

// prefer named exports to improve tree-shaking and clarity
