# build stage
FROM maven:3.8.4-openjdk-17 AS build
WORKDIR /app
COPY pom.xml mvnw ./
COPY .mvn .mvn
COPY src ./src
# empaqueta sin tests (rápido)
RUN mvn -B -DskipTests package

# runtime stage
FROM openjdk:17-jdk-slim
WORKDIR /app
# copia el JAR generado (wildcard para evitar nombre fijo)
COPY --from=build /app/target/*.jar app.jar

# puerto que la app usará por defecto
ENV PORT=8082
EXPOSE 8082

ENTRYPOINT ["sh", "-c", "java -jar /app/app.jar"]
