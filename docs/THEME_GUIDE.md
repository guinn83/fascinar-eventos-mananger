Objetivo

Documentar como usar o sistema de temas centralizado (`src/components/ui/theme.ts`) e as regras para implementar estilos visuais no frontend de forma consistente (suportando dark mode).

Nota de autoridade (fonte canônica)

O diretório `src/components/ui` é a fonte única e canônica dos componentes visuais e tokens para este projeto. Sempre que for criar, atualizar ou estilizar componentes, siga estas regras:

- Use apenas as primitives exportadas de `src/components/ui` (por exemplo, `Button`, `Badge`, `Card`, `Modal`, `theme`) como base. Evite copiar estilos inline fora deste diretório.
- Adicione novos tokens ou variantes dentro de `src/components/ui/theme.ts` e documente-os aqui. Não defina tokens espalhados em arquivos de views.
- Para exceções (componentes experimentais ou locais), adicione um comentário no arquivo indicando a justificativa e abra um PR com screenshots.

Enforcement checklist (para PRs)

- [ ] Mudanças visuais usam `src/components/ui/*` primitives onde aplicável.
- [ ] Novos tokens foram adicionados em `src/components/ui/theme.ts` e documentados neste guia.
- [ ] Não há classes de cor literais no diff (rodar `node tools/find-raw-colors.js`).
- [ ] Justificativas documentadas nos PRs para qualquer exceção.

Primitives: API rápida

Use estas primitives como referência rápida ao implementar views. Exemplos de props/variantes — ver os arquivos em `src/components/ui` para detalhes:

- Card (src/components/ui/card.tsx)
   - Props: `size?: 'sm'|'md'|'lg'`, `padding?: string` (override), `strong?: boolean`, `tone?: 'normal'|'emphasized'`
   - Subcomponentes: `CardHeader`, `CardContent`, `CardTitle` (use `CardTitle` para consistência de tokens).

- Button (src/components/ui/button.tsx)
   - Variants: `default | outline | ghost | destructive | confirm | edit | danger`
   - Sizes: `default | sm | lg | icon`
   - Use `variant` + `size` em vez de classes de cor diretas.

- Badge (src/components/ui/badge.tsx)
   - Variants: `default | secondary | destructive | outline`
   - Projetado para `inline-flex` com `text-xs` e `rounded-full`.

- Modal (src/components/ui/Modal.tsx)
   - Props: `open: boolean`, `onClose?: () => void`, `className?`, `backdropClassName?`
   - Bloqueia scroll do body automaticamente quando `open`.

Exemplo de uso recomendado (compact card):

```tsx
<Card className="w-full" strong>
   <CardContent size="sm">
      <CardTitle>📅 Evento Curto</CardTitle>
      <p className="text-small text-text-secondary">Sáb, 02/08 • 18:00</p>
      <div className="mt-2">
         <Button variant="outline" size="sm">Definir</Button>
      </div>
   </CardContent>
</Card>
```


Resumo rápido

- Use somente as classes semânticas definidas no tema (tokens). Exemplos: `bg-background`, `bg-surface`, `text-text`, `text-text-secondary`, `border-border`, `bg-primary`, `text-primary`, `bg-success`, `text-danger`, `focus:ring-primary/50`.
- Não usar utilitários Tailwind com cores literais (por exemplo: `text-slate-700`, `bg-white`, `bg-gradient-to-r from-primary to-primary-hover`) em componentes; preferir tokens.
- Prefira componentes UI existentes (`Button`, `Badge`, `Card`) e estenda-os com props ou classes extras quando necessário.

Onde estão os tokens

- Arquivo principal: `src/components/ui/theme.ts` — contém `light` / `dark` token maps, `cardTokens`, `pageTokens`, `uiTokens`.
- O `ThemeProvider` (`src/components/ThemeProvider.tsx`) aplica as variáveis CSS (`--color-*`) e alterna a classe `dark` no `document.documentElement`.
- Global CSS (`src/index.css`) já referencia `var(--color-background)` e `var(--color-text)`.

Regras rápidas (de revisão/PR)

1. Classes visuais
   - Correto: `className="bg-surface p-4 rounded-xl"`
   - Errado: `className="bg-white p-4 rounded-xl"`

2. Tipografia
   - Use utilitários semânticos quando disponíveis: `text-h1`, `text-h2`, `text-h4`, `text-body`, `text-small`.
   - Caso precise de peso/tamanho específico, prefira combinar tokens: `className="text-h4 font-semibold text-text"`.

3. Componentes
   - Use `Button`, `Badge`, `Card` do diretório `src/components/ui`. Atualize variantes via `variant`/`className` e evite copiar classes de cor dentro do app.

4. Gradientes & ilustrações
   - Evitar gradientes que definam cores literais. Se necessário, use tokens ou crie variáveis CSS adicionais (ex.: `--color-gradient-start`) e documente no tema.

