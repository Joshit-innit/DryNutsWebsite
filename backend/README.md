# NutriNation SOA Backend

Spring Boot microservice backend for the DryNutsWebsite storefront.

## Modules

- `discovery-server` - Netflix Eureka registry on `8761`
- `api-gateway` - Spring Cloud Gateway on `8080`
- `product-service` - products/categories on `8081`
- `customer-service` - customers/mock auth on `8082`
- `order-service` - orders on `8083`, uses OpenFeign to call product/customer services

## PostgreSQL

Start PostgreSQL:

```bash
cd backend
docker compose up -d postgres
```

This creates:

- `nutrination_products`
- `nutrination_customers`
- `nutrination_orders`

Default credentials are `postgres` / `postgres`.

## Run Order

```bash
cd backend
mvn clean package

mvn -pl discovery-server spring-boot:run
mvn -pl api-gateway spring-boot:run
mvn -pl product-service spring-boot:run
mvn -pl customer-service spring-boot:run
mvn -pl order-service spring-boot:run
```

## Frontend Connection

The browser never calls the gateway directly. Next.js forwards sign-in to it and keeps the token in an HttpOnly cookie, so add this to `frontend/.env.local`, with `AUTH_SECRET` set to the same value as this backend's `JWT_SECRET`:

```bash
BACKEND_URL=http://localhost:8080
```

Sign-in needs `api-gateway` and `customer-service` running. The other services are optional for the storefront.

## Load Balancing and Circuit Breakers

Every gateway route, and the order service's Feign clients, go through Spring Cloud LoadBalancer (round robin). Instances come from Eureka, or from `PRODUCT_SERVICE_URL`, `CUSTOMER_SERVICE_URL` and `ORDER_SERVICE_URL`, which take comma-separated lists when Eureka is off.

Each downstream service has a Resilience4j circuit breaker. It opens at a 50% failure rate over the last 10 calls (at least 5), stays open for `CIRCUIT_OPEN_DURATION` (default 20s), then lets 3 trial calls through. While open, the gateway answers `503` with a JSON body and `Retry-After` without calling the service. 4xx responses never count as failures. Only GETs are retried, because repeating a login or an order is not safe.

`GATEWAY_TIMEOUT` (default 10s) caps each call. Keep it above Render's cold start (120s in `render.yaml`).

The gateway has CORS enabled for:

- `http://localhost:3000`
- `http://127.0.0.1:3000`

## Swagger

- Gateway Swagger UI: `http://localhost:8080/swagger-ui.html`
- Product Swagger UI: `http://localhost:8081/swagger-ui.html`
- Customer Swagger UI: `http://localhost:8082/swagger-ui.html`
- Order Swagger UI: `http://localhost:8083/swagger-ui.html`

## Main APIs

- `GET /api/v1/products`
- `GET /api/v1/products/{slugOrId}`
- `POST /api/v1/products`
- `PATCH /api/v1/products/{id}`
- `DELETE /api/v1/products/{id}`
- `GET /api/v1/categories`
- `GET /api/v1/customers`
- `POST /api/v1/auth/login`
- `POST /api/v1/auth/admin-login`
- `GET /api/v1/orders`
- `POST /api/v1/orders`
- `PATCH /api/v1/orders/{id}/status`
