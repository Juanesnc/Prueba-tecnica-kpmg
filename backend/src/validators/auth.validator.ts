import { z } from 'zod';

export const registerSchema = z
  .object({
    name: z.string().min(1, 'El nombre es obligatorio.'),
    email: z.string().email('El correo no es válido.'),
    password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres.'),
    passwordConfirm: z.string(),
  })
  .refine((data) => data.password === data.passwordConfirm, {
    message: 'Las contraseñas no coinciden.',
    path: ['passwordConfirm'],
  });

export const loginSchema = z.object({
  email: z.string().email('El correo no es válido.'),
  password: z.string().min(1, 'La contraseña es obligatoria.'),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