5. Exceptions justificadas
   - Ícones que devem ser brancos sobre um fundo de cor primária podem manter `text-white` quando o elemento for sempre sobre `bg-primary`.
   - Use comentários no PR explicando a exceção.

Como migrar arquivos rapidamente (mini-checklist)

- Executar o script `tools/find-raw-colors.js` para localizar ocorrências.
- Substituir ocorrências por tokens equivalentes:
  - `text-slate-700` -> `text-text` (ou `text-text-secondary` dependendo do contraste desejado)
  - `bg-white` -> `bg-surface` ou `bg-background` (conforme contexto)
  - `bg-gradient-to-r from-primary to-primary-hover text-white` -> prefer `bg-primary` ou um token novo se for gradient intencional
  - `text-gray-600` / `text-slate-600` -> `text-text-secondary`
  - `border-slate-300` -> `border-border` (ou `border-border/40` para transparências)
- Execute a aplicação e verifique visualmente em dark/light.

Ferramenta de verificação

- `tools/find-raw-colors.js` (Node) lista arquivos com classes de cor hardcoded. Use para revisar PRs locais.

PR checklist (visual)

- [ ] Não há classes de cor literal no diff (rodar `node tools/find-raw-colors.js` e revisar resultados apenas para os arquivos alterados).
- [ ] Componentes novos respeitam os tokens e usam as primitives (`Button`, `Badge`, `Card`) quando aplicável.
- [ ] Testado em light e dark (Theme toggle) e responsividade.
- [ ] Atualizar esta documentação se novos tokens forem adicionado.

Próximos passos recomendados

1. Executar o script para obter o inventário atual (eu já rodei uma grep e gerei lista — ainda temos ~140 ocorrências espalhadas).
2. Priorizar arquivos de alto impacto (Layout, DashboardView, EventsView, Login, ResetPassword) — muitos já atualizados.
3. Fazer PRs pequenos (1–3 arquivos) para reduzir conflitos.
4. Opcional: adicionar uma etapa CI simples que roda `node tools/find-raw-colors.js` e falha a PR se encontrar padrões não permitidos (pode ser aplicada depois de um primeiro sweep).

Contato

- Se preferir, eu posso executar o sweep restante e aplicar as substituições, entregando PRs pequenos com visual diffs e screenshots dos casos mais sensíveis.

## Referência: EventStaffView (padrões extraídos)

Resumo rápido dos padrões e decisões vistas em `src/views/EventStaffView.tsx` que servem como referência para outras views:

- Layout centralizado com largura máxima (`max-w-6xl`) e espaçamento através de tokens (`pageTokens.cardGap.sm`).
- Cabeçalhos e títulos compactos: usar `text-h3`/`text-h4` ou `text-body` ao invés de `text-h1` para títulos de páginas secundárias.
- Cartões e listas compactas:
   - Padding reduzido (`p-theme-sm` / `p-4` equivalente via token) e bordas leves (`border-border`) para economizar espaço.
   - Ordenação e exibição condensada: itens em uma única linha com ícone pequeno (`icon-sm`/`icon-md`) e texto em `text-body`.
- Modais leves:
   - Quando um modal é aberto, o componente previne o scroll do body (`document.body.style.overflow = 'hidden'`).
   - Campos controlados e pré-fill inteligente (ex.: cálculo de arrival_time 2h antes do evento) — favor manter essa UX para reduzir cliques.
- Fluxos de carregamento otimizados: warm fetch para lists (organizers), uso de flags de loading e resumo por chamadas separadas (event, staff, summary).

Esses padrões garantem que views densas em informação (staff / disponibilidade) fiquem legíveis sem ocupar espaço desnecessário, especialmente em mobile.

## EventAvailabilityView — Cartões compactos (guia prático)

Objetivo: tornar os cards do `EventAvailabilityView` significativamente mais compactos para otimizar uso em mobile, seguindo tokens e padrão do `EventStaffView`.

Regras práticas (aplicar via classes/tokens):

- Tipografia
   - Título do card: `text-h4 text-text` (não `text-h1`/`text-h2`).
   - Subtítulo / local / hora: `text-body` ou `text-small text-text-secondary`.

- Espaçamento
   - Padding: usar `p-theme-sm` ou `p-3` (via token) em vez de `p-4`/`p-6`.
   - Gaps entre linhas: `space-y-theme-sm` reduzido para economizar altura.

- Layout do card
   - Exibir somente o essencial na primeira linha: ícone, título compacto, data resumida, e um badge pequeno (usar `Badge` com variante compacta).
   - Segunda linha (opcional): horário condensado e localização curta (truncar com ellipsis). Evitar descrições longas.
   - Remover ou recolher elementos que ocupam muita altura (ex.: grandes avatares, múltiplas linhas de descrição). Preferir hover/expand para detalhes.

