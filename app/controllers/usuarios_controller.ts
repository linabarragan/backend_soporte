// app/Controllers/Http/UsersController.ts
import type { HttpContext } from '@adonisjs/core/http'
import Usuario from '#models/usuarios' // Verifica que el modelo se llame correctamente

export default class UsersController {
  /**
   * Muestra una lista de todos los usuarios con sus roles asociados.
   */
  public async index({ response }: HttpContext) {
    try {
      const users = await Usuario.query().preload('role')
      return response.ok(users)
    } catch (error) {
      console.error('Error al obtener usuarios:', error)
      return response.internalServerError({
        message: 'Error al obtener usuarios',
        error: error.message,
      })
    }
  }

  /**
   * Crea un nuevo usuario.
   */
  public async store({ request, response }: HttpContext) {
    const { nombre, apellido, telefono, correo, password, rolId } = request.only([
      'nombre',
      'apellido',
      'telefono',
      'correo',
      'password',
      'rolId',
    ])

    if (!password) {
      return response.badRequest({ message: 'La contraseña es requerida.' })
    }

    try {
      const user = await Usuario.create({
        nombre,
        apellido,
        telefono,
        correo,
        password,
        rolId,
      })

      await user.load('role')

      return response.created(user)
    } catch (error) {
      console.error('Error al crear usuario:', error)
      return response.internalServerError({
        message: 'Error al crear usuario',
        error: error.message,
      })
    }
  }

  /**
   * Actualiza un usuario existente por ID.
   */
  public async update({ params, request, response }: HttpContext) {
    const user = await Usuario.find(params.id)

    if (!user) {
      return response.notFound({ message: 'Usuario no encontrado' })
    }

    const { nombre, apellido, telefono, correo, password, rolId } = request.only([
      'nombre',
      'apellido',
      'telefono',
      'correo',
      'password',
      'rolId',
    ])

    try {
      user.nombre = nombre ?? user.nombre
      user.apellido = apellido ?? user.apellido
      user.telefono = telefono ?? user.telefono
      user.correo = correo ?? user.correo
      user.rolId = rolId ?? user.rolId
      user.password = password ?? user.password

      await user.save()
      await user.load('role')

      return response.ok(user)
    } catch (error) {
      console.error('Error al actualizar usuario:', error)
      return response.internalServerError({
        message: 'Error al actualizar usuario',
        error: error.message,
      })
    }
  }

  /**
   * Elimina un usuario por ID.
   */
  public async destroy({ params, response }: HttpContext) {
    try {
      const user = await Usuario.findOrFail(params.id)
      await user.delete()
      return response.ok({ message: 'Usuario eliminado correctamente' })
    } catch (error) {
      if (error.code === 'E_ROW_NOT_FOUND') {
        return response.notFound({ message: 'Usuario no encontrado' })
      }

      console.error('Error al eliminar usuario:', error)
      return response.internalServerError({
        message: 'Error al eliminar usuario',
        error: error.message,
      })
    }
  }

  /**
   * Actualiza la URL de la foto de perfil sin autenticación.
   */
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
}
