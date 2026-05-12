import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: path.resolve(__dirname, 'www'),
    emptyOutDir: false, // important — don't wipe your existing index.html and loader.js!
    rolldownOptions: {
      input: path.resolve(__dirname, 'src/index.ts'),
      output: {
        entryFileNames: 'bundle.js'
      }
    }
  }
})
