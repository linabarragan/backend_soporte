// app/Controllers/RolesController.ts

import type { HttpContext } from '@adonisjs/core/http'
import Rol from '#models/roles' // Asegúrate de que la ruta sea correcta

export default class RolesController {
  /**
   * Listar todos los roles.
   * GET /api/roles
   */
  async index({ response }: HttpContext) {
    try {
      const roles = await Rol.all()
      return response.ok(roles)
    } catch (error) {
      console.error('Error al obtener roles:', error)
      return response.internalServerError({ message: 'Error al obtener roles', error: error.message })
    }
  }

  /**
   * Mostrar un rol específico por ID.
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
      console.error(`Error al obtener rol ${params.id}:`, error)
      return response.internalServerError({ message: 'Error al obtener rol', error: error.message })
    }
  }

  /**
   * Crear un nuevo rol.
   * POST /api/roles
   */
  async store({ request, response }: HttpContext) {
    const { nombre } = request.only(['nombre'])

    if (!nombre) {
      return response.badRequest({ message: 'El nombre del rol es requerido.' })
    }

    try {
      const rol = await Rol.create({ nombre })
      return response.created(rol) // 201 Created
    } catch (error) {
      console.error('Error al crear rol:', error)
      // Puedes añadir más lógica aquí para errores de duplicados, etc.
      return response.internalServerError({ message: 'Error al crear rol', error: error.message })
    }
  }

  /**
   * Actualizar un rol existente.
   * PUT /api/roles/:id
   */
  async update({ params, request, response }: HttpContext) {
    const { nombre } = request.only(['nombre'])

    if (!nombre) {
      return response.badRequest({ message: 'El nombre del rol es requerido para actualizar.' })
    }

    try {
      const rol = await Rol.find(params.id)
      if (!rol) {
        return response.notFound({ message: 'Rol no encontrado para actualizar.' })
      }

      rol.nombre = nombre
      await rol.save()
      return response.ok(rol)
    } catch (error) {
      console.error(`Error al actualizar rol ${params.id}:`, error)
      return response.internalServerError({ message: 'Error al actualizar rol', error: error.message })
    }
  }

  /**
   * Eliminar un rol.
   * DELETE /api/roles/:id
   */
  async destroy({ params, response }: HttpContext) {
    try {
      const rol = await Rol.find(params.id)
      if (!rol) {
        return response.notFound({ message: 'Rol no encontrado para eliminar.' })
      }

      await rol.delete()
      return response.noContent() // 204 No Content
    } catch (error) {
      console.error(`Error al eliminar rol ${params.id}:`, error)
      // OJO: Considera añadir lógica para evitar eliminar roles si tienen asignaciones (FK en rol_permiso_items)
      // Esto causaría un error de restricción de clave foránea.
      return response.internalServerError({ message: 'Error al eliminar rol', error: error.message })
    }
  }
}