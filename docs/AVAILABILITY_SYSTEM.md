# 📅 SISTEMA DE DISPONIBILIDADE - ESPECIFICAÇÃO BASEADA EM EVENTOS

> **Objetivo**: Sistema onde staff vê próximos eventos e indica disponibilidade por evento, com horários opcionais.

---

---

## 👥 **Funcionalidades da Fase 3 - Interface Admin**

### **📊 Dashboard Admin Completo:**
- **Visão Geral**: Lista todos os eventos com estatísticas instantâneas
- **Contadores por Evento**: Disponíveis, indisponíveis, pendentes, escalados
- **Busca Avançada**: Por nome do evento, local, data
- **Filtros Inteligentes**: Status específicos, períodos de tempo

### **🔍 Sistema de Filtros:**
- **Por Status**: Todos, Pendentes, Disponíveis, Indisponíveis, Escalados  
- **Por Período**: Próximos 30/60/90 dias
- **Busca Textual**: Nome do evento ou localização
- **Resumo Dinâmico**: Contadores em tempo real dos resultados

### **📋 Gestão de Eventos:**
- **Cards Expansíveis**: Clique para ver detalhes das disponibilidades
- **Badges Visuais**: Status coloridos com contadores
- **Lista Detalhada**: Staff, horários, observações, status de escalação
- **Ações Rápidas**: Exportar, escalar automaticamente

### **⚡ Sistema de Escalação:**
- **Escalação Individual**: Promover disponível → escalado
- **Auto Escalação**: Algoritmo automático para selecionar equipe
- **Desescalação**: Reverter escalação quando necessário
- **Validações**: Só escala quem está disponível

### **📈 Relatórios e Exportação:**
- **Exportação CSV**: Dados completos por evento
- **Estatísticas Visuais**: Gráficos de disponibilidade
- **Modal Detalhado**: Visão completa de cada evento
- **Dados em Tempo Real**: Atualização automática

### **🎯 Interface Otimizada:**
- **Design Responsivo**: Mobile, tablet, desktop
- **Navegação Intuitiva**: Breadcrumbs, filtros, buscas
- **Feedback Visual**: Loading states, animações
- **Acessibilidade**: Labels, títulos, navegação por teclado

---

## 🚀 **Funcionalidades da Fase 2**

### **📊 Dashboard Inteligente:**
- **Contadores em tempo real**: `⭕ X pendentes` • `✅ X disponível` • `❌ X ocupado` • `🔒 X escalado`
- **Filtros dinâmicos**: Ver todos, apenas pendentes ou escalados
- **Priorização visual**: Eventos não definidos com destaque laranja

### **� Estados Visuais Aprimorados:**
- **Badges com ícones**: Cada card mostra status com ícone e cor
- **Animações suaves**: Hover, scale, fade-in para melhor UX
- **Feedback instantâneo**: Animação "✨ Atualizado!" após salvar
- **Ring de prioridade**: Eventos pendentes com borda laranja

### **⚡ Interações Melhoradas:**
- **Botões contextuais**: "Definir" • "Alterar" • "Contactar Admin"
- **Validação em tempo real**: Horários, caracteres, campos obrigatórios
- **Modal responsivo**: Animações de entrada, grid layout, estados visuais
- **Acessibilidade**: Labels, títulos, placeholders para screen readers

### **🔒 Sistema de Permissões:**
- **Escalado**: Não editável, botão "Contactar Admin"
- **Disponível/Indisponível**: Editável, botão "Alterar"
- **Não definido**: Editável, botão "Definir" com destaque

---

## 📋 **Especificações Técnicas**

### **Fluxo Simplificado:**
1. **Staff vê**: Lista dos próximos eventos (scroll infinito)
2. **Staff indica**: "Estou disponível para este evento" (+ horário opcional)
3. **Admin vê**: Quem está disponível para cada evento
4. **Admin escala**: Escolhe quem vai trabalhar em cada evento

### **Características:**
- ✅ **Grid de eventos** (2-3 colunas, mobile-friendly)
- ✅ **Cards com informações** do evento + disponibilidade
- ✅ **Cores visuais** para indicar status
- ✅ **Scroll infinito** agrupado por mês
- ✅ **Ordenação** pelo evento mais próximo

