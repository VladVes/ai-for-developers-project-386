import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const MOCK_TARGET = 'http://127.0.0.1:4010';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Прокси на mock-сервер Prism (см. корневой скрипт `mock`)
      '/api': {
        target: MOCK_TARGET,
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
        // Явно обрабатываем недоступность mock-сервера, чтобы вместо
        // непонятного 500 отдавать осмысленный 502 с подсказкой.
        configure: (proxy) => {
          proxy.on('error', (err, _req, res) => {
            const message =
              `Не удалось обратиться к mock-серверу (${MOCK_TARGET}): ${err.message}. ` +
              'Запущен ли Prism? Используйте `npm run dev:all`.';

            // eslint-disable-next-line no-console
            console.error(`[proxy] ${message}`);

            if ('writeHead' in res && !res.headersSent) {
              res.writeHead(502, { 'Content-Type': 'application/json; charset=utf-8' });
              res.end(JSON.stringify({ error: message }));
            }
          });
        },
      },
    },
  },
});
