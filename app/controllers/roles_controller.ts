// app/controllers/roles_controller.ts

import type { HttpContext } from '@adonisjs/core/http'
import Rol from '#models/roles'

export default class RolesController {
  /**
   * Muestra una lista de todos los roles (activos e inactivos).
   * GET /api/roles
   */
  async index({ response }: HttpContext) {
    try {
      const roles = await Rol.query().orderBy('nombre', 'asc')
      return response.ok(roles)
    } catch (error) {
      console.error('Error al obtener roles:', error)
      return response.internalServerError({ message: 'No se pudieron obtener los roles.' })
    }
  }

  /**
   * Muestra un rol específico por su ID.
   * GET /api/roles/:id
   */
  async show({ params, response }: HttpContext) {
    try {
      const rol = await Rol.find(params.id)

      if (!rol) {
        return response.notFound({ message: 'Rol no encontrado.' })
      }

      return response.ok(rol)
    } catch (error) {
      console.error(`Error al obtener rol con ID ${params.id}:`, error)
      return response.internalServerError({ message: 'Error al obtener el rol.' })
    }
  }

  /**
   * Crea un nuevo rol.
   * POST /api/roles
   */
  async store({ request, response }: HttpContext) {
    try {
      const data = request.only(['nombre', 'descripcion', 'estado'])
      const rol = await Rol.create(data)

      return response.created(rol)
    } catch (error) {
      console.error('Error al crear rol:', error)
      return response.internalServerError({ message: 'No se pudo crear el rol.' })
    }
  }

  /**
   * Actualiza un rol existente.
   * PUT/PATCH /api/roles/:id
   */
  async update({ params, request, response }: HttpContext) {
    try {
      const rol = await Rol.findOrFail(params.id)

      const data = request.only(['nombre', 'descripcion', 'estado']) 
      rol.merge(data)
      await rol.save()

      return response.ok(rol)
    } catch (error) {
      console.error(`Error al actualizar rol con ID ${params.id}:`, error)
      if (error.code === 'E_ROW_NOT_FOUND') {
        return response.notFound({ message: 'Rol no encontrado.' });
      }
      return response.internalServerError({ message: 'No se pudo actualizar el rol.' })
    }
  }

  /**
   * "Elimina suavemente" (cambia el estado a 'inactivo') un rol específico.
   * DELETE /api/roles/:id
   */
  async destroy({ params, response }: HttpContext) {
    try {
      const rol = await Rol.findOrFail(params.id)

      if (rol.estado === 'inactivo') {
        return response.notFound({ message: 'Rol ya inactivo.' }) // Evita intentar inactivar uno ya inactivo
      }

      rol.estado = 'inactivo'
      await rol.save()

      return response.noContent()
    } catch (error) {
      console.error(`Error al inactivar rol con ID ${params.id}:`, error)
      if (error.code === 'E_ROW_NOT_FOUND') {
        return response.notFound({ message: 'Rol no encontrado.' });
      }
      return response.internalServerError({ message: 'No se pudo inactivar el rol.' })
    }
  }

  /**
   * Elimina un rol de forma PERMANENTE de la base de datos.
   * DELETE /api/roles/force/:id (nueva ruta)
   */
  async forceDestroy({ params, response }: HttpContext) {
    try {
      const rol = await Rol.findOrFail(params.id)
      await rol.delete() // ¡Elimina el registro de la DB!

      return response.noContent() // 204 No Content
    } catch (error) {
      console.error(`Error al eliminar rol permanentemente con ID ${params.id}:`, error)
      if (error.code === 'E_ROW_NOT_FOUND') {
        return response.notFound({ message: 'Rol no encontrado para eliminar.' });
      }
      return response.internalServerError({ message: 'No se pudo eliminar el rol permanentemente.' })
    }
  }
}
