## Levantar la base de datos y la API con Docker

1. Crea la red Docker donde se comunicarán los contenedores:

   ```bash
   docker network create test-network

2. Iniciar el contenedor en MYSQL
docker run -d --name test-db --network test-network -e MYSQL_ROOT_PASSWORD=admin123 -e MYSQL_DATABASE=test -p 3306:3306 mysql:8.0

3. Iniciar Api
docker run -dit -p 8082:8082 --name c-app-categories --network test-network -e DB_HOST=test-db:3306 -e PORT=8082 mateoja54/categories:v2