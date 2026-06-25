# Project Overview

This document is the complete technical blueprint for building a self-owned e-commerce web application for physical product sales. The app will handle B2C retail, B2B bulk enquiries, and showcase work — all designed for organic SEO-driven growth from day one.

## 1. Core Goals
- Sell physical products online with standard e-commerce features
- Rank on Google organically — no paid ads dependency
- Handle 1,000+ concurrent users without crashing
- Keep infrastructure cost under ₹1,000/month at launch (aiming for 0 cost)
- Industry-standard security from day one
- B2B section for bulk/wholesale enquiries
- WhatsApp Business integration for quick customer contact

## 2. Final Tech Stack — With Reasons
Every technology below is chosen based on three criteria: cost (free or minimal), developer productivity (matches existing skills), and business value (SEO, performance, scalability).

### 2.1 Frontend — Next.js 14
| Item | Detail |
| :--- | :--- |
| **Technology** | Next.js 14 (App Router) + Tailwind CSS + Zustand |
| **Why Next.js** | Server-Side Rendering (SSR) and Static Site Generation (SSG) built-in. Google indexes full HTML — product names, prices, descriptions all crawlable. Critical for organic SEO. |
| **SEO benefit** | Each product page gets its own meta title, description, OG image automatically via `generateMetadata()`. React SPA cannot do this cleanly. |
| **ISR** | Incremental Static Regeneration — product pages pre-built as static HTML, auto-refresh every hour. Lightning fast for users AND bots. |
| **Image opt.** | `next/image` auto-converts to WebP, lazy loads, resizes — Core Web Vitals improve = better Google ranking. |
| **State** | Zustand for cart, wishlist, user session. Lightweight vs Redux. |
| **Cost** | FREE — Deploy on Vercel free tier (built by Next.js creators, optimized for it). |

### 2.2 Backend — Node.js + Express
| Item | Detail |
| :--- | :--- |
| **Technology** | Node.js + Express.js — Modular Monolith structure |
| **Architecture** | Monolith at launch but written in modules: `/modules/auth`, `/modules/product`, `/modules/order`, `/modules/b2b`, `/modules/shipping`, `/modules/admin`. Each module has its own routes, controllers, services — split to microservices anytime. |
| **Why not microservices now** | Pure microservices require Kubernetes, Docker orchestration, inter-service communication, API gateways — all cost money and time. Monolith at launch = same codebase, 1/10th the infrastructure cost. |
| **Scale path** | When any module hits 1000 req/min consistently, extract it to a standalone service. Code structure is already ready — it is just a new deployment. |
| **Cost** | Hetzner CX22 VPS — ₹700/month. 2 vCPU, 4GB RAM, 40GB SSD. Handles 2000+ concurrent users easily. |

### 2.3 Database — MongoDB Atlas
| Tier | Detail |
| :--- | :--- |
| **M0 Free Tier** | 512MB storage, shared cluster, India region (Mumbai). FREE forever — no time limit. |
| **Capacity** | 10,000 users (~20MB) + 2,000 products (~10MB) + 50,000 orders (~400MB) — all fits in free tier easily. |
| **Images** | Product images stored on Cloudinary (free 25GB). Only image URLs stored in MongoDB — saves massive storage. |
| **When to upgrade** | M2 Shared ($9/month = ₹750) when storage nears 400MB. Zero downtime migration — one click in Atlas dashboard. |
| **Indexes (must do)** | Create indexes on: `productId`, `categoryId`, `userId`, `orderId`, `slug` from day one. Without indexes, 5000-product search takes 2 seconds. With indexes: 2 milliseconds. |

### 2.4 Caching — Redis Cloud
| Use case | Detail |
| :--- | :--- |
| **Free tier** | Redis Cloud free — 30MB, 30 connections. Sufficient for launch. |
| **What to cache**| Homepage banner data (10 min TTL), product category listings (5 min TTL), user sessions, cart data, rate limit counters. |
| **Scalability impact** | 10,000 users hit homepage simultaneously — without Redis: 10,000 DB queries. With Redis: 1 DB query, 9,999 served from cache. This is how you handle traffic spikes. |

### 2.5 Infrastructure & CDN — Cloudflare (Free)
**Cloudflare Free Tier — What You Get:**
- DDoS protection — blocks volumetric attacks up to 100Gbps automatically
- SSL/HTTPS certificate — free forever, auto-renews
- CDN — static assets (JS, CSS, images) served from nearest edge node worldwide
- Bot protection — blocks scrapers, credential stuffers, bad bots
- Rate limiting — free basic rules (3 rules on free plan)
- Analytics — real visitor data, no tracking scripts needed
- Always-on mode — shows cached site even if backend goes down
- Cost: ₹0 forever on free plan

*Setup process: Buy domain → Change nameservers to Cloudflare → Cloudflare handles everything. Takes 15 minutes.*

