// app/Controllers/Http/RolesController.ts

import type { HttpContext } from '@adonisjs/core/http'
import Rol from '#models/roles'

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
      const { nombre } = request.only(['nombre']); // Solo obtenemos el nombre para la validación manual

      // --- Verificación de unicidad del nombre (manual) ---
      if (!nombre) {
        return response.badRequest({ message: 'El nombre del rol es requerido.' });
      }

      const existingRol = await Rol.query().whereRaw('LOWER(nombre) = ?', [nombre.toLowerCase()]).first();
      if (existingRol) {
        return response.conflict({ message: 'El nombre del rol ya está en uso.' });
      }
      // --- Fin de verificación de unicidad ---

      // Asumimos que los otros campos se manejan y se validan en el frontend o con otras reglas simples
      const datos = request.only(['nombre', 'estado']); // Puedes expandir esto si hay más campos
      
      // Asegurarse de que el estado por defecto sea 'activo' al crear si no se envía
      const rol = await Rol.create({ ...datos, estado: datos.estado || 'activo' });

      return response.created(rol);
    } catch (error) {
      console.error('Error al crear rol:', error);
      return response.internalServerError({ message: 'No se pudo crear el rol debido a un error interno del servidor.' });
    }
  }

  /**
   * Actualiza un rol existente.
   * PUT/PATCH /api/roles/:id
   */
  async update({ params, request, response }: HttpContext) {
    try {
      const rol = await Rol.findOrFail(params.id)
      const { nombre, estado } = request.only(['nombre', 'estado']) // Obtener los campos a actualizar

      // --- Verificación de unicidad del nombre (manual para actualización) ---
      if (nombre && nombre.toLowerCase() !== rol.nombre.toLowerCase()) { // Solo verificar si el nombre cambió
        const existingRol = await Rol.query()
          .whereRaw('LOWER(nombre) = ?', [nombre.toLowerCase()])
          .whereNot('id', rol.id) // Excluir el propio rol de la verificación
          .first()
        if (existingRol) {
          return response.conflict({ message: 'El nombre del rol ya está en uso.' });
        }
      }
      // --- Fin de verificación de unicidad ---

      // Fusionar los datos recibidos (nombre y estado, u otros campos que tengas)
      rol.merge({ nombre, estado }); // Solo actualiza los campos que te pasen
      await rol.save();

      return response.ok(rol);
    } catch (error) {
      console.error(`Error al actualizar rol con ID ${params.id}:`, error);
      if (error.code === 'E_ROW_NOT_FOUND') {
        return response.notFound({ message: 'Rol no encontrado para actualizar.' });
      }
      return response.internalServerError({ message: 'No se pudo actualizar el rol debido a un error interno del servidor.' });
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

  /**
   * Verifica si un nombre de rol ya existe en la base de datos.
   * Usado para validación de unicidad en el frontend.
   */
  public async checkUniqueName({ request, response }: HttpContext) {
    try {
      const name = request.input('name') // Obtiene el parámetro 'name' de la query string o body
      const excludeId = request.input('excludeId') // Opcional: ID del rol actual si estamos editando

      if (!name) {
        return response.badRequest({ message: 'El nombre es requerido para la verificación.' })
      }

      let query = Rol.query().whereRaw('LOWER(nombre) = ?', [name.toLowerCase()])

      // Si se proporciona un ID a excluir (para el caso de edición)
      if (excludeId) {
        query = query.whereNot('id', excludeId)
      }

      const rol = await query.first()

      // Si 'rol' es nulo, significa que el nombre es único
      if (rol) {
        // El nombre ya existe
        return response.conflict({ isUnique: false, message: 'El nombre de rol ya está en uso.' })
      } else {
        // El nombre es único
        return response.ok({ isUnique: true, message: 'El nombre de rol está disponible.' })
      }
    } catch (error) {
      console.error('Error en checkUniqueName (Roles):', error)
      return response.internalServerError({ isUnique: false, message: 'Error interno del servidor al verificar el nombre del rol.' })
    }
  }
}