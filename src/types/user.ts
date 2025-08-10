// Tipos relacionados aos usuários e seus perfis

export type UserRole = 'client' | 'organizer' | 'admin'

export interface UserProfile {
  id: string
  user_id: string
  full_name?: string
  avatar_url?: string
  phone?: string
  bio?: string
  role: UserRole
  created_at: string
  updated_at: string
}

// Definir permissões por role
export interface RolePermissions {
  canViewAllEvents: boolean
  canCreateEvents: boolean
  canEditOwnEvents: boolean
  canEditAllEvents: boolean
  canDeleteOwnEvents: boolean
  canDeleteAllEvents: boolean
  canManageUsers: boolean
}

export const ROLE_PERMISSIONS: Record<UserRole, RolePermissions> = {
  client: {
    canViewAllEvents: false,
    canCreateEvents: true,
    canEditOwnEvents: true,
    canEditAllEvents: false,
    canDeleteOwnEvents: true,
    canDeleteAllEvents: false,
    canManageUsers: false,
  },
  organizer: {
    canViewAllEvents: true,
    canCreateEvents: true,
    canEditOwnEvents: true,
    canEditAllEvents: true,
    canDeleteOwnEvents: true,
    canDeleteAllEvents: true,
    canManageUsers: false,
  },
  admin: {
    canViewAllEvents: true,
    canCreateEvents: true,
    canEditOwnEvents: true,
    canEditAllEvents: true,
    canDeleteOwnEvents: true,
    canDeleteAllEvents: true,
    canManageUsers: true,
  },
}

// Função helper para verificar permissões
export const hasPermission = (role: UserRole, permission: keyof RolePermissions): boolean => {
  return ROLE_PERMISSIONS[role][permission]
}

// Função helper para verificar se o usuário pode ver todos os eventos
export const canViewAllEvents = (role: UserRole): boolean => {
  return role === 'admin' || role === 'organizer'
}
