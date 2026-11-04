
import { Request, Response, NextFunction } from "express";

export const validateProductId = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const id = Number(req.params.id);

  if (!Number.isSafeInteger(id) || id <= 0) {
    return res.status(400).json({
      message: "El ID debe ser un número entero positivo"
    });
  }

  next();
};

export default validateProductId;