---

## 🎨 DESIGN DA INTERFACE

### **Layout Grid de Eventos:**

```
┌─────────────────────────────────────────────────────────────┐
│ 📅 Minha Disponibilidade para Eventos                      │
├─────────────────────────────────────────────────────────────┤
│ 📅 AGOSTO 2025                                              │
├─────────────────────────────────────────────────────────────┤
│ ┌──────────────────┐ ┌──────────────────┐ ┌────────────────┐│
│ │🎉 CASAMENTO      │ │🎓 FORMATURA      │ │🎂 ANIVERSÁRIO  ││
│ │João & Maria      │ │Ana Silva         │ │Carlos 50 anos  ││
│ │                  │ │                  │ │                ││
│ │📅 Sáb, 02/08     │ │📅 Dom, 03/08     │ │📅 Sáb, 09/08   ││
│ │🕐 18:00-23:00    │ │🕐 16:00-22:00    │ │🕐 20:00-02:00  ││
│ │📍 Salão Imperial │ │📍 Centro Convs.  │ │📍 Chácara Sol  ││
│ │                  │ │                  │ │                ││
│ │── DISPONIBILIDADE ││ │── DISPONIBILIDADE ││ │── DISPONIB... ││
│ │⭕ DISPONÍVEL     │ │❌ OCUPADO        │ │❓ NÃO DEFINIDO ││
│ │🕐 Dia todo       │ │                  │ │                ││
│ │                  │ │                  │ │                ││
│ │[Alterar]         │ │[Alterar]         │ │[Definir]       ││
│ └──────────────────┘ └──────────────────┘ └────────────────┘│
│                                                             │
│ ┌──────────────────┐ ┌──────────────────┐ ┌────────────────┐│
│ │💒 CASAMENTO      │ │🎓 FORMATURA      │ │🎉 FESTA        ││
│ │Pedro & Laura     │ │Bruno Santos      │ │Maria 30 anos   ││
│ │                  │ │                  │ │                ││
│ │📅 Dom, 10/08     │ │📅 Sáb, 16/08     │ │📅 Dom, 17/08   ││
│ │🕐 16:00-22:00    │ │🕐 19:00-24:00    │ │🕐 15:00-21:00  ││
│ │📍 Igreja Matriz  │ │📍 Hotel Central  │ │📍 Clube Rec.   ││
│ │                  │ │                  │ │                ││
│ │── DISPONIBILIDADE ││ │── DISPONIBILIDADE ││ │── DISPONIB... ││
│ │⭕ DISPONÍVEL     │ │⭕ DISPONÍVEL     │ │🔒 ESCALADO     ││
│ │🕐 A partir 14h   │ │🕐 18h-22h       │ │(não pode alt.) ││
│ │                  │ │                  │ │                ││
│ │[Alterar]         │ │[Alterar]         │ │[Contactar]     ││
│ └──────────────────┘ └──────────────────┘ └────────────────┘│
├─────────────────────────────────────────────────────────────┤
│ 📅 SETEMBRO 2025                                           │
├─────────────────────────────────────────────────────────────┤
│ [Carregando mais eventos...]                               │
└─────────────────────────────────────────────────────────────┘
```

### **Cards Responsivos:**
- **Desktop**: 3 colunas
- **Tablet**: 2 colunas  
- **Mobile**: 2 colunas (compacto)

---

## 🗂️ BANCO DE DADOS

### **Tabela: staff_event_availability** *(atualizada)*
```sql
CREATE TABLE staff_event_availability (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    staff_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    event_id UUID REFERENCES events(id) ON DELETE CASCADE,
    
    -- Status de disponibilidade
    is_available BOOLEAN NOT NULL DEFAULT false,
    
    -- Horários opcionais (dentro do evento)
    available_from TIME NULL,  -- NULL = desde o início do evento
    available_until TIME NULL, -- NULL = até o final do evento
    
    -- Observações
    notes TEXT,
    
    -- Auditoria
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    
    -- Constraint: um registro por staff por evento
    UNIQUE(staff_id, event_id)
);

-- Índices para performance
CREATE INDEX idx_staff_event_availability_staff ON staff_event_availability(staff_id);
CREATE INDEX idx_staff_event_availability_event ON staff_event_availability(event_id);
CREATE INDEX idx_staff_event_availability_available ON staff_event_availability(is_available);
```

