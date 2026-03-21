# Production Deployment & Update Checklist for hitechcinisello.it

This file explains what you need to do when updating your code or making changes in the future, so your site and API remain stable and live.

---

## 1. **Frontend (React) Updates**
- **Edit your code** in `/frontend/src/` as needed.
- **After changes:**
  1. Build the frontend:
     ```sh
     cd ~/cell/frontend
     npm run build
     ```
  2. No need to restart nginx unless you change nginx config.
  3. Visit your site to verify changes.

---

## 2. **Backend (Node/Express) Updates**
- **Edit your code** in `/backend/` as needed.
- **After changes:**
  1. Restart the backend process:
     ```sh
     pm2 restart hitech-backend
     ```
  2. Check logs if needed:
     ```sh
     pm2 logs hitech-backend
     ```

---

## 3. **Environment Variables**
- **Edit your `.env` file** in `/backend/` if you change secrets, API keys, etc.
- **After editing `.env`:**
  ```sh
  pm2 restart hitech-backend
  ```

---

## 4. **nginx Configuration**
- **Edit nginx config** if you change domains, want to add SSL, or change proxy rules:
  ```sh
  sudo nano /etc/nginx/sites-available/hitechcinisello.it
  sudo nginx -t
  sudo systemctl reload nginx
  ```
- Only one config for your domain should be enabled in `/etc/nginx/sites-enabled/`.

---

## 5. **SSL/HTTPS**
- If you add or renew SSL, use certbot:
  ```sh
  sudo certbot --nginx -d hitechcinisello.it -d www.hitechcinisello.it
  ```

---

## 6. **General Best Practices**
- **Always use git** for code changes:
  ```sh
  git add .
  git commit -m "Describe your change"
  git push
  ```
- **Test your site and API** after every update.
- **Keep dependencies up to date** (`npm install` if you change `package.json`).
- **Back up your database** and important files regularly.
- **PM2 and nginx will auto-start on reboot.**

---

## 7. **If Something Breaks**
- Check PM2 status: `pm2 status`
- Check backend logs: `pm2 logs hitech-backend`
- Check nginx status: `sudo systemctl status nginx`
- Check nginx config: `sudo nginx -t`
- Restart services as needed.

---

**Keep this file for future reference!**
