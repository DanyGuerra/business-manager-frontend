# RestHub - Gestión de Restaurantes

RestHub es una plataforma integral diseñada para la administración eficiente de restaurantes. Permite gestionar pedidos en tiempo real, administrar menús dinámicos, controlar inventario y definir roles de equipo, todo desde una interfaz moderna y responsiva.

## 🚀 Características Principales

- **Gestión de Pedidos en Tiempo Real**: Tablero Kanban para visualizar y mover pedidos entre estados (Pendiente, En Preparación, Listo, Completado).
- **Tipos de Consumo**: Soporte para "Comer aquí" (con número de mesa), "Para llevar" y "Domicilio".
- **Administración de Menús**: Creación y edición de productos, grupos de opciones y variantes.
- **Gestión de Negocios**: Soporte multi-negocio, permitiendo administrar varias sucursales o marcas.
- **Roles y Permisos**: Control de acceso granular para usuarios (Dueño, Admin, etc.).
- **Interfaz Moderna**: Diseño limpio y responsivo con soporte para modo oscuro.

## 🛠️ Tecnologías

Este proyecto está construido con un stack moderno y eficiente:

- **Framework**: [Next.js 15](https://nextjs.org/) (App Router)
- **UI Library**: [React 19](https://react.dev/)
- **Estilos**: [Tailwind CSS 4](https://tailwindcss.com/)
- **Componentes**: [Shadcn UI](https://ui.shadcn.com/) (Radix primitives)
- **Estado Global**: [Zustand](https://github.com/pmndrs/zustand)
- **Formularios**: [React Hook Form](https://react-hook-form.com/) + [Zod](https://zod.dev/)
- **HTTP Client**: [Axios](https://axios-http.com/)
- **Fechas**: [date-fns](https://date-fns.org/)
- **Drag & Drop**: [dnd-kit](https://dndkit.com/)

## 🏁 Comenzar

### Prerrequisitos

- Node.js (v18 o superior recomendado)
- npm, yarn, pnpm o bun

### Instalación

1.  Clona el repositorio:

    ```bash
    git clone https://github.com/tu-usuario/business-manager-frontend.git
    cd business-manager-frontend
    ```

2.  Instala las dependencias:
    ```bash
    npm install
    # o
    yarn install
    # o
    pnpm install
    ```

### Ejecutar en Desarrollo

Inicia el servidor de desarrollo:

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador para ver la aplicación.

## 📦 Scripts Disponibles

- `npm run dev`: Inicia el entorno de desarrollo con Turbopack.
- `npm run build`: Compila la aplicación para producción.
- `npm run start`: Inicia el servidor de producción.
- `npm run lint`: Ejecuta el linter para mantener la calidad del código.

## 🔐 Autenticación y Seguridad

El sistema maneja autenticación de usuarios y protección de rutas basada en roles. Asegúrate de configurar las variables de entorno necesarias para la conexión con el backend.

## ⚙️ Configuración (Variables de Entorno)

Crea un archivo `.env.local` en la raíz del proyecto y agrega las siguientes variables:

```bash
API_BUSINESS_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:3000
API_KEY=your_secret_api_key
```

## 🤝 Contribución

Las contribuciones son bienvenidas. Por favor, abre un issue o envía un pull request para mejoras y correcciones.
