# Base Image
FROM eclipse-temurin:17-jdk-alpine

# Workdir
WORKDIR /app

# Copy JAR (Assume Maven build runs outside or multistage)
COPY edtech-web/target/*.jar app.jar

# Expose Port
EXPOSE 8080

# Entrypoint
ENTRYPOINT ["java", "-jar", "app.jar"]
