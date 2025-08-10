import React from 'react'
import { useAuthStore } from '../store/authStore'

const ProfilesAlert: React.FC = () => {
  const { userProfile } = useAuthStore()

  // Detectar se está usando perfil padrão local (indicativo de que a tabela não existe)
  const isUsingLocalProfile = userProfile && 
    userProfile.role === 'client' && 
    !userProfile.full_name &&
    userProfile.created_at === userProfile.updated_at

  if (!isUsingLocalProfile) return null

  return (
    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
      <div className="flex">
        <div className="flex-shrink-0">
          <i className="fas fa-exclamation-triangle text-yellow-400 text-xl"></i>
        </div>
        <div className="ml-3">
          <p className="text-sm text-yellow-800">
            <span className="font-medium">⚠️ Sistema de Roles não configurado!</span>
            {' '}A tabela <code className="bg-yellow-100 px-1 rounded">profiles</code> deve ser criada manualmente no Supabase.
          </p>
          <div className="mt-3 flex items-center gap-3">
            <a
              href="/test-profiles"
              className="inline-flex items-center px-3 py-1 border border-yellow-300 text-xs font-medium rounded-md text-yellow-800 bg-yellow-100 hover:bg-yellow-200 transition-colors"
            >
              <i className="fas fa-flask mr-1"></i>
              Verificar Status
            </a>
            <span className="text-xs text-yellow-700">
              📖 Execute o script SQL manualmente no Supabase Dashboard
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProfilesAlert
