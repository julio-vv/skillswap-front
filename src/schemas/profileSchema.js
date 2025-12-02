// src/schemas/profileSchema.js

import { z } from 'zod';

export const profileSchema = z.object({
    // Campos requeridos por la API (PUT/PATCH)
    nombre: z.string().min(1, "El nombre es obligatorio."),
    apellido: z.string().min(1, "El apellido es obligatorio."),

    // Campos opcionales que ahora maneja el formulario
    segundo_nombre: z.string().optional(),

    // Validación para el teléfono (se puede dejar opcional)
    telefono: z.string()
        .max(16, "El teléfono es demasiado largo.")
        .regex(/^\+?[0-9]*$/, "Formato de teléfono inválido.") // Acepta + y números
        .optional(),

    // Campo 'year'
    year: z.number().min(0, "El año no puede ser negativo."),

    // Campo de Habilidades (asumiendo que es una cadena de texto para el formulario)
    habilidades: z.array(z.number().int()).optional(),

    // Campos solo para lectura que aún deben inicializarse en el formulario (ej. para el reset)
    email: z.string().email().optional(),
    media: z.any().optional(), // Para la subida de archivos
});