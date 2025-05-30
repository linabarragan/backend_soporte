// app/Controllers/Http/UsersController.ts
import type { HttpContext } from '@adonisjs/core/http'
import Usuario from '#models/usuarios' // Asegúrate de que el nombre del archivo del modelo sea correcto (Usuario.js o usuarios.js)


export default class UsersController {
  /**
   * Muestra una lista de todos los usuarios con sus roles asociados.
   */
  async index({ response }: HttpContext) {
    try {
      // Carga eager (preload) la relación 'role'.
      // Asegúrate de que 'role' sea el nombre de la relación definida en tu modelo Usuario.
      const users = await Usuario.query().preload('role')
      return response.ok(users)
    } catch (error) {
      console.error('Error al obtener usuarios:', error)
      return response.internalServerError({ message: 'Error al obtener usuarios', error: error.message })
    }
  }

  /**
   * Crea un nuevo usuario.
   */
  async store({ request, response }: HttpContext) {
    // === CAMBIO CLAVE AQUÍ: 'rolId' en lugar de 'roleId' ===
    const { nombre, apellido, telefono, correo, password, rolId } = request.only([
      'nombre',
      'apellido',
      'telefono',
      'correo',
      'password',
      'rolId', // ¡CAMBIADO A 'rolId'!
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
        rolId, // ¡CAMBIADO A 'rolId'! Asigna el ID del rol
      })

      // Opcional: precargar el rol para la respuesta de creación
      await user.load('role')

      return response.created(user)
    } catch (error) {
      console.error('Error al crear usuario:', error)
      return response.internalServerError({ message: 'Error al crear usuario', error: error.message })
    }
  }

  /**
   * Actualiza un usuario existente por ID.
   */
  async update({ params, request, response }: HttpContext) {
    const user = await Usuario.find(params.id)
    if (!user) {
      return response.notFound({ message: 'Usuario no encontrado' })
    }

    // === CAMBIO CLAVE AQUÍ: 'rolId' en lugar de 'roleId' ===
    const { nombre, apellido, telefono, correo, password, rolId } = request.only([
      'nombre',
      'apellido',
      'telefono',
      'correo',
      'password',
      'rolId', // ¡CAMBIADO A 'rolId'!
    ])

    try {
      user.nombre = nombre || user.nombre
      user.apellido = apellido || user.apellido
      user.telefono = telefono || user.telefono
      user.correo = correo || user.correo
      user.rolId = rolId || user.rolId // ¡CAMBIADO A 'rolId'! Actualiza el ID del rol
      user.password = password || user.password 

      // Solo actualiza la contraseña si se proporciona una nueva
     

      await user.save()

      // Opcional: precargar el rol para la respuesta de actualización
      await user.load('role')

      return response.ok(user)
    } catch (error) {
      console.error('Error al actualizar usuario:', error)
      return response.internalServerError({ message: 'Error al actualizar usuario', error: error.message })
    }
  }

  /**
   * Elimina un usuario por ID.
   */
  public async destroy({ params, response }: HttpContext) {
    try {
      const user = await Usuario.findOrFail(params.id) // findOrFail arrojará un error si no lo encuentra

      await user.delete()
      return response.ok({ message: 'Usuario eliminado correctamente' })
    } catch (error) {
      if (error.code === 'E_ROW_NOT_FOUND') {
        return response.notFound({ message: 'Usuario no encontrado' })
      }
      console.error('Error al eliminar usuario:', error)
      return response.internalServerError({ message: 'Error al eliminar usuario', error: error.message })
    }
  }
}