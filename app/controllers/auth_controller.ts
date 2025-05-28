import type { HttpContext } from '@adonisjs/core/http'
import Usuario from '#models/usuarios'
import hash from '@adonisjs/core/services/hash'

export default class AuthController {
  public async login({ request, response }: HttpContext) {
    const { correo, password } = request.only(['correo', 'password'])

    try {
      const user = await Usuario.query().where('correo', correo).first()
      if (!user) {
        return response.unauthorized({ message: 'Correo o contraseña inválidos' })
      }
      const cleanPassword = typeof password === 'string' ? password.trim() : ''
      const isPasswordValid = await hash.verify(user.password, cleanPassword)
      if (!isPasswordValid) {
        return response.unauthorized({ message: 'Correo o contraseña inválidos' })
      }
      const token = await Usuario.accessTokens.create(user)
      return {
        type: 'bearer',
        token: token,
        user: {
          id: user.id,
          correo: user.correo,
          nombre: user.nombre,
        },
      }
    } catch (error) {
      return response.internalServerError({ message: 'Error interno del servidor' })
    }
  }
}
