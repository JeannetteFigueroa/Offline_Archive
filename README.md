# (OFF)LINE ARCHIVE — E-Commerce Fullstack

Proyecto desarrollado para la asignatura **DSY1104 - Desarrollo Fullstack II (Duoc UC)**.  
Tienda online de vestuario y accesorios con frontend SPA en **React 19 + Vite** y backend API REST en **Spring Boot 3 + PostgreSQL**, con seguridad basada en **JWT (Access & Refresh Tokens)** y documentación interactiva en **Swagger UI**.

---

## 1. REQUISITOS DEL SISTEMA

Para ejecutar este proyecto en un entorno local se requiere:

- **Node.js:** v18.x o superior (v20+ recomendado).
- **Java Development Kit (JDK):** Java 25 LTS.
- **PostgreSQL:** v18 (con pgAdmin 4).
- **Gestor de dependencias:** Maven 3.9+ (o utilizar el wrapper `./mvnw` incluido en `backend/`).
- **Navegador web moderno:** Google Chrome, Brave, Firefox o Edge.

---

## 2. ESTRUCTURA DEL PROYECTO

El repositorio utiliza una arquitectura de monorepo desacoplado:

```
Offline_Archive/
│
├── frontend/             # SPA React + Vite + Bootstrap
│   ├── src/              # Código fuente (componentes, páginas, utils, estilos)
│   ├── public/           # Recursos estáticos
│   ├── package.json      # Dependencias frontend y scripts
│   └── vite.config.js    # Configuración de compilación Vite
│
├── backend/              # API REST Spring Boot 3
│   ├── src/
│   │   ├── main/java/    # Código modular por capas (cl.offlinearchive)
│   │   ├── main/resources/ # Configuración (application.yml) y Flyway
│   │   └── test/         # Pruebas automatizadas (JUnit 5 + Mockito)
│   ├── pom.xml           # Configuración de Maven y dependencias
│   ├── mvnw / mvnw.cmd   # Maven Wrapper
│   └── .mvn/
│
├── docs/                 # Documentación técnica y de entrega
│   ├── EVALUACION.md     # Requisitos académicos y rúbrica
│   ├── MER.md            # Diccionario de datos y diagrama relacional
│   ├── PLAN_IMPLEMENTACION.md # Arquitectura, seguridad y fases
│   └── AVANCE_BACKEND.md # Registro de continuidad y memoria
│
├── README.md             # Guía general de instalación y uso
└── .gitignore            # Exclusiones de Git
```

---

## 3. INSTALACIÓN Y CONFIGURACIÓN DE POSTGRESQL

1. **Descarga e instalación:**
   - Descarga el instalador oficial de PostgreSQL (v18) para Windows desde [postgresql.org](https://www.postgresql.org/download/windows/).
   - Durante la instalación, marca:
     - PostgreSQL Server
     - pgAdmin 4
     - Command Line Tools
   - Define el puerto por defecto: `5432`.
   - Asigna una contraseña segura para el superusuario `postgres` (ejemplo para desarrollo local: `postgres`).

2. **Crear la base de datos:**
   - Abre **pgAdmin 4** o la terminal **SQL Shell (psql)**.
   - Ejecuta:
     ```sql
     CREATE DATABASE offline_archive;
     ```

3. **(Opcional recomendado) Crear usuario de aplicación:**
   ```sql
   CREATE USER offline_user WITH PASSWORD 'offline_pass';
   GRANT ALL PRIVILEGES ON DATABASE offline_archive TO offline_user;
   \c offline_archive
   GRANT ALL ON SCHEMA public TO offline_user;
   ```

---

## 4. EJECUCIÓN DEL BACKEND (SPRING BOOT)

1. Abre una terminal y navega al directorio del backend:
   ```powershell
   cd backend
   ```

2. Configura las variables de entorno si tus credenciales de PostgreSQL son distintas a las por defecto (`postgres`/`postgres`):
   ```powershell
   $env:DB_USER="postgres"
   $env:DB_PASSWORD="tu_password_aqui"
   $env:DB_NAME="offline_archive"
   ```

3. Compila y ejecuta la aplicación utilizando el Maven Wrapper:
   ```powershell
   .\mvnw.cmd spring-boot:run
   ```
   *(En Linux / Mac: `./mvnw spring-boot:run`)*

4. **Verificación:**
   - Flyway ejecutará automáticamente las migraciones (`V1__init_schema.sql` y `V2__seed_master_data.sql`), creando las 14 tablas del MER e insertando los datos iniciales.
   - Swagger UI estará disponible en: [http://localhost:8080/api/swagger-ui.html](http://localhost:8080/api/swagger-ui.html)
   - Especificación OpenAPI JSON en: [http://localhost:8080/api/v3/api-docs](http://localhost:8080/api/v3/api-docs)

---

## 5. EJECUCIÓN DEL FRONTEND (REACT + VITE)

1. Abre otra terminal y navega al directorio del frontend:
   ```powershell
   cd frontend
   ```

2. Instala las dependencias (si es la primera vez o se clona el proyecto):
   ```powershell
   npm install
   ```

3. Inicia el servidor de desarrollo:
   ```powershell
   npm run dev
   ```

4. Abre tu navegador en la URL indicada por Vite (normalmente [http://localhost:5173](http://localhost:5173)).

---

## 6. EJECUCIÓN DE PRUEBAS AUTOMATIZADAS

### Pruebas de Frontend (Vitest)
```powershell
cd frontend
npm test
```
*Ejecuta los 11 archivos de prueba con 58 tests unitarios sobre componentes, precios, autenticación y panel de administración.*

### Pruebas de Backend (JUnit 5 + Mockito)
```powershell
cd backend
.\mvnw.cmd test
```

---

## 7. CREDENCIALES DE DEMOSTRACIÓN (DESARROLLO)

- **Administrador:**
  - Correo: `admin@gmail.com`
  - Contraseña: `Admin123`
  - Rol: `ADMIN` (acceso a `/admin`)

---

## 8. AUTORES Y CURSO
- **Asignatura:** DSY1104 - Desarrollo Fullstack II
- **Institución:** Duoc UC
- **Evaluación:** Evaluación Parcial N° 3
- **Integrantes:** Misael Rojas y Jeannette Figueroa
