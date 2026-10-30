// @ts-check
import { defineConfig } from 'astro/config';
import vercel from '@astrojs/vercel';

// El sitio es estático; el adaptador solo se usa para las funciones de inicio de sesión
// del panel de administración (src/pages/api/*), que se ejecutan en Vercel.
export default defineConfig({
  site: 'https://maritimo-pi.vercel.app',
  trailingSlash: 'ignore',
  adapter: vercel(),
});
