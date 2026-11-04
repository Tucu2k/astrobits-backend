const port = Number(process.env.PORT || 3000);
const frontendUrl = process.env.FRONTEND_URL;

if (!Number.isInteger(port) || port < 1 || port > 65535) {
  throw new Error("La variable PORT debe ser un puerto válido");
}

if (!frontendUrl) {
  throw new Error("Falta configurar FRONTEND_URL en el archivo .env");
}

export const env = {
  port,
  frontendUrl
};
