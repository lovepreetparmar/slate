# Slate — Hostinger VPS Deployment Guide

## Prerequisites

- Ubuntu 22.04+ VPS on Hostinger
- Node.js 20 LTS
- Nginx
- PM2
- Domain with DNS pointed to VPS

Slate uses **SQLite** for production (sufficient for a personal todo app). No separate database server is required.

## 1. Environment Variables

Create `/var/www/slate/.env`:

```env
DATABASE_URL="file:./prod.db"
AUTH_SECRET="your-generated-secret"
AUTH_URL="https://yourdomain.com"
AUTH_GOOGLE_ID="your-google-client-id"
AUTH_GOOGLE_SECRET="your-google-client-secret"
EMAIL_SERVER_HOST="smtp.hostinger.com"
EMAIL_SERVER_PORT="587"
EMAIL_SERVER_USER="noreply@yourdomain.com"
EMAIL_SERVER_PASSWORD="your-smtp-password"
EMAIL_FROM="Slate <noreply@yourdomain.com>"
NEXT_PUBLIC_APP_URL="https://yourdomain.com"
NODE_ENV="production"
```

`DATABASE_URL` paths are relative to `prisma/schema.prisma`. `file:./prod.db` stores the database at `prisma/prod.db`.

Generate `AUTH_SECRET`:

```bash
openssl rand -base64 32
```

## 2. Build & Deploy

```bash
cd /var/www/slate
git pull origin main
npm ci
npm run db:migrate
npm run build
pm2 restart slate
```

## 3. PM2 Configuration

`ecosystem.config.cjs` is included in the repo. Start with:

```bash
pm2 start ecosystem.config.cjs
pm2 save
pm2 startup
```

## 4. Nginx Configuration

Create `/etc/nginx/sites-available/slate`:

```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_prefer_server_ciphers on;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    location /_next/static {
        proxy_pass http://127.0.0.1:3000;
        add_header Cache-Control "public, max-age=31536000, immutable";
    }
}
```

Enable:

```bash
sudo ln -s /etc/nginx/sites-available/slate /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

## 5. SSL with Let's Encrypt

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

## 6. Database Migrations

```bash
npm run db:migrate
```

For new schema changes in development:

```bash
npm run db:migrate:dev
```

Back up the SQLite database before deploying schema changes:

```bash
cp prisma/prod.db prisma/prod.db.backup
```

## 7. Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create OAuth 2.0 credentials
3. Add authorized redirect URI: `https://yourdomain.com/api/auth/callback/google`

## 8. Capacitor (Future iOS/Android)

Install Capacitor when ready:

```bash
npm install @capacitor/core @capacitor/cli @capacitor/ios @capacitor/android
npx cap add ios && npx cap add android
```

For SSR Next.js apps, point Capacitor at your production server in `capacitor.config.ts`:

```typescript
server: {
  url: "https://yourdomain.com",
  androidScheme: "https",
  cleartext: false,
}
```

Or set `CAPACITOR_SERVER_URL=https://yourdomain.com` in your environment before `npx cap sync`.

## 9. Performance Checklist

- Enable gzip in Nginx
- Set long cache headers for `/_next/static`
- Monitor with `pm2 monit`
- Back up `prisma/prod.db` regularly
