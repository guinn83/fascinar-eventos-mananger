import React, { useState } from 'react'
import { Card, CardContent } from '../components/ui/card'
import { pageTokens } from '../components/ui/theme'
import { useClients } from '../hooks/useClients'
import type { Client } from '../types/client'

const ClientsView: React.FC = () => {
  const {
    clients,
    loading,
    error,
    createClient,
    updateClient,
    deleteClient
  } = useClients()

  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedClient, setSelectedClient] = useState<Client | null>(null)
  const [searchTerm, setSearchTerm] = useState('')

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    cpf: ''
  })

  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.phone?.includes(searchTerm) ||
    client.cpf.includes(searchTerm) ||
    client.email?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleCreateClient = async (e: React.FormEvent) => {
    e.preventDefault()
    const result = await createClient(formData)
    if (result.success) {
      setShowCreateModal(false)
      setFormData({ name: '', email: '', phone: '', cpf: '' })
    }
  }

  const handleEditClient = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedClient) return
    
    const result = await updateClient(selectedClient.id, formData)
    if (result.success) {
      setShowEditModal(false)
      setSelectedClient(null)
      setFormData({ name: '', email: '', phone: '', cpf: '' })
    }
  }

  const handleDeleteClient = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este cliente?')) {
      await deleteClient(id)
    }
  }

  const openEditModal = (client: Client) => {
    setSelectedClient(client)
    setFormData({
      name: client.name,
      email: client.email || '',
      phone: client.phone || '',
      cpf: client.cpf
    })
    setShowEditModal(true)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-border mx-auto mb-4"></div>
            <p className="text-text-secondary">Carregando clientes...</p>
          </div>
      </div>
    )
  }

  return (
    <>
  <div className={`max-w-6xl mx-auto bg-background min-h-screen ${pageTokens.cardGap.sm}`}>
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-h1 text-text">Clientes</h1>
            <p className="text-text-secondary mt-1">Gerencie seus clientes e relacionamentos</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white px-6 py-3 rounded-xl transition-colors shadow-lg"
          >
            <i className="fas fa-plus"></i>
            Novo Cliente
          </button>
        </div>

  {/* Search */}
  <Card strong>
          <CardContent size="md">
            <div className="relative">
              <i className="fas fa-search absolute left-4 top-1/2 transform -translate-y-1/2 text-text-muted"></i>
              <input
                type="text"
                placeholder="Buscar clientes por nome, telefone, CPF ou email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-border transition-colors bg-background text-text"
              />
            </div>
          </CardContent>
        </Card>

        {/* Error Message */}
        {error && (
          <div className="bg-danger/10 border border-border text-danger px-4 py-3 rounded-xl">
            <i className="fas fa-exclamation-circle mr-2"></i>
            {error}
          </div>
        )}

  {/* Clients List */}
  <>
          {filteredClients.length === 0 ? (
            <Card strong>
              <CardContent size="lg" className="text-center">
              <i className="fas fa-users text-6xl text-text-muted mb-4"></i>
              <h3 className="text-h4 text-text mb-2">
                {searchTerm ? 'Nenhum cliente encontrado' : 'Nenhum cliente cadastrado'}
              </h3>
              <p className="text-text-secondary mb-6">
                {searchTerm 
                  ? 'Tente alterar os termos da busca' 
                  : 'Comece criando seu primeiro cliente'
                }
              </p>
              {!searchTerm && (
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="bg-primary hover:bg-primary/90 text-white px-6 py-3 rounded-xl transition-colors"
                >
                  <i className="fas fa-plus mr-2"></i>
                  Criar Primeiro Cliente
                </button>
              )}
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {filteredClients.map((client) => (
                <Card key={client.id} className="transition-all duration-300" strong>
                  <CardContent size="md">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-3">
                        <h3 className="text-h4 text-text">{client.name}</h3>
                        {client.related_client && (
                          <span className="bg-primary/10 text-primary px-2 py-1 rounded-lg text-xs font-medium">
                            {client.relationship_type}
                          </span>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-sm">
                        {client.email && (
                          <div className="flex items-center gap-2 text-text-secondary">
                            <i className="fas fa-envelope w-4"></i>
                            <span>{client.email}</span>
                          </div>
                        )}
                        {client.phone && (
                          <div className="flex items-center gap-2 text-text-secondary">
                            <i className="fas fa-phone w-4"></i>
                            <span>{client.phone}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-2 text-text-secondary">
                          <i className="fas fa-id-card w-4"></i>
                          <span>{client.cpf}</span>
                        </div>
                      </div>

                      {client.related_client && (
                        <div className="bg-surface rounded-lg px-3 py-2 mt-3">
                          <p className="text-sm text-text-secondary">
                            <strong>Relacionado com:</strong> {client.related_client.name}
                            {client.related_client.phone && ` • ${client.related_client.phone}`}
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openEditModal(client)}
                        className="p-2 text-text-secondary hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                        title="Editar cliente"
                        aria-label="Editar cliente"
                      >
                        <i className="fas fa-edit"></i>
                      </button>
                      
                      <button
                        onClick={() => handleDeleteClient(client.id)}
                        className="p-2 text-text-secondary hover:text-danger hover:bg-danger/10 rounded-lg transition-colors"
                        title="Excluir cliente"
                        aria-label="Excluir cliente"
                      >
                        <i className="fas fa-trash"></i>
                      </button>
                    </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </>

      </div>

      {/* Create Client Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md max-h-[90vh] overflow-y-auto">
            <CardContent size="md">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-text">Novo Cliente</h2>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="p-2 hover:bg-surface-hover rounded-lg transition-colors"
                  aria-label="Fechar modal"
                >
                  <i className="fas fa-times text-text-secondary"></i>
                </button>
              </div>

              <form onSubmit={handleCreateClient} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-text mb-2">
                  Nome completo *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full p-3 border border-border rounded-lg bg-surface focus:ring-2 focus:ring-primary/20 focus:border-border transition-colors"
                  placeholder="Digite o nome completo"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full p-3 border border-border rounded-lg bg-surface focus:ring-2 focus:ring-primary/20 focus:border-border transition-colors"
                  placeholder="email@exemplo.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text mb-2">
                  Telefone
                </label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full p-3 border border-border rounded-lg bg-surface focus:ring-2 focus:ring-primary/20 focus:border-border transition-colors"
                  placeholder="(11) 99999-9999"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text mb-2">
                  CPF *
                </label>
                <input
                  type="text"
                  required
                  value={formData.cpf}
                  onChange={(e) => setFormData({ ...formData, cpf: e.target.value })}
                  className="w-full p-3 border border-border rounded-lg bg-surface focus:ring-2 focus:ring-primary/20 focus:border-border transition-colors"
                  placeholder="000.000.000-00"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 bg-surface hover:bg-surface-hover text-text py-3 rounded-lg transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-primary hover:bg-primary/90 text-white py-3 rounded-lg transition-colors"
                >
                  Criar Cliente
                </button>
              </div>
            </form>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Edit Client Modal */}
      {showEditModal && selectedClient && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md max-h-[90vh] overflow-y-auto">
            <CardContent size="md">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-text">Editar Cliente</h2>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="p-2 hover:bg-surface-hover rounded-lg transition-colors"
                  aria-label="Fechar modal"
                >
                  <i className="fas fa-times text-text-secondary"></i>
                </button>
              </div>

              <form onSubmit={handleEditClient} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-text mb-2">
                  Nome completo *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full p-3 border border-border rounded-lg bg-surface focus:ring-2 focus:ring-primary/20 focus:border-border transition-colors"
                  placeholder="Digite o nome completo"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full p-3 border border-border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-border transition-colors"
                  placeholder="email@exemplo.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  Telefone
                </label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full p-3 border border-border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-border transition-colors"
                  placeholder="(11) 99999-9999"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  CPF *
                </label>
                <input
                  type="text"
                  required
                  value={formData.cpf}
                  onChange={(e) => setFormData({ ...formData, cpf: e.target.value })}
                  className="w-full p-3 border border-border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-border transition-colors"
                  placeholder="000.000.000-00"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 bg-surface hover:bg-surface-hover text-text py-3 rounded-lg transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-primary hover:bg-primary/90 text-white py-3 rounded-lg transition-colors"
                >
                  Salvar Alterações
                </button>
              </div>
            </form>
            </CardContent>
          </Card>
        </div>
      )}

    </>
  )
}

export default ClientsView
