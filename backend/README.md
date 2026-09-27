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

Create `.env.local` in the frontend project root:

```bash
NEXT_PUBLIC_API_URL=http://localhost:8080/api/v1
```

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
