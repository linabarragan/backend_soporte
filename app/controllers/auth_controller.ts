import type { HttpContext } from '@adonisjs/core/http'
import User from '#models/usuarios'

export default class AuthController {
  async login({ request, response }: HttpContext) {
    try {
      const { correo, password } = request.only(['correo', 'password'])

      const user = await User.verifyCredentials(correo, password)
      const token = await User.accessTokens.create(user)

      return response.ok({
        message: 'Inicio de sesión exitoso',
        user,
        token: token.toJSON(),
      })
    } catch {
      return response.unauthorized({
        message: 'Correo o contraseña incorrectos',
      })
    }
  }
}
