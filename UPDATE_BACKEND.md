# How to Update Backend on Google Cloud Server

## Quick Update Steps (SSH into your server)

### Option 1: Edit the file directly (Easiest)

1. **SSH into your server** (you already have this open)

2. **Navigate to where server.js is located:**
   ```bash
   cd ~
   # Or wherever your server.js file is
   # Find it with: find ~ -name "server.js" -type f
   ```

3. **Backup the current file:**
   ```bash
   cp server.js server.js.backup
   ```

4. **Edit server.js** and find this section (around line 159-160):
   ```javascript
   // Note: URL rewriting removed as it causes issues with modern sites
   // Modern approach is to load in iframe with proper headers
   
   res.send(html);
   ```

5. **Replace it with:**
   ```javascript
   // Rewrite URLs to go through proxy
   html = rewriteHTML(html, targetUrl, req);
   
   res.send(html);
   ```

6. **Also check the rewriteHTML function** - it should accept 3 parameters: `(html, targetUrl, req)`

7. **Restart PM2:**
   ```bash
   pm2 restart secureproxy
   ```

8. **Check logs:**
   ```bash
   pm2 logs secureproxy --lines 20
   ```

### Option 2: Upload the updated file (Recommended)

1. **From your local machine**, upload the updated server.js:
   ```bash
   scp backend-reference/server.js omiteyt@35.196.124.59:~/server.js
   ```

2. **SSH into server** and restart:
   ```bash
   pm2 restart secureproxy
   pm2 logs secureproxy
   ```

### Option 3: Use nano/vim to edit

1. **Open server.js:**
   ```bash
   nano server.js
   # or
   vim server.js
   ```

2. **Search for:** `URL rewriting removed` (press Ctrl+W in nano, or `/` in vim)

3. **Replace the commented section** with the active code

4. **Save and exit** (Ctrl+X, then Y, then Enter in nano)

5. **Restart:** `pm2 restart secureproxy`

## What Changed?

The key change is **enabling URL rewriting** so that images, CSS, and JavaScript files load through the proxy instead of directly from the target website. This is essential for the proxy to work correctly.

