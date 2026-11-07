# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Primary customers are buyers in India, and two groups carry equal weight:

- **Household buyers** restocking dry fruits and nuts for everyday health and snacking, typically in 250g to 1kg packs, and likely to buy again.
- **Festive gifters** buying combos and hampers for occasions such as Diwali, Eid, weddings and corporate milestones. They care about presentation and about it arriving in time.

Neither group should be designed around the other.

Store staff are the second audience. They run the catalogue, stock, orders, coupons, reviews, content and store settings from the admin console. The CMD console and API explorer serve whoever operates the system.

## Product Purpose

NutriNation is a real dry-fruits store preparing to take real orders. It sells cashews, almonds, pistachios, walnuts, raisins, dates, figs, prunes, apricots, combos and gift boxes directly to customers, and gives staff the tools to run the business day to day.

Success means customers trust the store enough to buy, household buyers come back, gifters choose it for occasions, and staff can operate it without outside help.

## Positioning

Open decision: a claim only this store can make has not been confirmed. The working position is a premium, editorial dry-fruits store that sells on quality, origin and grade, but its sourcing claims are unverified (see Evidence on Hand). Do not treat them as the differentiator until they are confirmed.

## Operating Context

- **Currency and locale:** INR, `en_IN`, Indian addresses with 6-digit PIN codes.
- **Buying:** products come in weight variants with a price and MRP. Customers browse, search, filter, save to a wishlist, check out, and track orders by number (format `NN-`).
- **Payment options at checkout:** cash on delivery only for now. UPI, card and net banking are shown as unavailable until a gateway is connected.
- **Fulfilment:** orders move through Pending, Confirmed, Packed, Shipped, Out for Delivery and Delivered, with a per-order timeline.
- **Customer care:** handled through the support email and phone. Published policies give a 7-day window after delivery for damaged, wrong, expired or defective goods, with no change-of-mind returns on sealed food, and free cancellation until an order is marked Shipped.
- **Seasonality:** gifting demand peaks around festivals.

## Capabilities and Constraints

- **Surfaces:** customer storefront (including account, cart, checkout and policy pages), admin console, CMD operations console, API explorer.
- **Stack:** Next.js 16 App Router in `frontend/`, using Route Handlers on Supabase Postgres for store data, with Spring Boot services behind an API gateway in `backend/`. The customer service owns sign-in. Hosted on Netlify (frontend) and Render (services).
- **Access:** the Spring customer-service owns sign-in, with `ADMIN` and `CUSTOMER` roles. Sessions are HttpOnly cookies, pages and writes are checked on the server, and Row Level Security blocks direct public access.
- **Food rules:** opened packs cannot be returned, for hygiene and safety reasons, unless there is a quality defect.

Undecided or unconfirmed:

- A live payment gateway. None is connected, so checkout takes cash on delivery only and shows card, UPI and net banking as unavailable (`ONLINE_PAYMENTS_ENABLED`). Do not imply online payments are processed until one is.
- Shipping rates, delivery areas and delivery times.
- Business and regulatory details to display, such as a food-safety licence number and tax registration.
- The production domain. Metadata references `nutrination.in`; the deployed site is `nutrination.netlify.app`.

## Brand Commitments

- **Name:** NutriNation.
- **Tagline in use:** "Nourish Naturally".
- **Terminology:** "dry fruits" is the customer-facing category term. Local product names such as anjeer and kishmish appear alongside English ones.
- **Policy voice:** plain, direct and reassuring, as in "we will make it right".

## Evidence on Hand

Nothing below has been confirmed as true for launch. The owner has not yet verified it, so treat all of it as placeholder rather than proof:

- **Sourcing and grade claims**, such as Mangalore or Kashmir origins and "top 1% harvest", in `supabase/seed.sql`.
- **Ratings, review counts and sample orders**, which are seed data in `supabase/seed.sql`. Do not use them as social proof without real customer data behind them.
- **Health and Ayurvedic benefit claims** in product copy. These need review before publishing.
- **Photography:** catalogue images are Unsplash stock, although the README calls them "real harvest photography". Do not describe them as the store's own.

Confirmed real assets: the policy pages (`frontend/src/app/(storefront)/*-policy/`), the Casanova typeface file (`frontend/public/fonts/`), and README screenshots (`docs/screenshots/`).

No testimonials, press, certifications, customer counts or sales figures exist. Do not invent any.

## Product Principles

1. **Trust sells the product.** Dry fruits are bought on quality the customer cannot taste online, so every claim shown has to be one the store can stand behind.
2. **Serve the restock and the gift equally.** Repeat buying and occasion gifting are both first-class journeys.
3. **Honest over impressive.** A real store shows real stock, real prices and real status. Placeholder proof never ships as fact.
4. **Staff tools are part of the product.** If staff cannot run it, the store does not work, whatever the storefront looks like.
5. **Food safety comes first.** Freshness, storage, ingredients and return limits stay clear and easy to find.
