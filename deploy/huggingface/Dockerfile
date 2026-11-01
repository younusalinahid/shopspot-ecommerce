# Hugging Face Space (Docker) for the ShopSpot backend.
# The Space only holds this file and README.md: the code is downloaded from the public
# GitHub repo at build time, so "Factory rebuild" in the Space settings picks up new pushes.
# Secrets (database, JWT, Stripe, mail, API keys) go in Space Settings -> Variables and secrets.

# 1) Download the latest code from GitHub
FROM alpine:3.20 AS source
ARG REPO=younusalinahid/shopspot-ecommerce
ARG BRANCH=main
WORKDIR /src
ADD https://github.com/${REPO}/archive/refs/heads/${BRANCH}.tar.gz /tmp/source.tar.gz
RUN tar -xzf /tmp/source.tar.gz --strip-components=1

# 2) Build the Spring Boot jar
FROM maven:3.9-amazoncorretto-17 AS builder
WORKDIR /app
COPY --from=source /src/ecommerce-backend/pom.xml .
RUN mvn -q -B dependency:go-offline
COPY --from=source /src/ecommerce-backend/src ./src
RUN mvn -q -B clean package -DskipTests

# 3) Run it on the port Hugging Face expects (7860)
FROM amazoncorretto:17
WORKDIR /app
COPY --from=builder /app/target/ecommerce-backend-0.0.1-SNAPSHOT.jar app.jar
ENV JAVA_TOOL_OPTIONS="-XX:MaxRAMPercentage=70 -Duser.timezone=UTC"
EXPOSE 7860
ENTRYPOINT ["java", "-Dserver.port=7860", "-jar", "app.jar"]
