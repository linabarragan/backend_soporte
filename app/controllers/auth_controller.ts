import type { HttpContext } from '@adonisjs/core/http'
import User from '#models/user'

export default class AuthController {
  async login({ request }: HttpContext) {
    const { correo, password } = request.only(['correo', 'password'])
    const user = await User.verifyCredentials(correo, password)
    const token = await User.accessTokens.create(user)
    return token
  }
}
