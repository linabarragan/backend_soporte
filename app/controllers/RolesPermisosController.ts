// app/Controllers/RolesPermisosController.ts

import type { HttpContext } from '@adonisjs/core/http'
import Rol from '#models/roles' // Asegúrate de que la ruta sea correcta, ej. '#models/rol' o '#models/Role'
import Permiso from '#models/permisos' // Asegúrate de que la ruta sea correcta
import Item from '#models/items' // Asegúrate de que la ruta sea correcta
// CAMBIO AQUI: Importa el modelo con su nombre de clase real
import RolesPermisosItem from '#models/roles_permisos_item' // Importa tu modelo pivot (asegúrate de que el archivo se llame roles_permisos_item.ts)


export default class RolesPermisosController {
  /**
   * Obtener todos los roles.
   * GET /api/permisos-gestion/roles
   */
  async getRoles({ response }: HttpContext) {
    try {
      const roles = await Rol.all()
      return response.ok(roles)
    } catch (error) {
      console.error('Error al obtener roles:', error)
      return response.internalServerError({ message: 'Error al obtener roles', error: error.message })
    }
  }

  /**
   * Obtener todos los permisos.
   * GET /api/permisos-gestion/permisos
   */
  async getPermisos({ response }: HttpContext) {
    try {
      const permisos = await Permiso.all()
      return response.ok(permisos)
    } catch (error) {
      console.error('Error al obtener permisos:', error)
      return response.internalServerError({ message: 'Error al obtener permisos', error: error.message })
    }
  }

  /**
   * Obtener todos los ítems (vistas/módulos).
   * GET /api/permisos-gestion/items
   */
  async getItems({ response }: HttpContext) {
    try {
      const items = await Item.all()
      return response.ok(items)
    } catch (error) {
      console.error('Error al obtener ítems:', error)
      return response.internalServerError({ message: 'Error al obtener ítems', error: error.message })
    }
  }

  /**
   * Obtener usuarios (opcional, si los necesitas en esta sección).
   * GET /api/permisos-gestion/usuarios
   */
  async getUsuarios({ response }: HttpContext) {
    try {
      // Si tienes un modelo de Usuario, úsalo aquí.
      // import Usuario from '#models/usuario'
      // const usuarios = await Usuario.all()
      // return response.ok(usuarios)
      return response.ok([]) // Retorna un array vacío si no lo usas o no tienes modelo de Usuario aquí
    } catch (error) {
      console.error('Error al obtener usuarios:', error)
      return response.internalServerError({ message: 'Error al obtener usuarios', error: error.message })
    }
  }

  /**
   * Obtener todas las asignaciones de permisos.
   * GET /api/permisos-gestion/asignaciones
   */
  async getAsignaciones({ response }: HttpContext) {
    try {
      const asignaciones = await RolesPermisosItem.query()
        .preload('rol')
        .preload('permiso')
        .preload('item')
        .orderBy('created_at', 'desc') // O el campo que prefieras para ordenar

      return response.ok(asignaciones)
    } catch (error) {
      console.error('Error al obtener todas las asignaciones:', error)
      return response.internalServerError({ message: 'Error al obtener todas las asignaciones', error: error.message })
    }
  }

  /**
   * Obtener asignaciones para un rol específico.
   * GET /api/permisos-gestion/roles/:rolId/asignaciones
   * Incluye las relaciones para mostrar nombres en el frontend.
   */
  async getAsignacionesPorRol({ params, response }: HttpContext) {
    try {
      const rolId = params.rolId
      const asignaciones = await RolesPermisosItem.query()
        .where('rol_id', rolId)
        .preload('rol') // Carga el objeto Rol relacionado
        .preload('permiso') // Carga el objeto Permiso relacionado
        .preload('item') // Carga el objeto Item relacionado
        .orderBy('created_at', 'desc') // O el campo que prefieras para ordenar

      return response.ok(asignaciones)
    } catch (error) {
      console.error(`Error al obtener asignaciones para el rol ${params.rolId}:`, error)
      return response.internalServerError({ message: 'Error al obtener asignaciones', error: error.message })
    }
  }