- Ações
   - Botões de ação devem ser icon-only ou small (`variant='ghost'` + `icon-sm`) com tooltip em vez de botão grande.
   - Texto do botão primário no card deve ser curto: `Definir` / `Alterar` / `Contactar`.

- Estados visuais
   - Use as cores semânticas já definidas: `border-green-500 bg-green-50` → preferir tokens de status (`bg-success`, `text-success`) quando possível.
   - Para cards compactos, prefira uma borda colorida (1px) e fundo sutil (bg-surface / bg-surface-hover) em vez de grandes blocos de cor.

- Mobile-first
   - Grid: mobile 2 colunas compactas (ou 1 coluna com cards finos), tablet 2 e desktop 3 colunas.
   - Minimizar altura fixa de header: reduzir title size e remover subtítulo redundante.

- Performance / comportamento
   - Manter o scroll infinito via IntersectionObserver (já usado no EventAvailabilityView). Observe o mesmo padrão de disconnect/reobserve para eficiência.
   - Marcar itens atualizados recentemente com um estado visual sutil (`recentlyUpdated`) em vez de animar todo o card.

Snippet de classes recomendadas (exemplo):

   - Card compacto: `className="bg-surface p-theme-sm rounded-lg border border-border flex flex-col gap-2"
   - Header reduzido: `className="flex items-center gap-3"` com título `className="text-h4 text-text truncate"`
   - Badge/Status: `className="badge badge-sm bg-success/10 text-success"` (usar `Badge` primitive quando existir)

Checklist rápido para implementação do EventAvailabilityView:

- [ ] Título do card reduzido para `text-h4` ou `text-body`.
- [ ] Padding do card reduzido para token `p-theme-sm` / `p-3`.
- [ ] Ações compactas (icon-only) com tooltips.
- [ ] Grid responsivo 1–3 colunas conforme breakpoint.
- [ ] Usar tokens semânticos em vez de cores literais.
- [ ] Manter IntersectionObserver para infinite scroll.

Notas finais

- Se for necessário um caso visual diferente (por exemplo, destacar eventos prioritários), prefira variações pequenas no token (ex.: `ring-primary/10`, `border-primary`) em vez de aumentar o tamanho dos elementos.
- Após aplicar mudanças, faça um teste rápido em mobile (emulação) e dark mode; preferir ajustes iterativos pequenos.

## Iconografia (padrão)

- Fonte canônica: `src/components/ui/icons.tsx` — provê `IconMap` e o componente `Icon` como o conjunto padrão de ícones da aplicação.
- Objetivo: garantir consistência de estilo e tamanho dos ícones em títulos de cards, botões e listas. Use `Icon` por padrão; passe um componente SVG diretamente apenas para exceções documentadas.

Conveções rápidas:

- Importar: `import { Icon } from 'src/components/ui/icons'`.
- Uso em títulos de cartão: utilizar `Icon` com `className="icon-2xl text-icon-3"` e tamanho entre 20–24px.
- Mapeamento semântico recomendado: pessoas -> `Users`, calendário -> `Calendar`, relógio -> `Clock`, local -> `MapPin`, valor -> `DollarSign`.

Exemplo:

```tsx
import { Icon } from '../components/ui/icons'

<CardTitle className="flex items-center gap-2 text-text">
   <Icon name="Users" className="icon-2xl text-icon-3" />
   Equipe do Evento
</CardTitle>
```

Notas de migração:

- Ao migrar de ícones baseados em font-icons (ex.: `fas fa-...`) para o conjunto `lucide-react`, prefira mapear semanticamente e testar o alinhamento vertical com o texto (ajustar `leading-none` ou `-mt-1` quando necessário).
- Documente exceções no PR e adicione capturas se a substituição alterar significativamente a aparência.

---

<!-- Begin appended design-system-guide.md -->

# Guia de Padronização Visual - Sistema Implementado

## ✅ O que foi implementado

### 1. Sistema de Design Tokens (`src/styles/theme.ts`)
- **Cores:** primary, background, surface, text (secondary, muted), status colors (success, warning, danger, info), border
- **Tipografia:** h1, h2, h3, h4, body, small, xs com font weights e line heights
- **Espaçamento:** xs, sm, md, lg, xl, xxl
- **Ícones:** xs, sm, md, lg, xl 
- **Sombras:** sm, md, lg
- **Border radius:** sm, md, lg, xl

### 2. ThemeProvider (`src/components/ThemeProvider.tsx`)
- Context React para gerenciar tema atual
- Auto-detecção de `prefers-color-scheme`
- Persistência no localStorage
- Aplicação automática de CSS variables
- Hooks: `useTheme()`, `useDarkMode()`

### 3. Componente ThemeToggle (`src/components/ThemeToggle.tsx`)
- Toggle button com ícones Moon/Sun
- Versão compacta para menus
- Integrado no Layout (sidebar)

### 4. Configuração Tailwind (`tailwind.config.js`)
- `darkMode: 'class'` habilitado
- Cores mapeadas para CSS variables
- Utilitários de typography (text-h1, text-h2, etc.)
- Espaçamentos com prefix `theme-*`

### 5. Refatoração Inicial (EventStaffView)
- Header com `text-h1`, `text-text-secondary`, `text-small`
- Resume card com `icon-xl`, `text-h3`, `text-primary`
- Lista com `icon-md`

## 🎯 Como usar nos próximos componentes

### Classes de Tipografia
```tsx
// Títulos principais
<h1 className="text-h1 text-text">Título Principal</h1>

