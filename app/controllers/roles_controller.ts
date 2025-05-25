import type { HttpContext } from '@adonisjs/core/http'
import Rol from '#models/roles'

export default class RolesController {
  public async index({ response }: HttpContext) {
    try {
      const roles = await Rol.all()
      return response.ok(roles)
    } catch (error) {
      console.error('Error al obtener roles:', error)
      return response.status(500).json({ mensaje: 'Error al obtener roles' })
    }
  }

  public async store({ request, response }: HttpContext) {
    try {
      const data = request.only(['nombre', 'descripcion'])
      const nuevoRol = await Rol.create({
        ...data,
        estado: 'activo', // Estado por defecto
      })
      return response.created(nuevoRol)
    } catch (error) {
      console.error('Error al crear rol:', error)
      return response.status(500).json({ mensaje: 'Error al crear rol' })
    }
  }

  public async update({ params, request, response }: HttpContext) {
    try {
      const rol = await Rol.findOrFail(params.id)
      const data = request.only(['nombre', 'descripcion', 'estado'])

      rol.merge(data)
      await rol.save()

      return response.ok(rol)
    } catch (error) {
      console.error('Error al actualizar rol:', error)
      return response.status(500).json({ mensaje: 'Error al actualizar rol' })
    }
  }

  public async destroy({ params, response }: HttpContext) {
    try {
      const rol = await Rol.findOrFail(params.id)
      await rol.delete()
      return response.ok({ mensaje: 'Rol eliminado correctamente' })
    } catch (error) {
      console.error('Error al eliminar rol:', error)
      return response.status(500).json({ mensaje: 'Error al eliminar rol' })
    }
  }
}
