# Use JDK to build
FROM eclipse-temurin:21-jdk AS builder
WORKDIR /app

# Copy Maven wrapper & pom
COPY mvnw* pom.xml ./
COPY .mvn .mvn
RUN chmod +x mvnw
RUN ./mvnw dependency:go-offline -B

# Copy source and build
COPY src src
RUN ./mvnw clean package -DskipTests

# Run with smaller image
FROM eclipse-temurin:21-jre
WORKDIR /app
COPY --from=builder /app/target/*.jar app.jar

EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
