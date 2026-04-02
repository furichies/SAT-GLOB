import { UserRole } from '@prisma/client'

export interface User {
  id: string
  email: string
  nombre: string
  apellidos?: string | null
  telefono?: string | null
  direccion?: string | null
  codigoPostal?: string | null
  ciudad?: string | null
  provincia?: string | null
  rol: UserRole
  activo: boolean
  fechaRegistro: Date
  ultimoAcceso?: Date | null
}

export interface AuthResponse {
  user: Omit<User, 'passwordHash'>
  token?: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  email: string
  password: string
  nombre: string
  apellidos?: string
  telefono?: string
  direccion?: string
  codigoPostal?: string
  ciudad?: string
  provincia?: string
}

export interface UpdateProfileRequest {
  nombre?: string
  apellidos?: string
  telefono?: string
  direccion?: string
  codigoPostal?: string
  ciudad?: string
  provincia?: string
}

export interface ChangePasswordRequest {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

export interface AuthSession {
  user: Omit<User, 'passwordHash'>
  expires: string
}
