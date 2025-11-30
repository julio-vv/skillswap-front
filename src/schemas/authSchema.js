import { z } from 'zod';

// Zod Schema para el Registro
export const registerSchema = z.object({
    // Campos requeridos por la API.pdf: email, password, password2, nombre, apellido
    
    email: z.string().email({ message: "El email debe ser un formato válido." }),
    
    password1: z.string()
        .min(8, { message: "La contraseña debe tener al menos 8 caracteres." })
        .max(128, { message: "La contraseña no debe exceder los 128 caracteres." }), // DRF default max length
        
    password2: z.string(), // Necesario para la comparación
    
    nombre: z.string().min(1, { message: "El nombre es obligatorio." }),
    
    // El segundo nombre es opcional en la API, por lo que lo hacemos opcional en Zod
    segundo_nombre: z.string().optional().or(z.literal('')),
    
    apellido: z.string().min(1, { message: "El apellido es obligatorio." }),

}).refine((data) => data.password1 === data.password2, {
    message: "Las contraseñas no coinciden.",
    path: ["password2"], // Asigna el error al campo password2
});