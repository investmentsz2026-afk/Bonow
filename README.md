# WYNNI - Club Digital de Descuentos (SaaS)

Plataforma moderna de beneficios y cupones exclusivos para el mercado mexicano.

---

## 📁 Estructura del Proyecto

El proyecto está organizado en una arquitectura modular limpia para frontend y backend:

```text
WYNNI/
├── docker-compose.yml     # Servicios locales: PostgreSQL 15, Redis 7
├── README.md              # Documentación técnica general
├── backend/               # Servidor API REST (NestJS + TypeScript)
│   ├── src/
│   │   ├── prisma/        # Módulo y servicio global de base de datos
│   │   ├── health/        # Endpoint de salud y diagnóstico
│   │   ├── main.ts        # Punto de entrada
│   │   └── app.module.ts  # Módulo raíz
│   ├── prisma/
│   │   └── schema.prisma  # Modelado de datos
│   └── package.json
└── frontend/              # Interfaz de usuario (Next.js + Tailwind + TS)
    ├── src/
    │   ├── app/           # Rutas y páginas (App Router)
    │   └── components/
    │       └── layout/    # Componentes del layout (Header, Sidebar)
    └── package.json
```

---

## 🚀 Requisitos Previos

1. **Node.js** (v18 o superior recomendado)
2. **Docker y Docker Compose** (para base de datos local)
3. **Git**

---

## 🛠️ Instrucciones de Inicialización y Ejecución

### 1. Levantar la Infraestructura (Docker)

Para iniciar PostgreSQL y Redis localmente, ejecuta en la raíz del proyecto:

```bash
docker compose up -d
```

### 2. Configurar y Ejecutar el Backend (NestJS)

1. Dirígete a la carpeta `backend`:
   ```bash
   cd backend
   ```
2. Instala las dependencias:
   ```bash
   npm install
   ```
3. Genera el cliente de Prisma:
   ```bash
   npx prisma generate
   ```
4. Aplica las migraciones a la base de datos (con Docker corriendo):
   ```bash
   npx prisma migrate dev --name init
   ```
5. Inicia el servidor de desarrollo en http://localhost:3001:
   ```bash
   npm run start:dev
   ```

### 3. Configurar y Ejecutar el Frontend (Next.js)

1. Dirígete a la carpeta `frontend`:
   ```bash
   cd ../frontend
   ```
2. Instala las dependencias:
   ```bash
   npm install
   ```
3. Inicia el servidor de desarrollo en http://localhost:3000:
   ```bash
   npm run dev
   ```

---

## 🔍 Puertos y Endpoints Técnicos

- **Frontend App**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **API Health Check**: http://localhost:3001/health (Valida estado del servidor y conexión a PostgreSQL).
