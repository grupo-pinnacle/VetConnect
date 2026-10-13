const envOrigins = [
  process.env.CORS_ORIGIN,
  process.env.FRONTEND_URL,
  process.env.CLIENT_URL,
]
  .filter(Boolean)
  .flatMap((o) => (o as string).split(','))
  .map((o) => o.trim());

const defaultOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:5174',
  'http://127.0.0.1:5174',
  'http://localhost:4173',
  'http://127.0.0.1:4173',
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'https://vet-connect-web.vercel.app',
  'https://app.vetconnect.com.ar',
];

export const allowedOrigins = Array.from(new Set([...defaultOrigins, ...envOrigins]));

export const isAllowedOrigin = (origin?: string): boolean => {
  if (!origin || process.env.NODE_ENV === 'test') return true;
  const cleanOrigin = origin.replace(/\/$/, '');
  if (allowedOrigins.includes(cleanOrigin) || allowedOrigins.includes(origin)) {
    return true;
  }
  // Allow localhost and 127.0.0.1 on any port in development / non-production
  if (process.env.NODE_ENV !== 'production' && /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(cleanOrigin)) {
    return true;
  }
  // Allow VS Code Dev Tunnels and Codespaces
  if (
    cleanOrigin.endsWith('.devtunnels.ms') ||
    cleanOrigin.endsWith('.app.github.dev') ||
    cleanOrigin.endsWith('.ngrok-free.app') ||
    cleanOrigin.endsWith('.ngrok.io')
  ) {
    return true;
  }
  // Allow Vercel preview and production deployments for VetConnect
  if (/^https:\/\/vet-connect[a-z0-9-]*\.vercel\.app$/.test(cleanOrigin)) {
    return true;
  }
  // Allow official VetConnect subdomains
  if (/^https:\/\/([a-z0-9-]+\.)?vetconnect\.com\.ar$/.test(cleanOrigin)) {
    return true;
  }
  return false;
};
