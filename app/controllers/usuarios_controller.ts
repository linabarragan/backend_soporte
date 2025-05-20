import type { HttpContext } from '@adonisjs/core/http'
import Usuario from '../models/usuarios.js'
// import hash from '@adonisjs/core/services/hash'
// import { inject } from '@adonisjs/core'

export default class UsersController {

  async index() {
    return await Usuario.all()
  }

  async store({ request, response }: HttpContext) {
    const data = request.only(['nombre', 'apellido', 'telefono', 'correo', 'password'])

    console.log('Contraseña antes de guardar:', data.password)
    const user = await Usuario.create({
      ...data,
    })
    console.log('Contraseña guardada en la BD:', user.password)
    return response.created(user)
  }

  async update({ params, request, response }: HttpContext) {
    const user = await Usuario.find(params.id)
    if (!user) {
      return response.notFound({ message: 'Usuario no encontrado' })
    }

    const data = request.only(['nombre', 'apellido', 'telefono', 'correo', 'password'])

    user.merge(data)
    await user.save()

    return response.ok(user)
  }

  public async destroy({ params, response }: HttpContextContract) {
    const user = await Usuario.findOrFail(params.id)
    if (!user) {
      return response.notFound({ message: 'Usuario no encontrado' })
    }

    await user.delete()
    return response.ok({ mensaje: 'Usuario eliminado correctamente' })
  }
}