  /**
   * Crear nuevas asignaciones de permisos.
   * POST /api/permisos-gestion/asignaciones
   * { rolId, itemId, selectedPermisos, selectedVistas }
   *
   * selectedPermisos: IDs de permisos seleccionados para el rol general o para el item específico.
   * selectedVistas: IDs de items a los que se les asigna el permiso 'Ver' (o similar).
   */
  async createAsignacion({ request, response }: HttpContext) {
    const { rolId, itemId, selectedPermisos, selectedVistas } = request.only([
      'rolId',
      'itemId',
      'selectedPermisos',
      'selectedVistas',
    ])

    if (!rolId) {
      return response.badRequest({ message: 'El rol es requerido para la asignación.' })
    }

    if (!selectedPermisos && !selectedVistas) {
      return response.badRequest({ message: 'Debe seleccionar al menos un permiso o una vista para asignar.' })
    }

    const assignmentsToCreate: Array<{ rolId: number; permisoId: number; itemId: number | null }> = []

    // 1. Asignar permisos generales o a un ítem específico
    if (selectedPermisos && selectedPermisos.length > 0) {
      for (const permisoId of selectedPermisos) {
        assignmentsToCreate.push({
          rolId: rolId,
          permisoId: permisoId,
          itemId: itemId, // Si itemId es null, se guarda como asignación general para el rol
        })
      }
    }

    // 2. Asignar el permiso "Ver" (u otro específico) a las vistas seleccionadas
    if (selectedVistas && selectedVistas.length > 0) {
      const permisoVer = await Permiso.findBy('nombre', 'Ver');
      if (!permisoVer) {
        return response.internalServerError({ message: "El permiso 'Ver' no fue encontrado. Asegúrate de crearlo." });
      }

      for (const vistaId of selectedVistas) {
        assignmentsToCreate.push({
          rolId: rolId,
          permisoId: permisoVer.id,
          itemId: vistaId,
        })
      }
    }

    try {
      let createdCount = 0
      for (const assign of assignmentsToCreate) {
        // Usar findOrCreate para evitar duplicados.
        // La restricción UNIQUE en la DB en ['rol_id', 'permiso_id', 'item_id'] es crucial aquí.
        const [_assignment, isNew] = await RolesPermisosItem.findOrCreate( // Usando el nombre de la clase importada
          {
            rolId: assign.rolId,
            permisoId: assign.permisoId,
            itemId: assign.itemId,
          },
          assign
        )
        if (isNew) {
          createdCount++
        }
      }

      return response.created({ message: `Asignaciones procesadas. ${createdCount} nuevas asignaciones creadas.` })
    } catch (error) {
      console.error('Error al crear asignaciones:', error)
      if (error.code === '23505' || error.code === 'ER_DUP_ENTRY') { // PostgreSQL: '23505', MySQL: 'ER_DUP_ENTRY'
        return response.conflict({ message: 'Algunas asignaciones ya existen.' })
      }
      return response.internalServerError({ message: 'Error al crear asignaciones', error: error.message })
    }
  }

  /**
   * Eliminar una asignación específica.
   * DELETE /api/permisos-gestion/asignaciones/:rolId/:permisoId/:itemId
   */
  async deleteAsignacion({ params, response }: HttpContext) {
    const { rolId, permisoId, itemId } = params

    try {
      let query = RolesPermisosItem.query() // Usando el nombre de la clase importada
        .where('rol_id', rolId)
        .where('permiso_id', permisoId)

      // Si itemId es 'null' (cadena), significa que es una asignación general.
      // Si es un número, es una asignación a un ítem específico.
      if (itemId === 'null') {
        query = query.whereNull('item_id')
      } else {
        query = query.where('item_id', itemId)
      }

      const asignacion = await query.first()

      if (!asignacion) {
        return response.notFound({ message: 'Asignación no encontrada.' })
      }

      await asignacion.delete()
      return response.noContent() // 204 No Content
    } catch (error) {
      console.error(`Error al eliminar asignación para Rol:${rolId}, Permiso:${permisoId}, Item:${itemId}:`, error)
      return response.internalServerError({ message: 'Error al eliminar asignación', error: error.message })
    }
  }

  /**
   * Actualizar una asignación específica.
   * PUT /api/permisos-gestion/asignaciones/:rolId/:permisoId/:itemId
   * NOTA: La actualización de asignaciones es compleja.
   * Normalmente es más fácil eliminar la antigua y crear una nueva si cambian los IDs.
   * Si solo cambian otros atributos en la tabla pivot, se puede usar.
   * Por ahora, solo se devuelve un error informativo.
   */
  async updateAsignacion({ response }: HttpContext) {
    return response.badRequest({ message: 'La actualización directa de asignaciones no está soportada de esta manera. Por favor, elimina la asignación existente y crea una nueva si necesitas cambiar los elementos relacionados (rol, permiso, item).' });
    // Si realmente necesitas actualizar algo DENTRO de la asignación (ej. un campo 'activo'),
    // la lógica sería similar a deleteAsignacion para encontrarla y luego usar .merge().save()
  }
}