// Subtítulos e seções
<h2 className="text-h2 text-text">Subtítulo</h2>
<h3 className="text-h3 text-text">Seção</h3>

// Texto secundário
<p className="text-small text-text-secondary">Informação adicional</p>
<p className="text-xs text-text-muted">Caption ou label</p>
```

### Cores Semânticas
```tsx
// Backgrounds
<div className="bg-background">Fundo principal</div>
<div className="bg-surface hover:bg-surface-hover">Card ou elemento</div>

// Texto
<span className="text-text">Texto principal</span>
<span className="text-text-secondary">Texto secundário</span>
<span className="text-text-muted">Texto esmaecido</span>

// Primary colors
<button className="bg-primary hover:bg-primary-hover text-white">Botão</button>
<span className="text-primary">Link ou destaque</span>

// Status colors
<span className="text-success">Sucesso</span>
<span className="text-warning">Aviso</span>
<span className="text-danger">Erro</span>
```

### Ícones
```tsx
import { Icon } from '../src/components/ui/icons'

// Tamanhos padronizados (use o helper centralizado)
<Icon name="Users" className="icon-sm" />   {/* 16px */}
<Icon name="Calendar" className="icon-md" /> {/* 20px */}
<Icon name="Settings" className="icon-lg" /> {/* 24px */}

// Com cores semânticas
<Icon name="Users" className="icon-md text-primary" />
<Icon name="Calendar" className="icon-lg text-text-secondary" />
```

### Espaçamentos
```tsx
// Containers
<div className="space-y-theme-md">Seções</div>  {/* 16px */}
<div className="space-y-theme-lg">Cards</div>    {/* 24px */}

// Padding
<div className="p-theme-md">Conteúdo</div>      {/* 16px */}
<div className="px-theme-lg py-theme-sm">Botão</div>
```

## 🌓 Dark Mode

### Automático
- Detecta `prefers-color-scheme: dark`
- Salva preferência no localStorage
- Toggle disponível no sidebar

### Manual
```tsx
import { useTheme } from '../components/ThemeProvider'

function MyComponent() {
   const { theme, toggleTheme, setTheme } = useTheme()
  
   // Forçar tema específico
   const handleSetDark = () => setTheme('dark')
  
   // Toggle
   const handleToggle = () => toggleTheme()
  
   return (
      <div className={`p-4 ${theme === 'dark' ? 'bg-dark' : 'bg-light'}`}>
         {/* Conteúdo */}
      </div>
   )
}
```

## 📋 Checklist para novos componentes

**Antes de implementar:**
- [ ] Usar `text-h1`, `text-h2`, etc. para tipografia
- [ ] Usar `text-text`, `text-text-secondary`, `text-text-muted` para cores de texto
- [ ] Usar `bg-background`, `bg-surface` para backgrounds
- [ ] Usar `text-primary`, `bg-primary` para elementos destacados
- [ ] Usar `icon-sm`, `icon-md`, `icon-lg` para ícones
- [ ] Usar `text-success`, `text-danger`, etc. para status

**Validação:**
- [ ] Testar em tema claro e escuro
- [ ] Verificar contraste de cores
- [ ] Validar responsividade
- [ ] Build sem erros

## 🚀 Próximos passos

1. **Refatorar componentes existentes** seguindo o padrão do EventStaffView
2. **Criar componentes base** (Button, Input, Card) usando os tokens
3. **Validar acessibilidade** com ferramentas como axe
4. **Documentar padrões** específicos (formulários, listas, modais)

## 💡 Dicas

- **CSS Variables:** Todas as cores e tamanhos estão disponíveis como `var(--color-primary)`, `var(--font-size-h1)`, etc.
- **Tailwind:** Prefira as classes semânticas (`text-h1`) sobre valores hardcoded (`text-3xl`)
- **Consistência:** Sempre use os tokens definidos, evite cores/tamanhos custom
- **Dark Mode:** Teste sempre ambos os temas ao desenvolver

O sistema está pronto para ser usado e expandido! 🎉

<!-- End appended design-system-guide.md -->
