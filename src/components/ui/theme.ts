// Centralized visual tokens for simple theming of basic UI primitives.
// Keep this file small: change values here to adjust the look app-wide.

export const cardTokens = {
  // container
  background: 'bg-white',
  border: 'border border-slate-100',
  radius: 'rounded-2xl',
  shadow: 'shadow-md',

  // spacing variants — used by CardHeader/CardContent
  spacing: {
  sm: 'px-2 py-1',
  md: 'px-3 py-2',
  lg: 'px-4 py-3'
  },

  // title
  title: 'text-lg font-semibold text-slate-900'
}

export const uiTokens = {
  focusRing: 'focus:outline-none focus:ring-2 focus:ring-primary/40',
}

export default { cardTokens, uiTokens }