### **Cores Visuais nas Bordas dos Cards:**
- **🟢 Verde** (`border-green-500 bg-green-50`): Disponível para o evento
- **🔴 Vermelho** (`border-red-500 bg-red-50`): Não disponível (ocupado)
- **⚪ Cinza** (`border-gray-300 bg-gray-50`): Não definido ainda
- **🔵 Azul** (`border-blue-500 bg-blue-50`): Já escalado (não pode alterar)

---

## 🔧 FUNCIONALIDADES

### **Para Staff (Organizer):**
- ✅ Ver lista dos próximos eventos (scroll infinito)
- ✅ Marcar disponibilidade por evento (disponível/ocupado)
- ✅ Definir horários específicos dentro do evento
- ✅ Adicionar observações por evento
- ✅ **Restrição**: Não pode alterar se já escalado

### **Para Admin:**
- ✅ Ver disponibilidade de todo staff por evento
- ✅ Filtrar por evento ou por pessoa
- ✅ Ver horários específicos quando definidos
- ✅ Usar informações para escalação final

### **Visual de Estados:**
- **⭕ Verde**: Disponível para o evento
- **❌ Vermelho**: Não disponível (ocupado)
- **❓ Cinza**: Não definido ainda
- **🔒 Azul**: Já escalado (não pode alterar)

---

## 🎯 IMPLEMENTAÇÃO

### **Componentes Principais:**

1. **EventAvailabilityView.tsx** *(implementado com grid)*
   - Grid responsivo (1-3 colunas conforme tela)
   - Cards com bordas coloridas por status
   - Scroll infinito agrupado por mês
   - Modal simplificado para definir disponibilidade

2. **useEventAvailability.ts** *(atualizado)*
   - CRUD para tabela `staff_event_availability`
   - Carregamento paginado de eventos com disponibilidades
   - Verificação de status de escalação

### **Hook Principal:**
```typescript
interface EventAvailability {
  id: string
  staff_id: string
  event_id: string
  event: {
    id: string
    title: string
    event_date: string
    end_date?: string
    location?: string
    description?: string
  }
  is_available: boolean
  available_from?: string
  available_until?: string
  notes?: string
  is_scheduled?: boolean // Se já está escalado
}

const useEventAvailability = () => {
  const getUpcomingEventsWithAvailability = (limit: number, offset: number) => {...}
  const setEventAvailability = (data: AvailabilityInput) => {...}
  // Outros métodos...
}
```
``

---

## 🚀 ROADMAP ATUALIZADO

### **Fase 1 - Base (✅ Concluído):**
- [x] Criar tabela `staff_event_availability`
- [x] Hook `useEventAvailability` completo
- [x] Grid de eventos com scroll infinito
- [x] Cards de eventos com bordas coloridas por status
- [x] Modal de definição por evento
- [x] Agrupamento por mês
- [x] Estados visuais e cores nas bordas
- [x] Responsividade mobile (1-3 colunas)

### **Fase 2 - Melhorias (✅ Concluído):**
- [x] Verificação de escalação (campo `is_scheduled`)
- [x] Diferentes ações por status (Alterar/Contactar Admin)
- [x] Animações e transições suaves
- [x] Validações de UX (horários, caracteres, etc.)
- [x] Filtros por prioridade (Todos/Pendentes/Escalados)
- [x] Contadores de status no header
- [x] Cards com badges de status visual
- [x] Feedback de atualização em tempo real
- [x] Modal melhorado com validação

### **Fase 3 - Admin (✅ Concluído):**
- [x] Visão admin de disponibilidades por evento
- [x] Filtros e relatórios (busca, status, período)
- [x] Interface de escalação automática
- [x] Exportação de dados para CSV
- [x] Estatísticas em tempo real por evento
- [x] Modal detalhado com todas as disponibilidades
- [x] Sistema de escalação/desescalação individual
- [x] Contadores visuais e badges de status
- [x] Responsividade completa

---

