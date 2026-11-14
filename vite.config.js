import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import { pathToFileURL } from 'node:url'
import { resolve } from 'node:path'

// Serves the API handlers in src/api during `npm run dev` and `vite preview`, so the "Request CV" form and
// the AI chat work locally with the settings from .env.local.
const API_ROUTES = ['request-cv', 'chat']
function localApi(env) {
  return {
    name: 'local-api',
    configureServer(server) {
      Object.assign(process.env, env)
      for (const name of API_ROUTES) {
        server.middlewares.use(`/api/${name}`, async (req, res) => {
          const { default: handler } = await server.ssrLoadModule(`/src/api/${name}.js`)
          return handler(req, res)
        })
      }
    },
    configurePreviewServer(server) {
      Object.assign(process.env, env)
      for (const name of API_ROUTES) {
        server.middlewares.use(`/api/${name}`, async (req, res) => {
          const { default: handler } = await import(pathToFileURL(resolve(`src/api/${name}.js`)).href)
          return handler(req, res)
        })
      }
    },
  }
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  return {
    plugins: [
      // <lg-*> tags are the liquid-glass web components (src/vendor/liquidglass), not Vue components
      vue({ template: { compilerOptions: { isCustomElement: (tag) => tag.startsWith('lg-') } } }),
      localApi(env),
    ],
  }
})
