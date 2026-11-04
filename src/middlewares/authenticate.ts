
import type { Request, Response, NextFunction } from "express";
import jwt, { type JwtPayload } from "jsonwebtoken";

export interface AuthenticatedUser {
  userId: string;
  role: "user" | "admin";
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}

export const authenticate = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authorization = req.headers.authorization;

    if (!authorization || !authorization.startsWith("Bearer ")) {
      return res.status(401).json({
        message: "Se requiere un token de autenticación"
      });
    }

    const token = authorization.slice(7);
    const secret = process.env.JWT_SECRET;

    if (!secret || secret.length < 32) {
      return res.status(500).json({
        message: "La configuración de autenticación no es válida"
      });
    }

    const decoded = jwt.verify(token, secret);

    if (
      typeof decoded === "string" ||
      !("userId" in decoded) ||
      !("role" in decoded) ||
      typeof decoded.userId !== "string" ||
      !["user", "admin"].includes(decoded.role as string)
    ) {
      return res.status(401).json({
        message: "El token no contiene datos de usuario válidos"
      });
    }

    req.user = {
      userId: decoded.userId,
      role: decoded.role as AuthenticatedUser["role"]
    };

    return next();
  } catch (error) {
    if (
      error instanceof jwt.JsonWebTokenError ||
      error instanceof jwt.TokenExpiredError
    ) {
      return res.status(401).json({
        message: "El token es inválido o ha expirado"
      });
    }

    return next(error);
  }
};
