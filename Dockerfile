# FROM maven:3.9.9-eclipse-temurin-21 AS build
# WORKDIR /app
# COPY pom.xml .
# COPY src ./src
# RUN mvn -B -DskipTests package

# FROM eclipse-temurin:21-jre
# WORKDIR /app
# COPY --from=build /app/target/*.jar app.jar
# EXPOSE 9090
# ENTRYPOINT ["java", "-jar", "/app/app.jar"]

# =========================
# Build stage
# =========================
FROM maven:3.9.11-eclipse-temurin-21 AS build

WORKDIR /app

COPY pom.xml .

# Download dependencies first
RUN mvn -B dependency:go-offline

COPY src ./src

# Build Spring Boot application
RUN mvn -B -DskipTests package


# =========================
# Runtime stage
# =========================
FROM eclipse-temurin:21-jre

WORKDIR /app

COPY --from=build /app/target/*.jar app.jar

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]