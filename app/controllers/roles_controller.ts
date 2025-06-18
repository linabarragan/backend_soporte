// app/Controllers/Http/RolesController.ts

import type { HttpContext } from '@adonisjs/core/http'
import Rol from '#models/roles'
import { rolValidator } from '#validators/roles' // ¡Importamos nuestro validador de roles!
import { errors } from '@vinejs/vine' // 🚀 IMPORTANTE: Importa 'errors' de @vinejs/vine

export default class RolesController {
  /**
   * Muestra una lista de todos los roles, con filtro opcional por estado.
   * GET /api/roles
   * GET /api/roles?estado=activo
   */
  async index({ request, response }: HttpContext) {
    try {
      const estadoFiltro = request.input('estado', 'todos');

      let rolesQuery = Rol.query();

      if (estadoFiltro && (estadoFiltro === 'activo' || estadoFiltro === 'inactivo')) {
        rolesQuery = rolesQuery.where('estado', estadoFiltro);
      }

      const roles = await rolesQuery.orderBy('nombre', 'asc')
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
      // Se valida la solicitud usando el esquema 'crear' del validador de roles.
      const payload = await request.validateUsing(rolValidator.crear)

      // Se crea el rol con los datos validados y el estado por defecto 'activo'.
      const rol = await Rol.create({ ...payload, estado: 'activo' })

      return response.created(rol)
    } catch (error) {
      console.error('Error al crear rol:', error)

      // 🚀 CORRECCIÓN APLICADA AQUÍ: Manejo específico de ValidationError
      if (error instanceof errors.E_VALIDATION_ERROR) {
        // Si el error es de validación (como el nombre duplicado), devolvemos 422
        return response.unprocessableEntity(error.messages) // 'error.messages' contiene el array de errores
      }

      // Para cualquier otro error (no de validación), devolvemos un 500
      return response.internalServerError({ message: 'No se pudo crear el rol debido a un error interno del servidor.' })
    }
  }

  /**
   * Actualiza un rol existente.
   * PUT/PATCH /api/roles/:id
   */
  async update({ params, request, response }: HttpContext) {
    try {
      const rol = await Rol.findOrFail(params.id)

      // Se valida la solicitud usando el esquema 'actualizar' del validador de roles.
      // Pasamos el ID del rol actual en 'meta' para que la validación de unicidad de 'nombre'
      // pueda excluir el propio rol de la comprobación.
      const payload = await request.validateUsing(rolValidator.actualizar, {
        meta: {
          rolId: rol.id // Este ID es usado por la regla 'unique' en el validador.
        }
      })

      rol.merge(payload)
      await rol.save()

      return response.ok(rol)
    } catch (error) {
      console.error(`Error al actualizar rol con ID ${params.id}:`, error)

      // 🚀 CORRECCIÓN APLICADA AQUÍ: Manejo específico de ValidationError
      if (error instanceof errors.E_VALIDATION_ERROR) {
        // Si el error es de validación (como el nombre duplicado), devolvemos 422
        return response.unprocessableEntity(error.messages) // 'error.messages' contiene el array de errores
      }

      if (error.code === 'E_ROW_NOT_FOUND') {
        return response.notFound({ message: 'Rol no encontrado para actualizar.' });
      }

      // Para cualquier otro error (no de validación), devolvemos un 500
      return response.internalServerError({ message: 'No se pudo actualizar el rol debido a un error interno del servidor.' })
    }
  }

  /**
   * Inactiva (soft delete) un rol específico.
   * PATCH /api/roles/:id/inactivar
   */
  async inactivate({ params, response }: HttpContext) {
    try {
      const rol = await Rol.findOrFail(params.id)

      if (rol.estado === 'inactivo') {
        return response.ok({ message: 'Rol ya está inactivo.' })
      }

      rol.estado = 'inactivo'
      await rol.save()

      return response.noContent() // 204 No Content
    } catch (error) {
      console.error(`Error al inactivar rol con ID ${params.id}:`, error)
      if (error.code === 'E_ROW_NOT_FOUND') {
        return response.notFound({ message: 'Rol no encontrado.' });
      }
      return response.internalServerError({ message: 'No se pudo inactivar el rol.' })
    }
  }

  /**
   * Activa un rol específico.
   * PATCH /api/roles/:id/activar
   */
  async activate({ params, response }: HttpContext) {
    try {
      const rol = await Rol.findOrFail(params.id)

      if (rol.estado === 'activo') {
        return response.ok({ message: 'Rol ya está activo.' })
      }

      rol.estado = 'activo'
      await rol.save()

      return response.noContent() // 204 No Content
    } catch (error) {
      console.error(`Error al activar rol con ID ${params.id}:`, error)
      if (error.code === 'E_ROW_NOT_FOUND') {
        return response.notFound({ message: 'Rol no encontrado.' });
      }
      return response.internalServerError({ message: 'No se pudo activar el rol.' })
    }
  }

  /**
   * Elimina un rol de forma PERMANENTE de la base de datos.
   * DELETE /api/roles/:id/permanente
   */
  async forceDestroy({ params, response }: HttpContext) {
    try {
      const rol = await Rol.findOrFail(params.id)
      // Opcional: Descomenta si necesitas lógica para evitar eliminar roles
      // asociados a usuarios u otras entidades para mantener la integridad referencial.
      /*
      import Usuario from '#models/usuarios' // Asegúrate de importar el modelo Usuario si lo necesitas.
      const usuariosAsociados = await Usuario.query().where('rol_id', rol.id).first();
      if (usuariosAsociados) {
          return response.forbidden({
            message: 'No se puede eliminar el rol permanentemente porque está asociado a usuarios.'
          });
      }
      */

      await rol.delete() // ¡Elimina el registro de la DB de forma permanente!

      return response.noContent() // 204 No Content para eliminación exitosa sin contenido de respuesta.
    } catch (error) {
      console.error(`Error al eliminar rol permanentemente con ID ${params.id}:`, error)
      if (error.code === 'E_ROW_NOT_FOUND') {
        return response.notFound({ message: 'Rol no encontrado para eliminar.' });
      }
      return response.internalServerError({ message: 'No se pudo eliminar el rol permanentemente.' })
    }
  }
}