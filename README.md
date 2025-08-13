# README.md

## Sistema de Gestión de Productos y Categorías

Este repositorio contiene una solución con:

* Frontend Angular servido con Nginx (imagen `mateoja54/app-frontend:v2`).
* Microservicios Spring Boot (Java 17): `categories` y `products` (imágenes `mateoja54/app-categories:v2` y `mateoja54/app-products:v3`).
* Base de datos MySQL 8.0 con persistencia Docker Volume.
* Orquestación mediante Docker Compose.

> Estas instrucciones explican cómo clonar el proyecto y desplegarlo en **otro servidor Linux** (por ejemplo, una Droplet en DigitalOcean / VPS en AWS EC2 / Render que soporte Docker). Están basadas en la configuración y pasos que usamos durante el despliegue.

---

## Requisitos previos (en tu máquina local)

* Cuenta en Docker Hub (opcional pero recomendado) para subir imágenes: [https://hub.docker.com](https://hub.docker.com)
* Git instalado (para clonar el repositorio)
* Docker Desktop en Windows o `docker` y `docker compose` (CLI/plugin) en Linux/macOS si vas a construir imágenes localmente.
* \[Opcional] Maven y JDK 17 si vas a compilar los servicios en tu máquina.

---

## Estructura del repositorio (ejemplo)

```
repo-root/
  ├─ frontend/              # código Angular + Dockerfile + nginx.conf
  ├─ products/              # microservicio products (Spring Boot) + Dockerfile
  ├─ categories/            # microservicio categories (Spring Boot) + Dockerfile
  └─ docker-compose.yml     # orquestador que usamos para desplegar todo
```

---

## Paso 1 — Clonar el repo en el servidor

En el servidor Linux (ej. Ubuntu 22.04):

```bash
# loguearte en el servidor por SSH
ssh root@IP_DEL_SERVIDOR
# instalar git si no está
sudo apt update && sudo apt install -y git
# clonar el repositorio (reemplaza la URL por la de tu repo)
git clone https://github.com/TU_USUARIO/tu-repo.git /opt/myapp
cd /opt/myapp
```

> Alternativa: si no quieres usar git, puedes subir los archivos via `scp` o WinSCP.

---

## Paso 2 — (Opcional) Construir imágenes localmente y subir a Docker Hub

Si vas a construir imágenes en tu PC y luego subirlas a Docker Hub (evita compilar en el servidor):

1. En tu PC local, construir y etiquetar las imágenes:

```bash
# categories
cd categories
mvn -B -DskipTests package
docker build -t TU_DOCKERHUB_USER/app-categories:v2 .

# products
cd ../products
mvn -B -DskipTests package
docker build -t TU_DOCKERHUB_USER/app-products:v3 .

# frontend
cd ../frontend
npm install
npm run build -- --configuration production
docker build -t TU_DOCKERHUB_USER/app-frontend:v2 .
```

2. Loguear en Docker Hub y subir las imágenes:

```bash
docker login
docker push TU_DOCKERHUB_USER/app-categories:v2
docker push TU_DOCKERHUB_USER/app-products:v3
docker push TU_DOCKERHUB_USER/app-frontend:v2
```

> Si prefieres construir directamente en el servidor (evita push), salta al Paso 3 y ejecuta `docker compose build` en el servidor.

---

## Paso 3 — Preparar Docker y Docker Compose en el servidor

Instala Docker y el plugin Compose (si no están):

```bash
# en Ubuntu (ejemplo)
sudo apt update
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh
sudo apt-get install -y docker-compose-plugin
# opcional: añadir tu usuario al grupo docker
sudo usermod -aG docker $USER
```

Cierra y vuelve a abrir la sesión SSH si añadiste el usuario a `docker`.

---

## Paso 4 — Crear o subir `docker-compose.yml` al servidor

El `docker-compose.yml` debe incluir las imágenes (las nuestras o las tuyas). Ejemplo mínimo (ajusta según necesites):

```yaml
services:
  db:
    image: mysql:8.0
    environment:
      MYSQL_ROOT_PASSWORD: admin123
      MYSQL_DATABASE: test
      MYSQL_USER: appuser
      MYSQL_PASSWORD: appuserpass
    volumes:
      - db_data:/var/lib/mysql
    restart: unless-stopped

  app-categories:
    image: TU_DOCKERHUB_USER/app-categories:v2
    environment:
      PORT: 8082
      DB_HOST: db
      DB_PORT: 3306
      DB_DATABASE: test
      DB_USER: appuser
      DB_PASSWORD: appuserpass
    depends_on:
      - db
    restart: unless-stopped

  app-products:
    image: TU_DOCKERHUB_USER/app-products:v3
    environment:
      PORT: 8083
      DB_HOST: db
      DB_PORT: 3306
      DB_DATABASE: test
      DB_USER: appuser
      DB_PASSWORD: appuserpass
    depends_on:
      - db
    restart: unless-stopped

  frontend:
    image: TU_DOCKERHUB_USER/app-frontend:v2
    ports:
      - "80:80"
    depends_on:
      - app-categories
      - app-products
    restart: unless-stopped

volumes:
  db_data:
```

Guarda este `docker-compose.yml` en el servidor (por ejemplo en `/opt/myapp/docker-compose.yml`).

---

## Paso 5 — Levantar la aplicación (tirar imágenes y crear contenedores)

En el servidor:

```bash
cd /opt/myapp
# si las imágenes están en Docker Hub (públicas):
docker compose pull
# levantar todo
docker compose up -d

# comprobar estado
docker compose ps
```

Si construyes en el servidor (teniendo `build:` en el YAML o ejecutando `docker build`), usa:

```bash
docker compose build
docker compose up -d
```

---

## Paso 6 — Comprobaciones básicas y pruebas

En el servidor, verifica los logs y endpoints:

```bash
# ver contenedores
docker compose ps

# ver logs
docker compose logs -f frontend
docker compose logs --tail 200 app-products
```

Probar desde el servidor (evita firewall):

```bash
curl -I http://localhost/
curl -v http://localhost/api/categories
curl -v http://localhost/api/products
```

Probar desde tu PC (reemplaza `IP_DEL_SERVIDOR`):

```bash
curl -I http://IP_DEL_SERVIDOR/
curl -v http://IP_DEL_SERVIDOR/api/categories
curl -v http://IP_DEL_SERVIDOR/api/products
```

---

## Paso 7 — Cambios en la base de datos (si hiciste `categoryId` opcional)

Si modificaste el código para permitir productos sin `categoryId`, asegúrate de que la columna `category_id` en MySQL acepte NULL:

```bash
docker exec -it <db_container_name> mysql -uappuser -pappuserpass -e "USE test; ALTER TABLE products MODIFY COLUMN category_id BIGINT NULL;"
```

Verifica esquema:

```bash
docker exec -it <db_container_name> mysql -uappuser -pappuserpass -e "USE test; DESCRIBE products;"
```

---

## Paso 8 — Subir datos de prueba (opcional)

Crear una categoría y un producto vía API (ejemplos):

```bash
# crear categoría
curl -s -X POST http://localhost/api/categories -H "Content-Type: application/json" -d '{"name":"Licores","description":"Bebidas"}'

# crear producto sin categoryId
curl -s -X POST http://localhost/api/products -H "Content-Type: application/json" -d '{"name":"Prueba","description":"desc","price":1.23}'

# crear producto con categoryId
curl -s -X POST http://localhost/api/products -H "Content-Type: application/json" -d '{"name":"Ron","description":"desc","price":12.5,"categoryId":3}'
```

---

## Paso 9 — Debugging y errores comunes

* `500 Internal Server Error` al POST /api/products: revisa `docker compose logs --tail 200 app-products`. Busca `Caused by:` y validation errors. Cambia excepciones a `ResponseStatusException(HttpStatus.BAD_REQUEST, ...)` para mejor control.
* `Connection refused` a puertos 8082/8083: esos puertos **no están** mapeados al host por defecto (solo nginx/ frontend hace proxy). Si quieres exponerlos, añade `ports: - "8082:8082"` y `- "8083:8083"` en `docker-compose.yml`.
* `high CPU / OOM`: usa swap o aumenta la memoria del servidor; reduce tamaño del pool Hikari (`spring.datasource.hikari.maximum-pool-size`).

---

## Paso 10 — Seguridad y recomendaciones finales

* No uses contraseña root en producción tal cual (este proyecto es de ejemplo). Usa variables de entorno seguras, secretos o un vault.
* Configura un firewall que permita solo puertos necesarios (80/443) y SSH 22.
* Usa HTTPS para el frontend (terminación TLS en un proxy como Traefik o configurar certbot/nginx si expones frontend directo).
* Agrega healthchecks en `docker-compose.yml` para DB y microservicios.
* Considera usar CI/CD para build/push de imágenes y despliegue (GitHub Actions, GitLab CI, etc.).

---
