
import { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";

export const errorHandler = (
  error: unknown,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (res.headersSent) {
    return next(error);
  }

  console.error("Error en la API:", error);

  // Error de validación de Mongoose
  if (error instanceof mongoose.Error.ValidationError) {
    return res.status(400).json({
      message: "Los datos del producto no son válidos"
    });
  }

  // Error por un ID de MongoDB con formato inválido
  if (error instanceof mongoose.Error.CastError) {
    return res.status(400).json({
      message: "El identificador tiene un formato inválido"
    });
  }

  // Cualquier otro error inesperado
  return res.status(500).json({
    message: "Error interno del servidor"
  });
};
