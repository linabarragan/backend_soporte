import type { HttpContext } from '@adonisjs/core/http'
import Usuario from '../models/usuarios.js'
// import hash from '@adonisjs/core/services/hash'

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

    if (!data.password) {
      delete data.password
    } else {
      // Aquí puedes hashear la contraseña antes de guardarla si quieres
      // Ejemplo: data.password = await Hash.make(data.password)
    }

    user.merge(data)
    await user.save()

    return response.ok(user)
  }

  public async destroy({ params, response }: HttpContext) {
    const user = await Usuario.find(params.id)
    if (!user) {
      return response.notFound({ message: 'Usuario no encontrado' })
    }

    await user.delete()
    return response.ok({ mensaje: 'Usuario eliminado correctamente' })
  }

  public async updateProfilePictureUrlNoAuth({ request, response }: HttpContext) {
    const { userId, url } = request.only(['userId', 'url'])

    if (!userId || !url) {
      return response.badRequest({ message: 'Se requiere userId y url' })
    }

    const user = await Usuario.find(userId)
    if (!user) {
      return response.notFound({ message: 'Usuario no encontrado' })
    }

    user.foto_perfil = url
    await user.save()

    return response.ok({
      message: 'Foto de perfil actualizada con éxito (sin auth)',
      foto_perfil: user.foto_perfil,
    })
  }

  // Nuevo método para guardar la URL externa (ej. Firebase)
  /*public async updateProfilePictureUrl({ auth, request, response }: HttpContext) {
    try {
      const user = auth.user
      console.log('Usuario autenticado:', user)
      if (!user) {
        return response.unauthorized({ message: 'No autenticado' })
      }

      const { url } = request.only(['url'])
      console.log('URL recibida:', url)
      if (!url) {
        return response.badRequest({ message: 'La URL de la foto es requerida' })
      }

      user.foto_perfil = url
      await user.save()

      return response.ok({
        message: 'Foto de perfil actualizada con éxito',
        foto_perfil: user.foto_perfil,
      })
    } catch (error) {
      console.error('Error actualizando foto de perfil:', error)
      return response.internalServerError({ message: 'Error interno del servidor' })
    }
  }*/

  // Ruta temporal para pruebas SIN autenticación
  /*public async testUpdateProfilePictureUrl({ request, response }: HttpContext) {
    const { userId, url } = request.only(['userId', 'url'])

    const user = await Usuario.find(userId)
    if (!user) {
      return response.notFound({ message: 'Usuario no encontrado' })
    }

    user.foto_perfil = url
    await user.save()

    return response.ok({
      message: 'Foto de perfil actualizada con éxito (prueba)',
      foto_perfil: user.foto_perfil,
    })
  }*/
}
