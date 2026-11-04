import { Request, Response, NextFunction } from "express";
import { ZodType } from "zod";

export const validate = (schema: ZodType) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      const errors = result.error.issues.map((issue) => ({
        field: issue.path.join(".") || "body",
        message: issue.message
      }));

      return res.status(400).json({
        message: "Datos inválidos",
        errors
      });
    }

    req.body = result.data;
    next();
  };
};