*Documento atualizado em: 24/08/2025*  
*Versão: 3.0 - Especificação Baseada em Eventos*  
*Foco: Grid de eventos + disponibilidade por evento*
│ 📅 Setembro 2025                                           │
├─────────────────────────────────────────────────────────────┤
│ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐            │
│ │📅 Sáb 06/09 │ │📅 Dom 07/09 │ │📅 Sáb 13/09 │            │
│ │             │ │             │ │             │            │
│ │ ❓ Não def.  │ │ ❓ Não def.  │ │ ❓ Não def.  │            │
│ │             │ │             │ │             │            │
│ │             │ │             │ │             │            │
│ │ [Definir]   │ │ [Definir]   │ │ [Definir]   │            │
│ └─────────────┘ └─────────────┘ └─────────────┘            │
└─────────────────────────────────────────────────────────────┘
```

### **Modal de Definição de Horário:**

```
┌─────────────────────────────────────┐
│ 📅 Disponibilidade - Sábado 02/08   │
├─────────────────────────────────────┤
│                                     │
│ ⭕ Estou disponível neste dia        │
│ ❌ Não estou disponível             │
│                                     │
│ ┌─ Horário (opcional) ─────────────┐ │
│ │                                 │ │
│ │ ⭕ Dia todo (padrão)             │ │
│ │ ⭕ A partir de: [14:00] ▼        │ │
│ │ ⭕ Até: [22:00] ▼                │ │
│ │ ⭕ Entre: [14:00] ▼ e [22:00] ▼  │ │
│ │                                 │ │
│ └─────────────────────────────────┘ │
│                                     │
│ 💬 Observações (opcional):          │
│ ┌─────────────────────────────────┐ │
│ │ Posso chegar só após o almoço   │ │
│ └─────────────────────────────────┘ │
│                                     │
│        [Cancelar]    [Salvar]       │
└─────────────────────────────────────┘
```

---

## 🗂️ BANCO DE DADOS SIMPLIFICADO

### **Tabela: staff_availability**
```sql
CREATE TABLE staff_availability (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    staff_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    
    -- Status simples
    is_available BOOLEAN NOT NULL DEFAULT false,
    
    -- Horários opcionais
    available_from TIME NULL,  -- NULL = dia todo
    available_until TIME NULL, -- NULL = dia todo
    
    -- Observações
    notes TEXT,
    
    -- Auditoria
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    
    -- Constraint: um registro por staff por dia
    UNIQUE(staff_id, date)
);

