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
  // responsive spacing: smaller screens use compact padding, larger screens get more room
  sm: 'p-2 md:p-3',
  md: 'p-4 md:p-6',
  lg: 'p-6 md:p-8'
  },

  // title
  title: 'text-lg font-semibold text-slate-900'
}

export const uiTokens = {
  focusRing: 'focus:outline-none focus:ring-2 focus:ring-primary/40',
}

export default { cardTokens, uiTokens }

// Page-level spacing tokens for Layout and views to consume.
export const pageTokens = {
  // options: sm | md | lg — maps to Tailwind padding utilities
  container: {
    sm: 'px-4 py-4',
    md: 'px-4 py-4',
    lg: 'px-8 py-8'
  }
}
