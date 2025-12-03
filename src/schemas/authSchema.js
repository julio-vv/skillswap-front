import { z } from 'zod';

// Constantes para validación
const MAX_NAME_LENGTH = 50;
const MIN_PASSWORD_LENGTH = 8;
const MAX_PASSWORD_LENGTH = 128;

// Zod Schema para el Registro
export const registerSchema = z.object({
    email: z.string()
        .min(1, "El email es obligatorio.")
        .email("El email debe ser un formato válido."),

    password1: z.string()
        .min(MIN_PASSWORD_LENGTH, `La contraseña debe tener al menos ${MIN_PASSWORD_LENGTH} caracteres.`)
        .max(MAX_PASSWORD_LENGTH, `La contraseña no debe exceder los ${MAX_PASSWORD_LENGTH} caracteres.`)
        .regex(/[A-Z]/, "La contraseña debe contener al menos una mayúscula.")
        .regex(/[a-z]/, "La contraseña debe contener al menos una minúscula.")
        .regex(/[0-9]/, "La contraseña debe contener al menos un número."),

    password2: z.string()
        .min(1, "Confirma tu contraseña."),

    nombre: z.string()
        .min(1, "El nombre es obligatorio.")
        .max(MAX_NAME_LENGTH, "El nombre es demasiado largo."),

    

    apellido: z.string()
        .min(1, "El apellido es obligatorio.")
        .max(MAX_NAME_LENGTH, "El apellido es demasiado largo."),

}).refine((data) => data.password1 === data.password2, {
    message: "Las contraseñas no coinciden.",
    path: ["password2"],
});

// Zod Schema para el Login
export const loginSchema = z.object({
    email: z.string()
        .min(1, "El email es obligatorio.")
        .email("El email debe ser un formato válido."),

    password: z.string()
        .min(1, "La contraseña es obligatoria."),
});