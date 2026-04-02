import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres')
})

export const registerSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string()
    .min(8, 'La contraseña debe tener al menos 8 caracteres')
    .regex(/[A-Z]/, 'La contraseña debe contener al menos una mayúscula')
    .regex(/[a-z]/, 'La contraseña debe contener al menos una minúscula')
    .regex(/[0-9]/, 'La contraseña debe contener al menos un número'),
  passwordConfirm: z.string(),
  nombre: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  apellidos: z.string().optional(),
  telefono: z.string()
    .regex(/^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/, 'Teléfono inválido')
    .or(z.literal(''))
    .optional(),
  direccion: z.string().optional(),
  codigoPostal: z.string().regex(/^\d{4,5}$/, 'Código postal inválido')
    .or(z.literal(''))
    .optional(),
  ciudad: z.string().optional(),
  provincia: z.string().optional()
}).refine((data) => data.password === data.passwordConfirm, {
  message: 'Las contraseñas no coinciden',
  path: ['passwordConfirm']
})

export const updateProfileSchema = z.object({
  nombre: z.string().min(2, 'El nombre debe tener al menos 2 caracteres').optional(),
  apellidos: z.string().optional(),
  telefono: z.string()
    .regex(/^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/, 'Teléfono inválido')
    .or(z.literal(''))
    .optional(),
  direccion: z.string().optional(),
  codigoPostal: z.string().regex(/^\d{4,5}$/, 'Código postal inválido')
    .or(z.literal(''))
    .optional(),
  ciudad: z.string().optional(),
  provincia: z.string().optional()
})

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'La contraseña actual es requerida'),
  newPassword: z.string()
    .min(8, 'La contraseña debe tener al menos 8 caracteres')
    .regex(/[A-Z]/, 'La contraseña debe contener al menos una mayúscula')
    .regex(/[a-z]/, 'La contraseña debe contener al menos una minúscula')
    .regex(/[0-9]/, 'La contraseña debe contener al menos un número'),
  confirmPassword: z.string()
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'Las contraseñas no coinciden',
  path: ['confirmPassword']
})

export const forgotPasswordSchema = z.object({
  email: z.string().email('Email inválido')
})

export const resetPasswordSchema = z.object({
  token: z.string(),
  password: z.string()
    .min(8, 'La contraseña debe tener al menos 8 caracteres')
    .regex(/[A-Z]/, 'La contraseña debe contener al menos una mayúscula')
    .regex(/[a-z]/, 'La contraseña debe contener al menos una minúscula')
    .regex(/[0-9]/, 'La contraseña debe contener al menos un número'),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Las contraseñas no coinciden',
  path: ['confirmPassword']
})
