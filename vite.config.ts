import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// ✅ One default export only
export default defineConfig(({ mode }) => {
  const isProd = mode === 'production'

  return {
    base: isProd ? '/LCEN-app/' : '/',  // <-- change 'LCEN-app' if your repo name differs
    plugins: [react()],
    build: {
      outDir: 'dist',
    },
  }
})
