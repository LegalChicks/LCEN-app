import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// ✅ only ONE default export — this replaces both old ones
export default defineConfig(({ mode }) => {
  const isProd = mode === 'production'

  return {
    base: isProd ? '/LCEN-app/' : '/', // change 'LCEN-app' to your repo name if needed
    plugins: [react()],
    build: {
      outDir: 'dist',
    },
  }
})
