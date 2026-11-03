# Build from the backend/ directory so the parent pom is in the context:
#   docker build -f discovery-server/Dockerfile -t nutrination-discovery-server .
FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /workspace
COPY pom.xml .
COPY api-gateway/pom.xml api-gateway/
COPY customer-service/pom.xml customer-service/
COPY discovery-server/pom.xml discovery-server/
COPY order-service/pom.xml order-service/
COPY product-service/pom.xml product-service/
RUN mvn -B -q -pl discovery-server -am dependency:go-offline
COPY discovery-server/src discovery-server/src
RUN mvn -B -q -pl discovery-server -am package -DskipTests

FROM eclipse-temurin:21-jre
WORKDIR /app
RUN useradd --system --uid 1001 spring
COPY --from=build /workspace/discovery-server/target/discovery-server-*.jar app.jar
USER spring
# Sized for small instances (Render free tier is 512 MB).
ENV JAVA_TOOL_OPTIONS="-XX:MaxRAMPercentage=75 -XX:+UseSerialGC -Xss512k -XX:TieredStopAtLevel=1"
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "/app/app.jar"]
