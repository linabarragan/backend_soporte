import type { HttpContext } from '@adonisjs/core/http'
import Role from '#models/roles.js'
import Item from '#models/items.js' // O Module
import Permisos from '#models/permisos.js'
import { Exception } from '@adonisjs/core/exceptions'
import db from '@adonisjs/lucid/services/db'
import RolesPermisosItem from '#models/roles_permisos_item'

export default class RoleItemPermisosController {
  /**
   * Obtener todos los roles
   */
  async getRoles({ response }: HttpContext) {
    const roles = await Role.all()
    return response.ok(roles)
  }

  /**
   * Obtener todos los ítems (módulos)
   */
  async getItems({ response }: HttpContext) {
    const items = await Item.all() // O Module.all()
    return response.ok(items)
  }

  /**
   * Obtener todos los permisos
   */
  async getPermissions({ response }: HttpContext) {
    const permissions = await Permisos.all()
    return response.ok(permissions)
  }

  /**
   * Asigna permisos a un rol para un ítem específico.
   * Realiza un "upsert": elimina asignaciones existentes para el rol/ítem dado y luego crea nuevas.
   */
  async assign({ request, response }: HttpContext) {
    const { rolId, itemId, permisosIds } = request.only(['rolId', 'itemId', 'permisosIds'])

    if (!rolId || !itemId || !Array.isArray(permisosIds)) {
      throw new Exception(
        'roleId, itemId y permisosIds son requeridos y permisosIds debe ser un array.',
        {
          code: 'BAD_REQUEST',
          status: 400,
        }
      )
    }

    const trx = await db.transaction() // Iniciar una transacción

    try {
      // 1. Verificar si el rol, ítem y permisos existen
      const role = await Role.find(rolId, { client: trx })
      if (!role) {
        throw new Exception(`El rol con ID ${rolId} no existe.`, {
          code: 'NOT_FOUND',
          status: 404,
        })
      }
      const item = await Item.find(itemId, { client: trx }) // O Module.find
      if (!item) {
        throw new Exception(`El ítem con ID ${itemId} no existe.`, {
          code: 'NOT_FOUND',
          status: 404,
        })
      }

      // Validar que todos los permisosIds existen
      const existingPermissions = (
        await Permisos.query({ client: trx }).whereIn('id', permisosIds).select('id')
      ).map((p) => p.id)

      if (existingPermissions.length !== permisosIds.length) {
        const nonExistent = permisosIds.filter((id) => !existingPermissions.includes(id))
        throw new Exception(`Algunos permisos no existen: ${nonExistent.join(', ')}.`, {
          code: 'BAD_REQUEST',
          status: 400,
        })
      }

      // 2. Eliminar todas las asignaciones existentes para este roleId y itemId
      await RolesPermisosItem.query({ client: trx })
        .where('rol_id', rolId)
        .where('item_id', itemId) // O module_id
        .delete()

      // 3. Crear nuevas asignaciones solo si hay permisosIds para insertar
      if (permisosIds.length > 0) {
        const assignmentsToCreate = permisosIds.map((permisosId) => ({
          roleId: rolId,
          itemId: itemId,
          permisosId: permisosId,
        }))
        await RolesPermisosItem.createMany(assignmentsToCreate, { client: trx })
      }

      await trx.commit() // Confirmar la transacción
      return response.created({ message: 'Permisos asignados/actualizados exitosamente.' })
    } catch (error) {
      await trx.rollback() // Revertir la transacción en caso de error
      console.error('Error al asignar/actualizar permisos:', error.message)
      if (error instanceof Exception) {
        throw error // Vuelve a lanzar la excepción de Adonis
      }
      throw new Exception('Error interno del servidor al asignar permisos.', { status: 500 })
    }
  }

  /**
   * Obtiene todas las asignaciones de permisos, incluyendo las relaciones de Rol, Ítem y Permiso.
   */
  async index({ response }: HttpContext) {
    const assignments = await RolesPermisosItem.query()
      .preload('rol')
      .preload('item') // O 'module'
      .preload('permiso')
      .orderBy('id', 'asc') // O 'createdAt', 'desc'

    return response.ok(assignments)
  }

  /**
   * Elimina todas las asignaciones de permisos para un rol y un ítem específicos.
   */
  async destroyByRolItem({ params, response }: HttpContext) {
    const { rolId, itemId } = params // Espera roleId y itemId en los parámetros de la URL

    if (!rolId || !itemId) {
      throw new Exception('roleId e itemId son requeridos.', {
        code: 'BAD_REQUEST',
        status: 400,
      })
    }

    try {
      const deletedRows = await RolesPermisosItem.query()
        .where('role_id', rolId)
        .where('item_id', itemId)
        .delete()

      if (deletedRows.length === 0) {
        return response.notFound({
          message: 'No se encontraron asignaciones para eliminar con el rol e ítem proporcionados.',
        })
      }

      return response.ok({
        message: `Se eliminaron ${deletedRows} asignaciones de permisos para el Rol ${rolId} e Ítem ${itemId}.`,
      })
    } catch (error) {
      console.error('Error al eliminar asignaciones por rol e ítem:', error.message)
      throw new Exception('Error interno del servidor al eliminar asignaciones.', { status: 500 })
    }
  }
}
