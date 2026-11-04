# AstroBits Backend 🚀

API REST para **AstroBits**, un e-commerce de hardware desarrollado con Node.js, Express, TypeScript y MongoDB.

## Tecnologías

- Node.js y Express 5
- TypeScript
- MongoDB Atlas y Mongoose
- Zod para validación de solicitudes
- JSON Web Tokens (JWT) para autenticación
- bcryptjs para hash de contraseñas
- CORS y dotenv

## Requisitos e instalación

1. Tener Node.js, npm y acceso a una base de datos MongoDB compatible con transacciones.
2. Clonar el repositorio:

   ```bash
   git clone https://github.com/Tucu2k/astrobits-backend.git
   cd astrobits-backend
   ```
3. Instalar dependencias:

   ```bash
   npm install
   ```
4. Crear un archivo `.env` en la raíz. **Nunca subirlo a GitHub.** Configurar las variables que usa el proyecto:

   ```dotenv
   PORT=3000
   FRONTEND_URL=http://localhost:5173
   JWT_SECRET=REEMPLAZAR_CON_UN_SECRETO_ALEATORIO_DE_32_CARACTERES_O_MAS
   # Agregar la variable de conexión a MongoDB con el nombre exacto usado en src/config/database.ts
   ```

   **Pendiente de verificar:** el nombre de la variable de MongoDB en `src/config/database.ts` antes de dar por definitiva esta sección.

5. Compilar e iniciar:

   ```bash
   npm run build
   npm start
   ```

   `npm run dev` ejecuta `tsc --watch`: recompila TypeScript, pero **no** inicia ni reinicia Express por sí solo.

## URLs

- API local: `http://localhost:3000`
- Estado: `GET /health`
- Frontend: https://github.com/Tucu2k/astrobits-frontend
- URL pública del backend: **pendiente de despliegue**

## Autenticación

Los endpoints protegidos necesitan el encabezado:

```http
Authorization: Bearer TU_TOKEN_JWT
```

El token se obtiene en `POST /api/auth/login` y expira en **1 hora**. La clave `JWT_SECRET` debe tener al menos **32 caracteres**.

### POST `/api/auth/register`

Registra un usuario. Campos requeridos: `name` (mínimo 2 caracteres), `email` (correo válido), `password` (mínimo 8 caracteres). No acepta campos extra.

```json
{"name":"Usuario AstroBits","email":"usuario@ejemplo.com","password":"Ejemplo123"}
```

- `201`: `{ "message": "Usuario registrado correctamente", "user": { "id": "...", "name": "...", "email": "...", "role": "..." } }`
- `409`: `{ "message": "Ya existe un usuario registrado con ese correo" }`

### POST `/api/auth/login`

Requiere `email` y `password` (no vacía).

```json
{"email":"usuario@ejemplo.com","password":"Ejemplo123"}
```

- `200`: devuelve `message`, `token` JWT y `user` (`id`, `name`, `email`, `role`).
- `401`: `{ "message": "Correo o contraseña incorrectos" }`

### GET `/api/auth/me` 🔒

Devuelve `{ "message": "Usuario autenticado correctamente", "user": ... }` con código `200` cuando el token es válido.

## Catálogo de productos

### Modelo de producto

| Campo | Tipo | Reglas de entrada |
|---|---|---|
| `id` | number | Mayor que cero; para compras debe ser entero positivo |
| `name` | string | No vacío |
| `price` | number | Mayor o igual a cero |
| `category` | string | No vacía |
| `stock` | number | Mayor o igual a cero |
| `image` | string | Opcional; no vacía si se envía |

Los esquemas de creación y actualización rechazan propiedades adicionales.

### GET `/api/products`

- `200`: arreglo JSON de productos.

### GET `/api/products/:id`

- `200`: objeto del producto.
- `404`: `{ "message": "Producto no encontrado" }`.

### POST `/api/products`

Crea un producto. **Actualmente no exige autenticación** (ver advertencia de seguridad).

```json
{"id":101,"name":"NVIDIA RTX 5070 Ti","price":800,"category":"GPU","stock":10,"image":"https://ejemplo.com/imagen.png"}
```

- `201`: producto creado.
- `409`: `{ "message": "Ya existe un producto con ese ID" }`.

### PUT `/api/products/:id`

Actualiza el producto completo. Exige `name`, `price`, `category`, `stock`; `image` es opcional. **Actualmente público**.

- `200`: producto actualizado.
- `404`: producto no encontrado.

### PATCH `/api/products/:id`

Actualiza campos individuales; por ejemplo:

```json
{"stock":7}
```

- `200`: producto actualizado.
- `400`: `{ "message": "Debes enviar al menos un campo para actualizar" }` si el objeto está vacío.
- `404`: producto no encontrado.

**Actualmente público**.

### DELETE `/api/products/:id`

- `200`: devuelve `message: "Producto eliminado correctamente"` y `product` eliminado.
- `404`: producto no encontrado.

**Actualmente público**.

## Compras e historial

### POST `/api/products/purchase` 🔒

Compra un producto:

```json
{"id":101,"quantity":2}
```

- `200`: `message`, `product` actualizado y `purchasedQuantity`.
- `404`: producto inexistente.
- `409`: `{ "message": "Stock insuficiente", "availableStock": ... }`.
- `401`: no autenticado.

### POST `/api/products/purchase-bulk` 🔒

Compra varios productos en una transacción de MongoDB:

```json
{"items":[{"id":101,"quantity":2},{"id":102,"quantity":1}]}
```

- `200`: `{ "message": "Compra procesada correctamente", "items": [...], "total": ... }`.
- `404`: un producto no existe.
- `409`: stock insuficiente o cambio concurrente del stock.
- `401`: no autenticado.

Los `id` y `quantity` deben ser enteros positivos; `items` debe contener al menos un elemento. Los productos repetidos se consolidan antes de descontar stock.

### GET `/api/purchases` 🔒

- `200`: arreglo de compras del usuario autenticado, ordenadas de más reciente a más antigua.
- `401`: no autenticado.

## Otras respuestas

- `GET /`: `200` con `{ "message": "API AstroBits Funcionando" }`.
- `GET /health`: `200` con `{ "status": "ok", "message": "API AstroBits disponible" }`.
- Ruta inexistente: `404` con `message` y `path`.
- Las respuestas exactas de errores de validación y de tokens inválidos dependen de los middlewares correspondientes.

## Seguridad y tareas antes de publicar

- **Importante:** las rutas `POST`, `PUT`, `PATCH` y `DELETE` de productos aún no tienen autorización administrativa. Deben protegerse antes del despliegue público.
- La compra individual descuenta stock y registra la compra en operaciones separadas; sería recomendable una transacción para evitar inconsistencias si falla el guardado.
- No publicar `.env`, cadenas de conexión ni `JWT_SECRET`.
- Configurar `FRONTEND_URL` con el dominio público de Vercel al desplegar.
- Verificar el formato de los errores de los middlewares para completar la documentación.

## Repositorios

- Backend: https://github.com/Tucu2k/astrobits-backend
- Frontend: https://github.com/Tucu2k/astrobits-frontend
