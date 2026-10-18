import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';
import {GoogleGenAI} from '@google/genai';

export default defineConfig(() => {
  return {
    plugins: [
      react(),
      tailwindcss(),
      {
        name: 'api-proxy-plugin',
        configureServer(server) {
          server.middlewares.use(async (req, res, next) => {
            if (req.url === '/api/proxy' && req.method === 'POST') {
              let bodyStr = '';
              req.on('data', chunk => { bodyStr += chunk; });
              req.on('end', async () => {
                try {
                  const { url, method = 'POST', headers = {}, body } = JSON.parse(bodyStr);
                  if (!url) {
                    res.statusCode = 400;
                    res.setHeader('Content-Type', 'application/json');
                    res.end(JSON.stringify({ error: 'Missing target url' }));
                    return;
                  }

                  const forwardHeaders: Record<string, string> = {
                    'Content-Type': 'application/json',
                    ...headers,
                  };

                  const response = await fetch(url, {
                    method,
                    headers: forwardHeaders,
                    body: body ? (typeof body === 'string' ? body : JSON.stringify(body)) : undefined,
                  });

                  const contentType = response.headers.get('content-type') || 'application/json';
                  res.statusCode = response.status;
                  res.setHeader('Content-Type', contentType);
                  const data = await response.text();
                  res.end(data);
                } catch (err: any) {
                  res.statusCode = 500;
                  res.setHeader('Content-Type', 'application/json');
                  res.end(JSON.stringify({ error: err.message || 'Proxy error' }));
                }
              });
              return;
            }

            if (req.url === '/api/built-in-ai' && req.method === 'POST') {
              let bodyStr = '';
              req.on('data', chunk => { bodyStr += chunk; });
              req.on('end', async () => {
                try {
                  const { messages, temperature = 0.8, action = 'chat' } = JSON.parse(bodyStr);
                  const apiKey = process.env.GEMINI_API_KEY;
                  if (!apiKey) {
                    res.statusCode = 400;
                    res.setHeader('Content-Type', 'application/json');
                    res.end(JSON.stringify({ error: 'GEMINI_API_KEY not configured in environment' }));
                    return;
                  }

                  const ai = new GoogleGenAI({ apiKey });
                  // Format messages for Gemini
                  let systemInstruction = '';
                  const contents: any[] = [];

                  for (const m of messages || []) {
                    if (m.role === 'system') {
                      systemInstruction += (systemInstruction ? '\n\n' : '') + m.content;
                    } else if (m.role === 'user') {
                      contents.push({ role: 'user', parts: [{ text: m.content }] });
                    } else if (m.role === 'assistant') {
                      contents.push({ role: 'model', parts: [{ text: m.content }] });
                    }
                  }

                  if (contents.length === 0) {
                    contents.push({ role: 'user', parts: [{ text: '你好' }] });
                  }

                  const response = await ai.models.generateContent({
                    model: 'gemini-2.5-flash',
                    contents,
                    config: {
                      systemInstruction: systemInstruction || undefined,
                      temperature,
                    },
                  });

                  const text = response.text || '';
                  res.statusCode = 200;
                  res.setHeader('Content-Type', 'application/json');
                  res.end(JSON.stringify({
                    choices: [{ message: { content: text } }],
                    text,
                  }));
                } catch (err: any) {
                  res.statusCode = 500;
                  res.setHeader('Content-Type', 'application/json');
                  res.end(JSON.stringify({ error: err.message || 'Built-in AI error' }));
                }
              });
              return;
            }

            next();
          });
        },
      },
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});