-- Índices para performance
CREATE INDEX idx_staff_availability_date ON staff_availability(date);
CREATE INDEX idx_staff_availability_staff ON staff_availability(staff_id);
CREATE INDEX idx_staff_availability_available ON staff_availability(is_available);
```

---

## � REGRAS DE NEGÓCIO

### **Restrição de Edição:**
- ❌ **Staff não pode alterar** disponibilidade se já estiver **escalado** para um evento naquele dia
- ✅ **Pode editar livremente** se ainda não foi escalado
- 💬 **Deve contactar organizadores** se precisar alterar depois de escalado

### **Estados dos Cards:**
1. **🟢 Editável**: Disponibilidade pode ser alterada (não escalado ainda)
2. **🔒 Bloqueado**: Já escalado para evento - não pode alterar
3. **📞 Contato necessário**: Mostrar mensagem para contactar admin

### **Interface Visual:**
```
┌─────────────────────────────────────────────────────────────┐
│ ┌─────────────  ┐ ┌─────────────┐ ┌─────────────┐            │
│ │  Evento 1     │ │  Evento 2   │ │  Evento 3   │            │
│ │📅 Data        │ │📅 Data      │ │📅 Data      │            │
│ │🕐 Horário     | │🕐 Horário  | │🕐 Horário  | │            │
│ │               │ │ │             │ │ │             │            │
│ │ ⭕ Disponível │ │ ❌ Ocupado   │ │ ⭕ Disponível│            │
│ │ 🕐 Dia todo   │ │             │ │ 🔒 ESCALADO │            │
│ │               │ │             │ │ Casamento X │            │
│ │ [Alterar]     │ │ [Alterar]   │ │ [Contactar  │            │
│ │               │ │             │ │  Admin]     │            │
│ └─────────────  ┘ └─────────────┘ └─────────────┘            │
└─────────────────────────────────────────────────────────────┘
```

---

## �🔧 FUNCIONALIDADES

### **Para Staff (Organizer):**
- ✅ Ver calendário dos próximos finais de semana
- ✅ Marcar disponibilidade por dia (disponível/ocupado)
- ✅ Definir horários específicos se necessário
- ✅ Adicionar observações por dia
- ✅ Editar disponibilidade **apenas se não estiver escalado**
- ⚠️ **Restrição**: Não pode alterar se já foi escalado para evento

### **Para Admin:**
- ✅ Ver disponibilidade de todo o staff por dia
- ✅ Filtrar por data ou por pessoa
- ✅ Ver horários específicos quando definidos
- ✅ Usar essas informações para escalar eventos

### **Filtros e Visões:**
```
┌─────────────────────────────────────────────────────────────┐
│ 🔍 Filtros:                                                 │
│ [📅 Agosto 2025 ▼] [👤 Todos ▼] [⭕ Disponíveis ▼]         │
├─────────────────────────────────────────────────────────────┤
│ 📊 Resumo do Dia - Sábado 02/08/2025:                      │
│                                                             │
│ ✅ Disponíveis (5):                                         │
│ • João Silva (dia todo)                                     │
│ • Maria Santos (14h-22h)                                    │
│ • Pedro Costa (a partir das 16h)                            │
│ • Ana Lima (até às 20h)                                     │
│ • Carlos Souza (dia todo - "posso dirigir")                 │
│                                                             │
│ ❌ Não Disponíveis (2):                                     │
│ • Lucas Oliveira                                            │
│ • Fernanda Rocha                                            │
│                                                             │
│ ❓ Não Responderam (3):                                     │
│ • Roberto Silva                                             │
│ • Juliana Mendes                                            │
│ • Thiago Alves                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## 🎯 IMPLEMENTAÇÃO

### **Componentes Principais:**

1. **StaffAvailabilityView.tsx** (grid de calendário agrupado)
2. **AvailabilityCard.tsx** (card individual de cada dia)
3. **AvailabilityModal.tsx** (modal de definição)
4. **AdminAvailabilityView.tsx** (visão admin com filtros)

### **Hook Principal:**
```typescript
interface StaffAvailability {
  id: string
  staff_id: string
  date: string
  is_available: boolean
  available_from?: string // "14:00"
  available_until?: string // "22:00"
  notes?: string
  is_scheduled?: boolean // Se já está escalado para evento neste dia
  event_name?: string // Nome do evento se escalado
}

const useStaffAvailability = () => {
  const getAvailabilityByMonth = (month: string) => {...}
  const setDayAvailability = (data: StaffAvailability) => {...}
  const getStaffAvailabilityForDate = (date: string) => {...}
  const checkIfScheduledForDate = (date: string) => {...} // Verificar se escalado
}
```

### **Estados Visuais:**
- **⭕ Verde**: Disponível (pode editar)
- **❌ Vermelho**: Não disponível (pode editar)
- **❓ Cinza**: Não definido ainda (pode editar)
- **� Azul**: Escalado para evento (não pode editar)
- **🕐 Pequeno**: Horário específico definido

---

## 🚀 ROADMAP SIMPLIFICADO

### **Fase 1 - Base (1-2 semanas):**
- [ ] Criar tabela `staff_availability`
- [ ] Hook `useStaffAvailability` básico
- [ ] Grid de calendário simples
- [ ] Modal de definição de disponibilidade
- [ ] **Verificação se staff está escalado** (bloquear edição)
- [ ] Interface para contactar admin quando escalado

### **Fase 2 - Melhorias (1 semana):**
- [ ] Agrupamento por mês
- [ ] Filtros básicos
- [ ] Visão admin
- [ ] Responsividade mobile

### **Fase 3 - Polimento (1 semana):**
- [ ] Animações suaves
- [ ] Validações de UX
- [ ] Testes e ajustes

---

*Documento simplificado em: 24/08/2025*  
*Versão: 2.0 - Especificação Simplificada*  
*Foco: Disponibilidade por dia + horários opcionais*