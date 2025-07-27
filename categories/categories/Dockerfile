# Etapa 1: builder
FROM openjdk:17-jdk-alpine as builder

WORKDIR /app

# Copiamos Maven wrapper y pom para cache de dependencias
COPY ./pom.xml /app
COPY ./.mvn ./.mvn
COPY ./mvnw ./mvnw

# Limpiamos antes de nada (p.e. si hay target viejo)
RUN rm -rf target/

# Descargamos dependencias y compilamos skip-tests
RUN chmod +x mvnw && ./mvnw clean package -Dmaven.test.skip=true -Dmaven.main.skip=true -Dspring-boot.repackage.skip=true
COPY ./src ./src
RUN ./mvnw clean package -DskipTests

# Etapa 2: runtime
FROM openjdk:17-jdk-alpine

WORKDIR /app
RUN mkdir ./logs

COPY --from=builder /app/target/categories-0.0.1-SNAPSHOT.jar .

EXPOSE $PORT

ENTRYPOINT ["java", "-jar", "categories-0.0.1-SNAPSHOT.jar"]
