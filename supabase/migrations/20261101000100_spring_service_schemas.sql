-- Schemas for the optional Spring Boot microservices when they run against
-- Supabase. Hibernate (ddl-auto: update) creates the tables inside them.
-- These schemas are not exposed through the Data API.
create schema if not exists product_service;
create schema if not exists customer_service;
create schema if not exists order_service;
