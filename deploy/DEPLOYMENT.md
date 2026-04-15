# Kobold Web — Hetzner Deployment Guide

## Architecture Overview

```
Internet → Porkbun DNS → Hetzner Server (public IP)
                              ├── Traefik (ports 80/443, auto-SSL via Let's Encrypt)
                              │     └── reverse proxies to ↓
                              └── kobold-web (port 3000, internal only)
                                    └── connects to Supabase PostgreSQL (external)
```

Portainer (on your existing server) manages both stacks via Edge Agent.

---

## Step 1: Create the Hetzner Server

1. Go to [Hetzner Cloud Console](https://console.hetzner.cloud/) → your project
2. **Create Server** with these settings:
    - **Location**: Choose closest to your users (Falkenstein/Nuremberg for EU, Ashburn for US)
    - **Image**: Ubuntu 24.04
    - **Type**: **CX23** (2 vCPU, 4 GB RAM, €4.49/mo) — plenty for a single web app
    - **Networking**: Public IPv4 + IPv6
    - **SSH Key**: Add your public SSH key
    - **Firewall**: Create one allowing inbound **22 (SSH)**, **80 (HTTP)**, **443 (HTTPS)**
    - **Name**: e.g., `kobold-web`

3. Note the server's **public IPv4 address**

---

## Step 2: Initial Server Setup

SSH into the new server:

```bash
ssh root@<SERVER_IP>
```

### Install Docker

```bash
# Install Docker
curl -fsSL https://get.docker.com | sh

# Verify
docker --version
docker compose version
```

### Create the shared proxy network

```bash
docker network create proxy
```

---

## Step 3: Connect to Portainer via Edge Agent

1. In your **Portainer** dashboard, go to **Environments** → **Add Environment**
2. Select **Docker Standalone** → **Edge Agent**
3. Give it a name like `kobold-web-server`
4. Copy the generated Edge Agent deployment command (it will look like):

```bash
docker run -d \
  -v /var/run/docker.sock:/var/run/docker.sock \
  -v /var/lib/docker/volumes:/var/lib/docker/volumes \
  -v /:/host \
  -v portainer_agent_data:/data \
  --restart always \
  -e EDGE=1 \
  -e EDGE_ID=<generated> \
  -e EDGE_KEY=<generated> \
  -e EDGE_INSECURE_POLL=1 \
  --name portainer_edge_agent \
  portainer/agent:latest
```

5. Run it on the Hetzner server
6. Wait for the environment to appear as **connected** in Portainer

---

## Step 4: Deploy Traefik Stack

In Portainer, on the `kobold-web-server` environment:

1. Go to **Stacks** → **Add Stack**
2. Name: `traefik`
3. Paste the contents of [`deploy/traefik/docker-compose.yml`](../deploy/traefik/docker-compose.yml)
4. Under **Environment variables**, add:

| Variable                 | Value                                      |
| ------------------------ | ------------------------------------------ |
| `DOMAIN`                 | `kobold.tools`                             |
| `ACME_EMAIL`             | Your email for Let's Encrypt notifications |
| `TRAEFIK_DASHBOARD_AUTH` | See below                                  |

To generate the dashboard auth password:

```bash
# On your local machine or the server:
docker run --rm httpd:2.4-alpine htpasswd -nB admin
# Enter a password, copy the output (e.g., admin:$2y$05$...)
# In Portainer env vars, escape $ as $$ (e.g., admin:$$2y$$05$$...)
```

> **Note**: If you don't want the Traefik dashboard exposed, remove the dashboard labels from the compose file.

5. Deploy the stack

### Verify Traefik is running

```bash
docker logs traefik
# Should show "Configuration loaded from flags" and no errors
```

---

## Step 5: Deploy Kobold Web Stack

1. In Portainer → `kobold-web-server` → **Stacks** → **Add Stack**
2. Name: `kobold-web`
3. Paste the contents of [`deploy/web/docker-compose.yml`](../deploy/web/docker-compose.yml)
4. Under **Environment variables**, add:

| Variable | Value          |
| -------- | -------------- |
| `DOMAIN` | `kobold.tools` |

5. For the **stack.env** variables, you have two options:

    **Option A — Portainer env vars**: Add all the variables from `stack.env.example` directly in Portainer's environment variables section (more secure, stored in Portainer).

    **Option B — env file on disk**: SSH into the server and create the file:

    ```bash
    mkdir -p /opt/stacks/kobold-web
    nano /opt/stacks/kobold-web/stack.env
    ```

    Fill in values based on [`deploy/web/stack.env.example`](../deploy/web/stack.env.example), then update the compose file's `env_file` path to the absolute path.

    For **Option A**, remove the `env_file` line from the compose and add all variables directly:

    ```yaml
    environment:
        - NODE_ENV=production
        - API_PORT=3000
        - DATABASE_URL=${DATABASE_URL}
        - API_SECRET=${API_SECRET}
        - API_BASE_URL=https://kobold.tools
        - FRONTEND_BASE_URL=https://kobold.tools
        - DISCORD_OAUTH_CLIENT_ID=${DISCORD_OAUTH_CLIENT_ID}
        - DISCORD_OAUTH_CLIENT_SECRET=${DISCORD_OAUTH_CLIENT_SECRET}
        - WANDERERS_GUIDE_API_KEY=${WANDERERS_GUIDE_API_KEY}
        - WANDERERS_GUIDE_OAUTH_BASE_URL=${WANDERERS_GUIDE_OAUTH_BASE_URL}
    ```

6. Deploy the stack

### Verify

```bash
# Check container is healthy
docker ps
# Should show kobold-web as "healthy"

# Check logs
docker logs kobold-web

# Test health endpoint directly
curl http://localhost:3000/health
```

---

## Step 6: Configure DNS at Porkbun

1. Go to [Porkbun](https://porkbun.com/) → Domain Management → `kobold.tools`
2. **Before changing DNS**, lower the TTL on existing records to 300 (5 min) if possible
3. Update/create these DNS records:

| Type | Host       | Value                           | TTL |
| ---- | ---------- | ------------------------------- | --- |
| A    | ` ` (root) | `<HETZNER_SERVER_IP>`           | 300 |
| A    | `www`      | `<HETZNER_SERVER_IP>`           | 300 |
| AAAA | ` ` (root) | `<HETZNER_IPV6>` (if available) | 300 |

4. **Remove** any existing CNAME or A records pointing to Netlify

> DNS propagation typically takes 5-30 minutes. You can check with:
>
> ```bash
> dig kobold.tools +short
> # Should return your Hetzner IP
> ```

5. Once confirmed working, increase TTL to 3600 or higher

---

## Step 7: Set Up GitHub Actions CI

The workflow at [`.github/workflows/build-web.yaml`](../.github/workflows/build-web.yaml) will automatically build and push `significantotter/kobold-web:latest` to Docker Hub on pushes to `main` that touch web-related files.

### Prerequisites

Your repo should already have these secrets (used by the bot workflow too):

- `DOCKER_USERNAME` — Docker Hub username
- `DOCKER_PASSWORD` — Docker Hub access token

### Auto-deploy with Portainer Webhook

1. In Portainer → `kobold-web` stack → **Services** → `kobold-web`
2. Enable **Service webhook**
3. Copy the webhook URL
4. Add a step to the GitHub Actions workflow to trigger it, **or** set up Portainer's built-in polling:
    - In the stack settings, enable **Auto update** → **Polling** with a 5-minute interval

Alternatively, add a webhook step to the CI:

```yaml
- name: Trigger Portainer redeploy
  if: github.ref == 'refs/heads/main'
  run: |
      curl -X POST "${{ secrets.PORTAINER_WEBHOOK_URL }}"
```

Add `PORTAINER_WEBHOOK_URL` as a repository secret.

---

## Step 8: Update Discord OAuth Redirect URI

In the [Discord Developer Portal](https://discord.com/developers/applications):

1. Go to your app → **OAuth2** → **Redirects**
2. Add: `https://kobold.tools/oauth/callback`
3. Keep the old Netlify redirect URI until migration is verified

---

## Post-Migration Checklist

- [ ] Server created and firewall configured
- [ ] Docker installed, proxy network created
- [ ] Edge Agent connected to Portainer
- [ ] Traefik stack deployed, dashboard accessible (if enabled)
- [ ] Kobold web stack deployed, health check passing
- [ ] DNS A record pointing to Hetzner IP
- [ ] SSL certificate auto-provisioned (check `https://kobold.tools`)
- [ ] Discord OAuth callback working at new URL
- [ ] GitHub Actions building and pushing image on merge to main
- [ ] Portainer auto-update or webhook configured
- [ ] Old Netlify deployment disabled
- [ ] DNS TTL raised back to 3600+

---

## Troubleshooting

### SSL certificate not provisioning

```bash
# Check Traefik logs for ACME errors
docker logs traefik 2>&1 | grep -i acme

# Verify DNS is pointing to this server
dig kobold.tools +short

# Ensure ports 80 and 443 are open in Hetzner firewall
```

### Container not accessible via Traefik

```bash
# Verify container is on the proxy network
docker network inspect proxy

# Check Traefik can see the container
# Visit https://traefik.kobold.tools/dashboard/ (if dashboard enabled)

# Check labels are correct
docker inspect kobold-web | jq '.[0].Config.Labels'
```

### OAuth not working

- Ensure `API_BASE_URL` and `FRONTEND_BASE_URL` are both `https://kobold.tools`
- Ensure the Discord redirect URI matches exactly
- Check cookies: session cookies need `Secure` flag in production (should be automatic with `NODE_ENV=production`)

### Database connection issues

- Supabase may require the connection to come from an allowed IP
- In Supabase dashboard → Settings → Database → Connection Pooling, check if IP allowlist is enabled
- Add your Hetzner server's IP to the allowlist
