# Build from the backend/ directory so the parent pom is in the context:
#   docker build -f product-service/Dockerfile -t nutrination-product-service .
FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /workspace
COPY pom.xml .
COPY api-gateway/pom.xml api-gateway/
COPY customer-service/pom.xml customer-service/
COPY discovery-server/pom.xml discovery-server/
COPY order-service/pom.xml order-service/
COPY product-service/pom.xml product-service/
RUN mvn -B -q -pl product-service -am dependency:go-offline
COPY product-service/src product-service/src
RUN mvn -B -q -pl product-service -am package -DskipTests

FROM eclipse-temurin:21-jre
WORKDIR /app
RUN useradd --system --uid 1001 spring
COPY --from=build /workspace/product-service/target/product-service-*.jar app.jar
USER spring
# Sized for small instances (Render free tier is 512 MB).
ENV JAVA_TOOL_OPTIONS="-XX:MaxRAMPercentage=75 -XX:+UseSerialGC -Xss512k -XX:TieredStopAtLevel=1"
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "/app/app.jar"]
