import path from 'path';
import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';

function apiPlugin(): Plugin {
  return {
    name: 'vite-rythumitra-api',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (req.url && req.url.startsWith('/api')) {
          try {
            const mod = await server.ssrLoadModule('/server/index.ts');
            const app = mod.default || mod.app;
            return app(req, res, next);
          } catch (err) {
            console.error('[API Middleware Error]', err);
            res.statusCode = 500;
            res.end(JSON.stringify({ error: 'Internal API Server Error', details: String(err) }));
            return;
          }
        }
        next();
      });
    }
  };
}

export default defineConfig(() => {
  return {
    server: {
      port: 3000,
      host: '0.0.0.0',
    },
    plugins: [
      react(),
      apiPlugin()
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      }
    }
  };
});
