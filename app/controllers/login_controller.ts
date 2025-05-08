import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { schema, rules } from '@ioc:Adonis/Core/Validator'

export default class LoginController {
  public async login({ auth, request, response }: HttpContextContract) {
    // Validación de entrada
    const loginSchema = schema.create({
      email: schema.string({}, [rules.email()]),
      password: schema.string({}, [rules.minLength(6)]),
    })

    const credentials = await request.validate({ schema: loginSchema })

    try {
      // Intentamos autenticar al usuario y generar un token
      const token = await auth.use('api').attempt(credentials.email, credentials.password, {
        expiresIn: '7days',
      })

      return response.ok({
        message: 'Inicio de sesión exitoso',
        user: auth.user,
        token: token.toJSON(),
      })
    } catch {
      return response.unauthorized({
        message: 'Correo o contraseña incorrectos',
      })
    }
  }
}
