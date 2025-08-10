import { create } from 'zustand'
import { supabase } from '../services/supabase'
import type { User } from '@supabase/supabase-js'
import type { UserProfile, UserRole } from '../types/user'

interface AuthState {
  user: User | null
  userProfile: UserProfile | null
  loading: boolean
  initialized: boolean
  initializeAuth: () => Promise<void>
  signIn: (email: string, password: string) => Promise<{ error?: string }>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<{ error?: string }>
  updatePassword: (newPassword: string) => Promise<{ error?: string }>
  verifyPasswordResetToken: () => Promise<{ success: boolean; error?: string }>
  fetchUserProfile: (userId: string) => Promise<void>
  getUserRole: () => UserRole
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  userProfile: null,
  loading: false,
  initialized: false,

  fetchUserProfile: async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle()

      if (error) {
        console.error('Error fetching user profile:', error)
        console.warn('⚠️ Tabela profiles não configurada. Usando perfil padrão temporário.')
        console.warn('📖 Execute o script SQL manualmente no Supabase Dashboard.')
        
        const defaultProfile: UserProfile = {
          id: userId,
          user_id: userId,
          full_name: get().user?.user_metadata?.full_name || '',
          avatar_url: get().user?.user_metadata?.avatar_url || '',
          phone: get().user?.user_metadata?.phone || '',
          bio: '',
          role: 'client',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }
        set({ userProfile: defaultProfile })
        return
      }

      if (data) {
        console.log('✅ Perfil carregado:', data)
        set({ userProfile: data })
      } else {
        console.log('ℹ️ Perfil não encontrado. Usando padrão local.')
        const defaultProfile: UserProfile = {
          id: userId,
          user_id: userId,
          full_name: get().user?.user_metadata?.full_name || '',
          avatar_url: get().user?.user_metadata?.avatar_url || '',
          phone: get().user?.user_metadata?.phone || '',
          bio: '',
          role: 'client',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }
        set({ userProfile: defaultProfile })
      }
    } catch (error) {
      console.error('Unexpected error fetching user profile:', error)
      const defaultProfile: UserProfile = {
        id: userId,
        user_id: userId,
        full_name: get().user?.user_metadata?.full_name || '',
        avatar_url: get().user?.user_metadata?.avatar_url || '',
        phone: get().user?.user_metadata?.phone || '',
        bio: '',
        role: 'client',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
      set({ userProfile: defaultProfile })
    }
  },

  getUserRole: (): UserRole => {
    return get().userProfile?.role || 'client'
  },

  initializeAuth: async () => {
    if (get().initialized) return
    
    try {
      set({ loading: true })
      const { data: { session } } = await supabase.auth.getSession()
      
      if (session) {
        set({ user: session.user })
        await get().fetchUserProfile(session.user.id)
      }

      // Listen for auth changes
      supabase.auth.onAuthStateChange(async (_, session) => {
        if (session) {
          set({ user: session.user })
          await get().fetchUserProfile(session.user.id)
        } else {
          set({ user: null, userProfile: null })
        }
      })

      set({ initialized: true })
    } catch (error) {
      console.error('Error initializing auth:', error)
    } finally {
      set({ loading: false })
    }
  },

  signIn: async (email: string, password: string) => {
    set({ loading: true })
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        return { error: error.message }
      }

      return {}
    } catch {
      return { error: 'Erro inesperado durante o login' }
    } finally {
      set({ loading: false })
    }
  },

  signOut: async () => {
    set({ loading: true })
    try {
      await supabase.auth.signOut()
      set({ user: null, userProfile: null })
    } catch (error) {
      console.error('Error signing out:', error)
    } finally {
      set({ loading: false })
    }
  },

  resetPassword: async (email: string) => {
    try {
      // Determinar URL de redirecionamento baseada no contexto
      let redirectTo = `${window.location.origin}/reset-password`
      
      // Se estiver em PWA ou se deve focar em janela existente
      const isPWA = window.matchMedia('(display-mode: standalone)').matches
      
      if (isPWA) {
        // Em PWA, usar protocolo personalizado se disponível
        redirectTo = `web+fascinar://reset-password?fallback=${encodeURIComponent(redirectTo)}`
      }

      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo,
      })

      if (error) {
        return { error: error.message }
      }

      return {}
    } catch (error) {
      console.error('Reset password error:', error)
      return { error: 'Erro inesperado ao enviar email de recuperação' }
    }
  },

  updatePassword: async (newPassword: string) => {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      })

      if (error) {
        return { error: error.message }
      }

      return {}
    } catch {
      return { error: 'Erro inesperado ao atualizar senha' }
    }
  },

  verifyPasswordResetToken: async () => {
    try {
      // Verificar se há uma sessão válida com o token do reset
      const { data: { session }, error } = await supabase.auth.getSession()
      
      if (error) {
        return { success: false, error: error.message }
      }
      
      if (session && session.user) {
        set({ user: session.user })
        return { success: true }
      }
      
      return { success: false, error: 'Nenhuma sessão válida encontrada' }
    } catch {
      return { success: false, error: 'Erro ao verificar token de reset' }
    }
  },
}))
