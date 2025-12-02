import { z } from 'zod';

// Constantes para validación de archivos
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

export const profileSchema = z.object({
    // Campos requeridos
    nombre: z.string()
        .min(1, "El nombre es obligatorio.")
        .max(50, "El nombre es demasiado largo."),
    
    apellido: z.string()
        .min(1, "El apellido es obligatorio.")
        .max(50, "El apellido es demasiado largo."),

    // Campos opcionales
    segundo_nombre: z.string()
        .max(50, "El segundo nombre es demasiado largo.")
        .optional()
        .or(z.literal('')),

    telefono: z.string()
        .max(16, "El teléfono es demasiado largo.")
        .regex(/^\+?[0-9]*$/, "Formato de teléfono inválido.")
        .optional()
        .or(z.literal('')),

    year: z.number()
        .int("Debe ser un número entero.")
        .min(0, "El año no puede ser negativo.")
        .max(100, "El año debe ser menor a 100.")
        .optional(),

    habilidades: z.array(z.number().int().positive())
        .optional(),

    // Campos de solo lectura
    email: z.string().email().optional(),
    
    // Campo de imagen con validación mejorada
    media: z.union([
        z.string().url().optional(), // URL existente
        z.instanceof(FileList)
            .refine(
                (files) => files.length === 0 || files[0].size <= MAX_FILE_SIZE,
                'El archivo no debe superar 5MB.'
            )
            .refine(
                (files) => files.length === 0 || ACCEPTED_IMAGE_TYPES.includes(files[0].type),
                'Solo se aceptan imágenes JPG, PNG o WebP.'
            )
            .optional(),
        z.instanceof(File)
            .refine(
                (file) => file.size <= MAX_FILE_SIZE,
                'El archivo no debe superar 5MB.'
            )
            .refine(
                (file) => ACCEPTED_IMAGE_TYPES.includes(file.type),
                'Solo se aceptan imágenes JPG, PNG o WebP.'
            )
            .optional(),
    ]).optional(),
});