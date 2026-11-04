import mongoose from "mongoose";

export const connectDB = async () => {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    console.error("Falta configurar MONGODB_URI en el archivo .env");
    process.exit(1);
  }

  try {
    await mongoose.connect(uri);

    console.log("MongoDB conectado correctamente");
  } catch (error) {
    console.error("Error al conectar con MongoDB:", error);
    process.exit(1);
  }
};