Objetivo

Documentar como usar o sistema de temas centralizado (`src/components/ui/theme.ts`) e as regras para implementar estilos visuais no frontend de forma consistente (suportando dark mode).

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
