
import "dotenv/config";
import express from "express";
import cors from "cors";
import dns from "dns";

import productRouter from "./routes/product.routes";
import authRouter from "./routes/auth.routes";
import { authenticate } from "./middlewares/authenticate";
import { connectDB } from "./config/database";
import { errorHandler } from "./middlewares/errorHandler";
import { env } from "./config/env";

// Configuración DNS para la conexión con MongoDB Atlas
dns.setServers(["8.8.8.8", "1.1.1.1"]);

const app = express();
const PORT = env.port;

// Middlewares generales
app.use(
  cors({
    origin: env.frontendUrl
  })
);

app.use(express.json());

// Rutas de la API
app.use("/api", productRouter);
app.use("/api/auth", authRouter);

// Ruta protegida: devuelve los datos del usuario autenticado
app.get("/api/auth/me", authenticate, (req, res) => {
  return res.status(200).json({
    message: "Usuario autenticado correctamente",
    user: req.user
  });
});

// Ruta principal
app.get("/", (req, res) => {
  return res.status(200).json({
    message: "API AstroBits Funcionando"
  });
});

// Comprobación del estado del servidor
app.get("/health", (req, res) => {
  return res.status(200).json({
    status: "ok",
    message: "API AstroBits disponible"
  });
});

// Ruta no encontrada
app.use((req, res) => {
  return res.status(404).json({
    message: "Ruta no encontrada",
    path: req.originalUrl
  });
});

// Manejo centralizado de errores
app.use(errorHandler);

// Inicio del servidor
const startServer = async () => {
  try {
    await connectDB();

    app.listen(PORT, () => {
      console.log(`Servidor ejecutándose en http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("No se pudo iniciar el servidor:", error);
    process.exit(1);
  }
};

startServer();
