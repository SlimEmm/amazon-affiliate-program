import { APP_BASE_HREF } from '@angular/common';
import { CommonEngine, isMainModule } from '@angular/ssr/node';
import express from 'express';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import bootstrap from './main.server';
import compression from 'compression';

const serverDistFolder = dirname(fileURLToPath(import.meta.url));
const browserDistFolder = resolve(serverDistFolder, '../browser');
const indexHtml = join(serverDistFolder, 'index.server.html');

const app = express();

// ✅ Enable GZIP compression
app.use(compression());

// ✅ Set Cache-Control for static assets
app.use(
  express.static(browserDistFolder, {
    maxAge: '1y',
    index: false,
    setHeaders: (res, path) => {
      if (path.endsWith('.html')) {
        res.setHeader('Cache-Control', 'no-cache');
      }
    },
  })
);

const commonEngine = new CommonEngine();

// ✅ Handle all other routes with SSR rendering
app.get('**', async (req, res, next) => {
  const { protocol, originalUrl, baseUrl, headers } = req;

  const url = `${protocol}://${headers.host}${originalUrl}`;
  const start = Date.now(); // 🧠 Measure render time

  try {
    const html = await commonEngine.render({
      bootstrap,
      documentFilePath: indexHtml,
      url,
      publicPath: browserDistFolder,
      providers: [{ provide: APP_BASE_HREF, useValue: baseUrl }],
    });

    res.send(html);
    console.log(`SSR rendered ${originalUrl} in ${Date.now() - start}ms`);
  } catch (err) {
    next(err);
  }
});

// ✅ Start server
if (isMainModule(import.meta.url)) {
  const port = process.env['PORT'] || 4000;
  app.listen(port, () => {
    console.log(`✅ Angular SSR server running at http://localhost:${port}`);
  });
}

export default app;