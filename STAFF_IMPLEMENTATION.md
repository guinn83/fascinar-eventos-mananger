# Implementação de Staff nos Eventos

## Visão Geral
Sistema para gerenciar equipe (staff) dos eventos, permitindo atribuir funções específicas a pessoas e dar visibilidade aos membros da equipe sobre seus eventos.

## Funcionalidades

### 1. Lista de Funções Disponíveis

#### Funções Padrão:
- Cerimonialista
- Coordenador
- Planner
- Assistente
- Recepcionista
- Monitora
- Produtor de Camarim
- Mestre de Cerimônia
- Segurança

#### Características:
- Lista expansível (podem ser adicionadas novas funções)
- Funções podem ser personalizadas por evento
- Possibilidade de definir funções padrão por tipo de evento

### 2. Atribuição de Funções

#### Cenários de Atribuição:
1. **Função sem pessoa atribuída**: Apenas a função é listada, aguardando atribuição
2. **Função com pessoa sem conta no app**: Nome da pessoa é mostrado, mas sem integração
3. **Função com pessoa que tem conta no app**: Integração completa com notificações e visibilidade

#### Flexibilidade:
- Funções podem variar por evento
- Perfis podem ter funções padrão configuráveis
- Possibilidade de múltiplas pessoas na mesma função (ex: 3 Seguranças)

### 3. Visibilidade para Staff

#### Para Membros com Conta no App:
- Lista de eventos onde estão escalados
- Highlight visual nos eventos em que participarão
- Detalhes específicos do seu papel no evento
- Acesso aos detalhes do evento (data, local, horário, etc.)

#### Informações Visíveis:
- Nome do evento
- Data e horário
- Local
- Sua função no evento
- Outras informações relevantes do evento

### 4. Interface no Card do Evento

#### Seção de Equipe:
- **Contador total**: "Equipe: 8 pessoas"
- **Lista de funções**:
  - Nome da função
  - Nome da pessoa (se atribuída)
  - Status visual (pessoa com/sem conta, não atribuída)

#### Exemplo Visual:
```
Equipe: 8 pessoas
─────────────────
✅ Cerimonialista: Maria Silva
✅ Coordenador: João Santos  
🔸 Planner: Ana Costa
⭕ Assistente: (não atribuído)
✅ Segurança: Pedro Lima
✅ Segurança: Carlos Rocha
🔸 Recepcionista: Julia Mendes
✅ MC: Roberto Alves
```

**Legenda:**
- ✅ = Pessoa com conta no app
- 🔸 = Pessoa sem conta no app
- ⭕ = Função não atribuída

## Estrutura de Dados

### Tabela: event_staff
```sql
- id (UUID)
- event_id (UUID) → events.id
- role_name (VARCHAR) - Nome da função
- person_name (VARCHAR) - Nome da pessoa (sempre preenchido)
- user_id (UUID, nullable) → profiles.user_id (se a pessoa tem conta)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

### Tabela: staff_availability
```sql
- id (UUID)
- user_id (UUID) → profiles.user_id
- event_id (UUID) → events.id
- status (ENUM: 'available', 'unavailable', 'maybe') - Status de disponibilidade
- notes (TEXT, nullable) - Observações opcionais
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

### Tabela: default_staff_roles
```sql
- id (UUID)
- user_id (UUID) → profiles.user_id
- default_role (VARCHAR) - Função padrão da pessoa
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

## Fluxos de Uso

### 1. Criação/Edição de Evento
1. Organizador acessa detalhes do evento
2. Na seção "Equipe", pode:
   - Adicionar nova função
   - Atribuir pessoa à função existente
   - Vincular pessoa existente no app (busca por email/nome)
   - Remover função ou pessoa

### 2. Visualização por Staff
1. Membro da equipe faz login no app
2. Na tela inicial, vê lista de eventos
3. Eventos onde está escalado têm destaque visual
4. Pode clicar para ver detalhes do evento e sua função
5. Pode marcar disponibilidade para eventos futuros

### 3. Sistema de Disponibilidade
1. Staff recebe notificação de novos eventos
2. Pode marcar disponibilidade: Disponível/Indisponível/Talvez
3. Pode adicionar observações (ex: "disponível apenas após 14h")
4. Organizadores veem status de disponibilidade antes de fazer atribuições

### 4. Notificações (futuro)
- Notificar quando for atribuído a um evento
- Lembrar sobre eventos próximos
- Avisar sobre mudanças no evento
- Solicitar confirmação de disponibilidade

## Permissões

### Admins:
- Controle total do sistema
- Função padrão: **Cerimonialista** ou **Coordenador**
- Pode gerenciar toda a equipe
- Acesso a todos os eventos

### Organizers (Staff):
- Todos os membros da equipe têm este role
- Pode ver eventos onde está atribuído
- Pode marcar disponibilidade
- Vê apenas nomes e funções de outros membros (sem dados pessoais)
- Função padrão baseada na competência:
  - Maioria: **Planner**
  - Novatos: **Assistente**

### Clients:
- Ver apenas informações básicas da equipe (nomes e funções)
- Não faz parte da equipe interna

## Considerações Técnicas

### Backend:
- API para CRUD de staff do evento
- Endpoint para buscar eventos por user_id (staff)
- Validações de permissão por role

### Frontend:
- Componente de gerenciamento de equipe
- Interface de busca/vinculação de usuários
- Highlights visuais na lista de eventos
- Modal/tela de detalhes da equipe
- Sistema de marcação de disponibilidade
- Funções padrão automáticas baseadas no role do usuário

### Integrações:
- Sistema de notificações (emails, push)
- Busca de usuários por email/nome
- Validação de duplicatas
- Auto-atribuição de funções padrão baseada no role
- Sistema de disponibilidade integrado

## Próximos Passos

1. **Validar estrutura** com stakeholders
2. **Criar banco de dados** (migrations)
3. **Implementar backend** (APIs)
4. **Desenvolver frontend** (componentes)
5. **Testes e validação**
6. **Deploy e treinamento**

## Decisões Definidas

1. **✅ Múltiplas pessoas por função**: Sim, mesma função pode ter várias pessoas (ex: 3 seguranças)
2. **✅ Funções padrão**: Sistema global baseado na competência da pessoa:
   - Admins → sempre "Cerimonialista" ou "Coordenador"
   - Maioria → "Planner" por padrão
   - Novatos → "Assistente" por padrão (pode ser alterado por evento)
3. **✅ Níveis de acesso**: Staff não vê dados pessoais de outros (apenas nomes e funções)
4. **✅ Histórico**: Não implementar histórico de mudanças
5. **✅ Disponibilidade**: Implementar sistema para staff marcar disponibilidade

## Sistema de Roles e Permissões

### Mapeamento de Roles:
- **admin** (role do perfil) → **Cerimonialista** ou **Coordenador** (função padrão no evento)
- **organizer** (role do perfil) → Toda equipe terá este nível de acesso
- **client** (role do perfil) → Não faz parte da equipe

### Hierarquia de Acesso:
1. **Admin**: Controle total do sistema + função de Cerimonialista/Coordenador nos eventos
2. **Organizer**: Acesso de staff + pode gerenciar outros membros da equipe
3. **Client**: Apenas contrata e vê informações básicas

---

**Versão**: 2.0  
**Data**: 15/08/2025  
**Status**: Documentação atualizada - pronta para implementação
