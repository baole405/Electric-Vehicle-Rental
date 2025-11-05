# 🔍 Check Doppler Sync with Cloudflare Pages

## Commands to Run

### 1. Check Doppler Project Info

```bash
doppler projects
```

### 2. Check Current Doppler Config

```bash
doppler configs
```

### 3. View Production Secrets

```bash
doppler secrets --config prd
```

### 4. Check Doppler Integrations (Cloudflare)

```bash
doppler integrations
```

### 5. Check if Cloudflare Pages is connected

```bash
doppler integrations:cloudflare-pages:list
```

### 6. Verify VITE_API_URL in production

```bash
doppler secrets get VITE_API_URL --config prd
```

---

## Expected Setup

**Doppler Project**: `ev-rental-system-frontend`

**Configs**:

- `dev` → Local development
- `prd` → Production (Cloudflare Pages)

**Cloudflare Pages Integration**:

- Project: `electric-vehicle-rental`
- Auto-sync: Enabled
- Environment: `production`

---

## What to Check

### 1. Is Cloudflare Pages connected to Doppler?

```bash
doppler integrations
```

**Expected output**:

```
NAME                    TYPE              STATUS
electric-vehicle-rental cloudflare-pages  active
```

### 2. What secrets are synced to production?

```bash
doppler secrets --config prd --format json
```

**Should include**:

```json
{
  "VITE_API_URL": "https://electric-rental-p4ohi.ondigitalocean.app"
}
```

### 3. Check last sync status

```bash
doppler integrations:cloudflare-pages:logs
```

---

## If Integration Not Setup

### Setup Doppler → Cloudflare Pages Integration

1. **Get Cloudflare API Token**:

   - Go to: https://dash.cloudflare.com/profile/api-tokens
   - Create token with `Cloudflare Pages` scope

2. **Add Integration**:

   ```bash
   doppler integrations:cloudflare-pages:create
   ```

   - Follow prompts
   - Select project: `electric-vehicle-rental`
   - Select environment: `production`
   - Select Doppler config: `prd`

3. **Verify Sync**:
   ```bash
   doppler integrations:cloudflare-pages:get electric-vehicle-rental
   ```

---

## Manual Sync Alternative

If auto-sync not working, manually set in Cloudflare:

1. Go to Cloudflare Pages dashboard
2. Select project: `electric-vehicle-rental`
3. Go to `Settings` → `Environment Variables`
4. Add production variables:

   ```
   VITE_API_URL = https://electric-rental-p4ohi.ondigitalocean.app
   ```

5. Redeploy:
   ```bash
   # Trigger rebuild in Cloudflare Pages
   # Or push a new commit to trigger auto-deploy
   ```

---

## Verification Steps

### After sync, verify on Cloudflare Pages:

1. **Check Environment Variables**:

   - Dashboard → Settings → Environment Variables
   - Should show: `VITE_API_URL` = production URL

2. **Check Latest Build Logs**:

   - Dashboard → Deployments → Latest
   - Search for: `VITE_API_URL`
   - Should show production value

3. **Test in Browser**:
   ```javascript
   // Open production site console
   console.log(import.meta.env.VITE_API_URL);
   // Should print: https://electric-rental-p4ohi.ondigitalocean.app
   ```

---

## Common Issues

### Issue 1: Doppler CLI not installed

```bash
# Install on Windows (PowerShell)
scoop install doppler
# Or
choco install doppler
```

### Issue 2: Not logged in

```bash
doppler login
```

### Issue 3: Wrong project selected

```bash
doppler setup
# Select: ev-rental-system-frontend
# Select config: prd (for production)
```

### Issue 4: Integration not syncing

```bash
# Force sync
doppler integrations:cloudflare-pages:sync electric-vehicle-rental
```

---

## Action Items

### Frontend Team:

1. [ ] Run `doppler projects` to see available projects
2. [ ] Run `doppler integrations` to check Cloudflare connection
3. [ ] Run `doppler secrets --config prd` to see production secrets
4. [ ] Share output with team
5. [ ] Verify `VITE_API_URL` points to production backend

### Expected Result:

```bash
$ doppler secrets --config prd

NAME                VALUE
VITE_API_URL       https://electric-rental-p4ohi.ondigitalocean.app
```

---

## Next Steps

After confirming Doppler config:

1. If correct → Deploy frontend changes (`'use client'` fix)
2. If incorrect → Update Doppler secrets → Resync → Redeploy
3. Test payment flow on production
4. Verify no SSR errors

---

**Priority**: 🔴 HIGH  
**Blocker**: Need to verify production env vars before deploying  
**Tools Required**: Doppler CLI, Cloudflare Pages access
