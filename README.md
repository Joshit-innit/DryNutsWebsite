<div align="center">

# NutriNation

**A premium dry-fruits commerce platform: an editorial storefront, a full admin console, a Supabase database and a Spring Boot microservice backend.**

![Next.js](https://img.shields.io/badge/Next.js-16-000000?logo=nextdotjs&logoColor=white)
![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3-06B6D4?logo=tailwindcss&logoColor=white)
![Spring Boot](https://img.shields.io/badge/Spring_Boot-3.4-6DB33F?logo=springboot&logoColor=white)
![Spring Cloud](https://img.shields.io/badge/Spring_Cloud-2024.0-6DB33F?logo=spring&logoColor=white)
![Java](https://img.shields.io/badge/Java-21-ED8B00?logo=openjdk&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-Postgres-3FCF8E?logo=supabase&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?logo=postgresql&logoColor=white)
![Netlify](https://img.shields.io/badge/Netlify-deployed-00C7B7?logo=netlify&logoColor=white)

### [Live site → nutrination.netlify.app](https://nutrination.netlify.app)

<br/>

<img src="docs/screenshots/home-hero.png" alt="NutriNation storefront homepage" width="100%"/>

</div>

---

## Overview

NutriNation is an end-to-end e-commerce platform for hand-graded dry fruits: Mamra almonds, W-180 cashews, Medjool dates, pistachios, figs and curated gift boxes. It pairs a storefront designed like an editorial magazine with the operational tooling a real store needs. Customers browse, search, save favourites and check out. Staff manage the catalogue, inventory, orders, coupons, reviews and content from a dedicated admin console.

All store data (catalogue, accounts, orders, coupons, reviews and customers) lives in **Supabase Postgres**. By default the Next.js server talks to Supabase directly through its own API routes. The app can also run against a **service-oriented Spring Boot backend**: independent services sit behind an API gateway, find each other through service discovery, and each owns its own data, either in a local PostgreSQL database or in its own schema in the same Supabase project.

### Highlights

- **Editorial storefront** with an expanding photo gallery hero, a scroll-pinned product reel where each product morphs into the next (Framer Motion), smooth scrolling, scroll-reveal motion, a quick-view modal, a slide-out cart drawer and a mobile-first bottom dock.
- **Complete shopping flow**: catalogue filtering and sorting, category pages, product variants by weight, wishlist, cart, checkout, order history and order tracking.
- **Admin console** with revenue and conversion analytics, product CRUD, inventory thresholds, fulfilment pipeline, customers, coupons, promotions, review moderation and editorial content.
- **Operations console (CMD)** with service health, a service registry, database and cache views, logs, background jobs, deployments, security and audit screens.
- **Built-in API explorer** that documents and live-tests the REST endpoints from inside the app.
- **Server-side authentication** with role-based access (`ADMIN` / `CUSTOMER`): the Spring Customer Service signs in users, the session is an HttpOnly cookie, and pages and APIs are guarded on the server.
- **Supabase database** with versioned SQL migrations, seed data and Row Level Security that blocks all direct public access.

---

## Screenshots

### Storefront

<table>
  <tr>
    <td width="50%"><img src="docs/screenshots/home-reel.png" alt="Scroll-pinned product reel"/></td>
    <td width="50%"><img src="docs/screenshots/home-featured.png" alt="Harvest of the Day"/></td>
  </tr>
  <tr>
    <td align="center"><sub><b>Harvest Reel</b>: a pinned scroll section where each product morphs into the next</sub></td>
    <td align="center"><sub><b>Harvest of the Day</b>: one featured product with a scroll-revealed photo</sub></td>
  </tr>
</table>

<table>
  <tr>
    <td width="50%"><img src="docs/screenshots/products.png" alt="Product collection with filters"/></td>
    <td width="50%"><img src="docs/screenshots/product-detail.png" alt="Product detail page"/></td>
  </tr>
  <tr>
    <td align="center"><sub><b>Collection</b>: search, category filter, price range, availability and sorting</sub></td>
    <td align="center"><sub><b>Product detail</b>: weight variants, pricing, wishlist and add to bag</sub></td>
  </tr>
</table>

<div align="center">
  <img src="docs/screenshots/mobile-home.png" alt="Mobile storefront" width="300"/>
  <br/>
  <sub><b>Mobile</b>: responsive layout with a native-style bottom navigation dock</sub>
</div>

### Admin Console

<img src="docs/screenshots/admin-dashboard.png" alt="Admin executive dashboard" width="100%"/>
<p align="center"><sub><b>Executive dashboard</b>: revenue, orders, customers, low-stock alerts, monthly trends and category mix</sub></p>

<table>
  <tr>
    <td width="50%"><img src="docs/screenshots/admin-products.png" alt="Admin product catalogue"/></td>
    <td width="50%"><img src="docs/screenshots/admin-analytics.png" alt="Admin revenue analytics"/></td>
  </tr>
  <tr>
    <td align="center"><sub><b>Catalogue management</b>: SKUs, pricing, stock and publish status</sub></td>
    <td align="center"><sub><b>Revenue analytics</b>: order volume and conversion funnel</sub></td>
  </tr>
</table>

### Developer & Operations Tools

<table>
  <tr>
    <td width="50%"><img src="docs/screenshots/cmd-overview.png" alt="CMD operations console"/></td>
    <td width="50%"><img src="docs/screenshots/api-docs.png" alt="REST API explorer"/></td>
  </tr>
  <tr>
    <td align="center"><sub><b>CMD console</b>: cluster health, resource usage and the service registry</sub></td>
    <td align="center"><sub><b>API explorer</b>: browse and execute REST endpoints live</sub></td>
  </tr>
</table>

---

## Architecture

```
                    ┌────────────────────────────────────┐
                    │  Browser (HttpOnly session cookie) │
                    └─────────────────┬──────────────────┘
                                      │ same-origin /api/v1
                    ┌─────────────────▼──────────────────┐
                    │  Next.js  ·  proxy.ts page guard   │
                    │  Route Handlers verify the token   │
                    └──────┬──────────────────────┬──────┘
          store data       │                      │  sign-in only
                           │           ┌──────────▼───────────┐
                           │           │ API Gateway          │
                           │           │ round-robin balancer │
                           │           │ circuit breakers     │
                           │           └──────────┬───────────┘
                           │                      │  lb:// routing
                           │       ┌──────────────┼──────────────┐
                           │       │              │              │
                           │ ┌─────▼─────┐  ┌─────▼─────┐  ┌─────▼─────┐
                           │ │  Product  │  │ Customer  │  │   Order   │
                           │ │  Service  │  │  Service  │  │  Service  │
                           │ └─────┬─────┘  └─────┬─────┘  └─────┬─────┘
                           │       │              │              │
            ┌──────────────▼───────▼──────────────▼──────────────▼──────┐
            │                   Supabase  (PostgreSQL)                  │
            │  public schema: storefront data · RLS enabled             │
            │  product_service · customer_service · order_service       │
            └───────────────────────────────────────────────────────────┘

     Accounts live in customer_service. Spring services find each other through
     Eureka, or through the *_SERVICE_URL lists where Eureka is off.
     Locally they can use Docker PostgreSQL instead of Supabase.
```

| Service | Responsibility |
| --- | --- |
| **Supabase** | Managed PostgreSQL holding all store data. The Next.js server connects with a server-only secret key; Row Level Security blocks direct public access. Schema changes ship as SQL migrations in `supabase/migrations`. |
| **Next.js Route Handlers** | The API the browser calls: products, categories, orders, coupons, reviews and customers, served from Supabase. Sign-in is forwarded to the Customer Service; the token it signs is kept in an HttpOnly cookie and verified here. |
| **Discovery Server** | Netflix Eureka registry. Every service registers here so nothing depends on hard-coded addresses. |
| **API Gateway** | Single entry point for the frontend. Routes `/api/v1/**` to the right service through a round-robin load balancer, wraps each service in a Resilience4j circuit breaker with a JSON fallback, retries safe GETs and handles CORS centrally. |
| **Product Service** | Products, weight variants, nutrition info and categories. |
| **Customer Service** | The sign-in authority: registration, login, BCrypt password hashing, JWT issuance and validation, customer profiles and addresses. |
| **Order Service** | Order creation, status updates and a fulfilment timeline. Calls Product and Customer services through **OpenFeign**, load balanced and behind circuit breakers. |

Each service exposes **OpenAPI / Swagger UI** documentation and **Spring Boot Actuator** health endpoints.

---

## Deployment

| Part | Host | URL |
| --- | --- | --- |
| Storefront, admin console and built-in API | Netlify | **[nutrination.netlify.app](https://nutrination.netlify.app)** |
| API gateway | Render (Docker) | [nutrination-gateway.onrender.com](https://nutrination-gateway.onrender.com/actuator/health) |
| Product, customer and order services | Render (Docker) | `nutrination-product` / `-customer` / `-order` `.onrender.com` |

The frontend deploys from `netlify.toml` with Netlify's Next.js runtime. The four Spring Boot services deploy from the `render.yaml` Blueprint as Docker web services in Frankfurt, next to the Supabase database, and call each other by URL instead of through Eureka. Each service is built by a multi-stage Dockerfile (Maven build stage, JRE-only runtime as a non-root user, JVM sized for 512 MB instances).

<img src="docs/screenshots/render-services.jpg" alt="Render Blueprint with all four services deployed" width="100%"/>
<p align="center"><sub><b>Render</b>: gateway, product, customer and order services deployed on Docker in Frankfurt</sub></p>

Render's free plan puts idle services to sleep, so the first request after a quiet spell can take a couple of minutes. Sign-in handles this: the form says the service is waking, waits for it, and retries by itself.

---

## Tech Stack

### Frontend

| Area | Technology |
| --- | --- |
| Framework | **Next.js 16** (App Router, route groups, Route Handlers) |
| UI | **React 18**, **TypeScript 5** |
| Styling | **Tailwind CSS 3**, CSS Modules, custom typography |
| Motion | **Framer Motion**, **GSAP**, **Lenis** smooth scroll |
| Forms & validation | **React Hook Form** + **Zod** |
| State | React Context with persisted cart & wishlist |
| Data | **Axios** and a typed fetch client with request IDs and normalised errors |
| Database | **Supabase** Postgres via `@supabase/supabase-js`, used only on the server |
| Charts | **Recharts** |
| UX polish | **Sonner** toasts, **Lucide** icons, canvas-confetti |

### Backend

| Area | Technology |
| --- | --- |
| Language & runtime | **Java 21** |
| Framework | **Spring Boot 3.4**, Spring Web, Spring Data JPA, Bean Validation |
| Microservices | **Spring Cloud 2024**: Gateway, Netflix Eureka, OpenFeign |
| Security | **Spring Security**, stateless **JWT** auth, BCrypt |
| Database | **Supabase** (one schema per service) or **PostgreSQL 16** locally (one database per service) |
| API docs | **springdoc-openapi** (Swagger UI) |
| Observability | Spring Boot Actuator |
| Infrastructure | **Supabase** migrations, **Docker Compose** for local PostgreSQL, Maven multi-module build |

---

## Problems Solved

**Selling a premium product online.** Dry fruits sell on trust and quality. The storefront uses editorial typography, real harvest photography, origin and grade details and a calm palette to make the products feel premium, the way a well-designed physical store would.

**A real database without running a server farm.** Next.js Route Handlers read and write Supabase directly, so the catalogue, checkout, orders and the admin console work without the rest of the microservice stack. Only sign-in needs Spring, and sessions already issued keep working if it goes down, because Next.js verifies the signed token itself.

**Separation of concerns at scale.** Products, customers and orders change at different rates and carry different risk. Splitting them into independently deployable services, each with its own database or schema, keeps failures contained and lets each area evolve on its own.

**Service-to-service communication without tight coupling.** Eureka discovery and OpenFeign clients let the Order Service validate products and customers by service name rather than by hard-coded host. The gateway gives the frontend one stable origin.

**Secure, role-aware access.** Stateless JWTs carry the user's role. `proxy.ts` guards the admin and CMD consoles on the server before they render, and every write is checked again in its route handler. Sessions live in an HttpOnly cookie that page scripts cannot read. Supabase tables have Row Level Security turned on with no public policies, so only the server, holding the secret key, can touch the data. Passwords are hashed and secrets come from environment configuration.

**Running a store, not just a storefront.** Inventory thresholds, a fulfilment pipeline with a per-order timeline, coupons, promotions, review moderation and analytics give staff the tools to operate the business day to day.

**Developer experience.** An in-app API explorer, per-service Swagger docs, versioned Supabase migrations and a reproducible seed script make the system easy to explore, test and extend.

---

<div align="center">

Built with care by **[Joshit-innit](https://github.com/Joshit-innit)**

</div>
