# Infrastructure & Credentials Reference

## Hosting
- **Platform:** Railway
- **URL:** https://openclaw-vps-production-77c2.up.railway.app
- **Domain:** uzunyasa.com (GoDaddy DNS → GitHub Pages)
- **HTTPS:** ⚠️ Not enforced yet — enable in GitHub Pages settings

## GitHub
- **User:** cem2im
- **Repo:** cem2im/uzunyasa-website
- **Deploy:** GitHub Pages (auto from main branch)
- **Credentials:** ~/.git-credentials (token-based)

## Analytics
- **Google Analytics:** G-QBM7E0EHFP
- **Added to:** All HTML pages

## Social Media
- **Instagram:** @uzunyasaorg (Business account)
- **Facebook Page:** Uzun Yaşa (linked to IG)
- **Other IG accounts on same Meta:** drcemsim, tiptayapayzeka, cem_sim_

## Buffer (Social Media Scheduling)
- **Email:** cemsimsek11@gmail.com
- **Connected channels:** Instagram @uzunyasaorg, Facebook Uzun Yaşa
- **Mode:** Currently "Notify" (personal) — needs Professional for auto-post
- **To fix:** Reconnect IG as Professional account in Buffer

## AI/Bot
- **OpenClaw instance:** Railway container
- **Telegram bot:** @CemOpenclawBot
- **Model:** Claude Opus 4
- **Browser:** Chromium headless (playwright, /root/.cache/ms-playwright/chromium-1208/)

## DNS (GoDaddy)
- Custom domain uzunyasa.com pointing to GitHub Pages
- www redirect: needs CNAME record

## Pending Setup
- [ ] Formspree form ID (newsletter — currently placeholder)
- [ ] og-default.png social sharing image (1200×630px)
- [ ] HTTPS enforcement in GitHub Pages
- [ ] Brave Search API key for web search
- [ ] Buffer Professional reconnect (auto-posting)