### 2.6 Image Storage — Cloudinary
| Item | Detail |
| :--- | :--- |
| **Free tier** | 25GB storage + 25GB bandwidth/month + auto WebP conversion + CDN delivery. FREE. |
| **Why use it** | Upload once, Cloudinary auto-generates: thumbnail, card size, full size, WebP version. One URL parameter changes size: `image.jpg?w=400` gives 400px version. |
| **SEO benefit** | Fast-loading images = better Core Web Vitals score = higher Google ranking. Especially important for product pages. |

### 2.7 Email & Notifications
| Service | Purpose | Free Tier |
| :--- | :--- | :--- |
| **Resend** | Transactional emails — order confirmation, OTP, password reset | 3,000 emails/month free |
| **Firebase FCM** | Push notifications for mobile/web — order updates, offers | Completely free |
| **WhatsApp Business**| Floating button on website — direct customer chat | Free (just a link to your WhatsApp Business number) |

## 3. Monthly Cost Summary — Bootstrap Phase
Complete infrastructure cost at launch. Every service below has been selected for maximum free tier.

| Service | Provider | Plan | Monthly Cost |
| :--- | :--- | :--- | :--- |
| **VPS (Backend server)** | Hetzner | CX22 (2 vCPU, 4GB RAM) | ₹700 |
| **Frontend hosting** | Vercel | Free tier | ₹0 |
| **Database** | MongoDB Atlas | M0 Free (512MB) | ₹0 |
| **Cache / Sessions** | Redis Cloud | Free (30MB) | ₹0 |
| **CDN + DDoS + SSL** | Cloudflare | Free forever | ₹0 |
| **Image storage + CDN** | Cloudinary | Free (25GB) | ₹0 |
| **Email (transactional)** | Resend | Free (3000/mo) | ₹0 |
| **Push notifications** | Firebase FCM | Free | ₹0 |
| **Domain name (.in)** | Namecheap | ₹700/year | ~₹60 |
| **Total Monthly Cost** | | | **~₹760/month** |

*Note: Payment gateway (Razorpay) has no monthly fee. Charges are per-transaction only.*

**When to Upgrade:**
- Atlas >400MB storage -> Upgrade to M2 Shared (+₹750/month)
- VPS CPU >80% sustained -> Upgrade to Hetzner CX32 (+₹700/month)
- Email >3000/month -> Resend paid ($20/mo) (+₹1,650/month)
- Cloudinary >25GB -> Cloudinary Plus ($89/mo) (+₹7,400/month)

## 4. System Architecture
The application follows a layered architecture. Frontend (Next.js on Vercel) communicates with the backend API (Node.js on Hetzner) via HTTPS. Cloudflare sits in front of everything as CDN, DDoS protection, and SSL terminator.

### 4.1 Architecture Layers
| # | Layer | Technology | Responsibility |
| :--- | :--- | :--- | :--- |
| 1 | **Edge / CDN** | Cloudflare Free | SSL, DDoS protection, static asset caching, rate limiting, bot blocking |
| 2 | **Frontend** | Next.js 14 on Vercel | SSR/SSG pages, SEO meta tags, ISR for product pages, user interface |
| 3 | **API Gateway** | Nginx on Hetzner | Reverse proxy, rate limiting, request routing, gzip compression, security headers |
| 4 | **Backend** | Node.js + Express | Business logic in modules: Auth, Product, Order, B2B, Shipping, Admin, Notification |
| 5 | **Cache** | Redis Cloud | Session store, cart cache, homepage data cache, rate limit counters |
| 6 | **Database** | MongoDB Atlas | Primary data store — users, products, orders, reviews, coupons, B2B leads |
| 7 | **Media** | Cloudinary | Product images, banner images — CDN delivery, auto WebP conversion |

### 4.2 Backend Module Structure
Code is organized by domain modules. Each module is self-contained and can be extracted to a microservice without rewriting logic.

| Module | Responsibilities |
| :--- | :--- |
| **Auth** | Register, login, logout, JWT tokens in HttpOnly cookies, Google OAuth, password reset, OTP via email |
| **Product** | CRUD for products, categories, search with filters (price, category, rating), product slugs for SEO URLs |
| **Order** | Cart management, checkout, coupon/discount validation, festival offer codes, order history, status tracking |
| **Payment** | Razorpay order creation, payment verification (HMAC signature), webhook handler, refund initiation |
| **Shipping** | Shiprocket integration — AWB generation, courier selection, shipment tracking, delivery webhook |
| **B2B** | Bulk enquiry form, lead capture, custom pricing requests, B2B contact management in admin |
| **User Profile** | Addresses (multiple), order history, wishlist, reviews, profile edit, account deletion (DPDPA compliance) |
| **Notification** | Email via Resend (order confirm, dispatch, OTP), push via Firebase FCM (offers, delivery updates) |
| **Admin** | Product management, order management, coupon/offer creation, B2B lead view, banner management, analytics dashboard |
