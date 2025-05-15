import type { HttpContext } from '@adonisjs/core/http'
import Usuario from '#models/usuarios'

export default class AuthController {
  public async login({ request, response }: HttpContext) {
    const { correo, password } = request.only(['correo', 'password'])

    try {
      const user = await Usuario.verifyCredentials(correo, password)
      const token = await Usuario.accessTokens.create(user) // Crea token de acceso

      return {
        type: 'bearer',
        token: token.value, // Enviar el valor del token
        user: {
          id: user.id,
          correo: user.correo,
        },
      }
    } catch (error) {
      return response.unauthorized({
        message: 'Correo o contraseña inválidos',
      })
    }
  }
}
