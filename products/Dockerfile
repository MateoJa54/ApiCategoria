FROM maven:3.8.4-openjdk-17 AS build
WORKDIR /app
COPY pom.xml mvnw ./
COPY .mvn .mvn
COPY src ./src
RUN mvn -B -DskipTests package

FROM openjdk:17-jdk-slim
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar

ENV PORT=8083
EXPOSE 8083

ENTRYPOINT ["sh", "-c", "java -jar /app/app.jar"]
