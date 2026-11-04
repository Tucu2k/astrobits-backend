
import { z } from "zod";

export const registerUserSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, "El nombre debe tener al menos 2 caracteres"),

    email: z
      .string()
      .trim()
      .email("El correo electrónico no es válido")
      .transform((email) => email.toLowerCase()),

    password: z
      .string()
      .min(8, "La contraseña debe tener al menos 8 caracteres")
  })
  .strict();

export const loginUserSchema = z
  .object({
    email: z
      .string()
      .trim()
      .email("El correo electrónico no es válido")
      .transform((email) => email.toLowerCase()),

    password: z
      .string()
      .min(1, "La contraseña es obligatoria")
  })
  .strict();
