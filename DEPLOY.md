# Deploying sepnexus-web to your Hostinger VPS

This mirrors the `webhook-buffer` deployment pattern. Same VPS, same
`root_default` Docker network, same Traefik for routing + Let's Encrypt SSL.

This is a **static site** (Vite + React build), served by nginx in a single
container. No database, no env secrets at runtime — it just serves `dist/`.

Adds **one new container** (`sepnexus-web`). Nothing else gets restarted.

---

## Step 1 — On your laptop: push this repo to GitHub

From `/Users/akshaypalsingh/Desktop/sepnexus/`:

```bash
git init
git add -A
git commit -m "initial sepnexus homepage"
# Create a private repo on github.com/new called sepnexus-web
git remote add origin git@github.com:YOUR_GH_USERNAME/sepnexus-web.git
git branch -M main
git push -u origin main
```

> Use the HTTPS URL if you don't have SSH keys set up:
> `git remote add origin https://github.com/YOUR_GH_USERNAME/sepnexus-web.git`

---

## Step 2 — On the VPS: clone and configure

```bash
ssh root@srv844822.hstgr.cloud
cd /root
git clone https://github.com/YOUR_GH_USERNAME/sepnexus-web.git
cd sepnexus-web
cp .env.example .env
nano .env
```

Set `PUBLIC_HOST` to whichever hostname you want this to serve at.

**For first-time staging on the VPS subdomain (recommended — proves it works
before you point your real domain at it):**

```bash
PUBLIC_HOST=sepnexus.srv844822.hstgr.cloud
```

**For production once DNS is pointed at the VPS:**

```bash
PUBLIC_HOST=sepnexus.com
```

> The compose file routes both `${PUBLIC_HOST}` and `www.${PUBLIC_HOST}`, with
> `www` redirecting to apex. So if you set `PUBLIC_HOST=sepnexus.com`, Traefik
> will also handle `www.sepnexus.com` and 301 it to `sepnexus.com`.

---

## Step 3 — On the VPS: build and start

```bash
cd /root/sepnexus-web
docker compose up -d --build
```

First build takes ~1–2 minutes (Node install + Vite build inside the image).
Then:

```bash
docker ps | grep sepnexus-web
docker logs -f sepnexus-web
```

You should see nginx start cleanly. Press Ctrl+C to stop tailing.

---

## Step 4 — Confirm Traefik picked it up + got SSL

Wait ~30 seconds for Let's Encrypt to issue the cert, then:

```bash
# Use whatever you set PUBLIC_HOST to:
curl -I https://sepnexus.srv844822.hstgr.cloud/
```

Expect `HTTP/2 200`. Open it in your browser — you should see the homepage,
intro overlay, hero, manifesto, services grid, all of it.

---

## Step 5 — Point sepnexus.com at the VPS

You need the **public IPv4 address of the VPS**. Get it on the VPS with:

```bash
curl -s https://api.ipify.org && echo
```

Then at your domain registrar (wherever sepnexus.com is registered — GoDaddy,
Namecheap, Cloudflare, etc.), set DNS records:

| Type  | Host  | Value                         | TTL   |
|-------|-------|-------------------------------|-------|
| A     | `@`   | `<VPS_PUBLIC_IPV4>`           | 300   |
| A     | `www` | `<VPS_PUBLIC_IPV4>`           | 300   |

(If your registrar supports `AAAA` and the VPS has IPv6, add those too. Not
required.)

DNS usually propagates within 5–15 minutes. Verify:

```bash
dig sepnexus.com +short
dig www.sepnexus.com +short
```

Both should return the VPS IP.

Once DNS resolves, edit `.env` on the VPS:

```bash
nano /root/sepnexus-web/.env       # change PUBLIC_HOST to sepnexus.com
docker compose up -d                # picks up the new label values
```

Wait ~30 seconds, then:

```bash
curl -I https://sepnexus.com/
curl -I https://www.sepnexus.com/   # should be 301 → https://sepnexus.com/
```

Done. Traefik handles the cert renewal automatically every ~60 days.

---

## Updating later

Push to GitHub, then on the VPS:

```bash
ssh root@srv844822.hstgr.cloud
cd /root/sepnexus-web
git pull
docker compose up -d --build
```

The container restarts in seconds. Traefik continues serving during the swap
once the new container is healthy.

---

## Removing entirely (rollback)

```bash
cd /root/sepnexus-web
docker compose down
```

`postgresql`, `n8n`, `traefik`, and `webhook-buffer` keep running.

---

## Troubleshooting

**`docker compose up` fails with `network root_default not found`**
Confirm the network name with `docker network ls`. If different, edit
`docker-compose.yml` (under `networks:` at the bottom AND under the service's
`networks:` block).

**Traefik returns 404**
Check the container is on `root_default`:
```bash
docker inspect sepnexus-web --format '{{range $k,$v := .NetworkSettings.Networks}}{{$k}} {{end}}'
```
Should print `root_default`.

**SSL cert never appears**
Make sure DNS resolves to the VPS IP first:
```bash
dig sepnexus.com +short
```
Let's Encrypt won't issue a cert for a hostname that doesn't point at the VPS.
Wait 60 seconds after DNS propagates, then check Traefik logs:
```bash
docker logs root-traefik-1 2>&1 | tail -30
```

**Edits not showing up after `git pull`**
Make sure you used `--build`. Without it Docker reuses the cached image.

**404 on a page like `/dashboard.html`**
That page lives in `public/` and gets copied into `dist/` by the Vite build.
Confirm with: `docker exec sepnexus-web ls /usr/share/nginx/html`.
