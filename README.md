 HEAD
# Trendi

Sneakers & streetwear store built on the MERN stack (MongoDB, Express, React, Node).

```
client/   React + Vite + Tailwind frontend
server/   Express + MongoDB (Mongoose) API
```

## First-time setup

1. Create `server/.env` (see `server/.env.example`) with your MongoDB Atlas link and a JWT secret.
2. Install everything:
   ```bash
   npm run install-all
   ```
3. Load the sample products into the database (safe to run again; it skips products that exist):
   ```bash
   npm run seed
   ```

## Run

```bash
npm run dev
```

- Website: http://localhost:5173
- API: http://localhost:5000/api/health

## Make yourself admin

1. Open the site → Sign in → **Create an account**.
2. Run (with your email):
   ```bash
   npm run make-admin -- you@example.com
   ```
3. Sign out and back in. An **ADMIN** button appears in the header → `/admin`.

The admin panel can add/edit/hide/delete products, upload product images (or paste image links), set sizes and stock, choose which home-page rows a product appears in, and move orders through placed → confirmed → packed → shipped → delivered (or cancel, which returns stock).

## How it works

| Area | Where |
| --- | --- |
| Data models | `server/models/` — User, Product, Order |
| API routes | `server/routes/` — `/api/auth`, `/api/products`, `/api/orders`, `/api/users/wishlist`, `/api/admin/*` |
| Store settings (shipping fee, max qty) | `server/config/store.js` |
| Uploaded images | saved in `server/uploads/`, served at `/uploads/...` |
| Login | JWT in an httpOnly cookie, passwords hashed with bcrypt |
| Cart | kept in the browser; prices and stock are re-checked by the server when an order is placed |
| Wishlist | browser for guests, saved to the account after sign-in |
| Payment | Cash on Delivery only for now |
| Design tokens | `client/src/index.css` |

## Before going live

- Uploaded images are stored on the server's disk. Many hosts (e.g. Render free tier) wipe the disk on redeploy — switch to Cloudinary or S3 for production.
- Set `NODE_ENV=production` and `CLIENT_URL=<your site URL>` on the server, and `VITE_API_URL=<your API URL>` for the client build.

# E-Com_Website_Mern
fea6e7197a1c0b963ae698ba23273cd627c065d7
