# Chow! Apply — Netlify Deployment Guide

## Files
```
chow-apply/
├── index.html                      ← main page (drop this at your site root)
├── netlify.toml                    ← Netlify config
└── netlify/
    └── functions/
        └── app-states.js           ← serverless function (shared state)
```

## Deploy Steps

1. **Push all three files** to your GitHub repo (keeping the folder structure).
2. In **Netlify → Site settings → Environment variables**, add:
   ```
   ADMIN_PASSWORD = 374239874623074623
   ```
   (You can change this to anything — just update it in index.html too.)
3. Make sure **Netlify Blobs** is enabled (it's on by default for all Netlify sites).
4. Deploy!

---

## Using the Dev Console

### Open it
- Add `?console` to your URL: `https://yoursite.netlify.app?console`
- Or press the **backtick key `** anywhere on the page

### Commands
```
/Application Mod Open
/Application Mod Close

/Application Beta Open
/Application Beta Close

/Application Dev Open
/Application Dev Close

/Application CC Open         ← CC = Content Creator
/Application CC Close

/status                      ← see all current states
/help                        ← show command list
/logout                      ← end session
```

### Password flow
1. Type a command, e.g. `/Application Mod Close`
2. Console asks for password
3. Type `374239874623074623` and press Enter
4. Command executes — **updates for everyone instantly**

After authenticating once, commands run without re-entering the password until you `/logout` or refresh.

### How it works
- States are stored in **Netlify Blobs** (server-side key-value store)
- Every page load fetches the current state from the server
- When you run a command, it POSTs to `/api/app-states` with the password
- All visitors see the update on their next page load (or reload)
- Falls back to localStorage if the function isn't deployed (local testing)
