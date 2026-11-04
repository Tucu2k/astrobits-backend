
import type {
  Request,
  Response,
  NextFunction
} from "express";

export const requireAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        message: "Debes iniciar sesión"
      });
    }

    if (req.user.role !== "admin") {
      return res.status(403).json({
        message: "No tienes permisos de administrador"
      });
    }

    return next();
  } catch (error) {
    return next(error);
  }
};
