import type { HttpContext } from '@adonisjs/core/http'
import Ticket from '#models/tickets'
import HistorialEstadosTicket from '#models/historial_estado_tickets'
import EstadoTicket from '#models/estados_ticket'
import EstadoNotificacion from '#models/estados_notificacion'; // ¡Importante! Asegúrate de tener este modelo
import NotificacionesController from './notificacions_controller.js'
import app from '@adonisjs/core/services/app'
import { cuid } from '@adonisjs/core/helpers'
import { DateTime } from 'luxon'
import { existsSync } from 'node:fs'
import { rm } from 'node:fs/promises' // Para eliminar archivos de forma asíncrona

// Importa tus validaciones de VineJS
import { ticketValidator } from '#validators/tickets'

export default class TicketsController {
  /**
   * Listar todos los tickets.
   */
  async index({ response }: HttpContext) {
    const tickets = await Ticket.query()
      .preload('usuarioAsignado')
      .preload('categoria')
      .preload('empresa')
      .preload('servicio')
      .preload('estado')
      .preload('prioridad')
      .preload('creador')
      .orderBy('id', 'desc')
    return response.ok(tickets)
  }

  /**
   * Mostrar un ticket específico por ID.
   */
  async show({ params, response }: HttpContext) {
    const ticket = await Ticket.query()
      .where('id', params.id)
      .preload('usuarioAsignado')
      .preload('categoria')
      .preload('empresa')
      .preload('servicio')
      .preload('estado')
      .preload('prioridad')
      .preload('creador')
      .firstOrFail()
    return response.ok(ticket)
  }

  /**
   * Crear un nuevo ticket.
   */
  async store({ request, response }: HttpContext) {
    try {
      const payload = await request.validateUsing(ticketValidator.crear)

      let uploadedFileName: string | null = null

      if (payload.archivo_adjunto) {
        uploadedFileName = `${cuid()}.${payload.archivo_adjunto.extname}`
        await payload.archivo_adjunto.move(app.publicPath('uploads/tickets'), {
          name: uploadedFileName,
          overwrite: true,
        })
      }

      const ticketData: Partial<Ticket> = {
        titulo: payload.titulo,
        descripcion: payload.descripcion,
        estadoId: payload.estado_id,
        prioridadId: payload.prioridad_id,
        empresasId: payload.empresas_id,
        categoriaId: payload.categoria_id,
        servicioId: payload.servicio_id,
        nombreArchivo: uploadedFileName,
        creadorId: payload.userId,
      }

      if (payload.usuario_asignado_id) {
        ticketData.usuarioAsignadoId = payload.usuario_asignado_id
        ticketData.fechaAsignacion = DateTime.now()
      } else {
        ticketData.usuarioAsignadoId = null
        ticketData.fechaAsignacion = null
      }

      const ticket = await Ticket.create(ticketData)

      // Guardar en historial después de crear el ticket
      await HistorialEstadosTicket.create({
        ticketId: ticket.id,
        estadoId: ticket.estadoId,
        comentario: 'Ticket creado con estado inicial',
        usuarioId: payload.userId,
        fechaCambio: DateTime.now(),
      })

      // Cargar relaciones para la respuesta
      await ticket.load('usuarioAsignado')
      await ticket.load('categoria')
      await ticket.load('empresa')
      await ticket.load('servicio')
      await ticket.load('estado')
      await ticket.load('prioridad')
      await ticket.load('creador')

      return response.created(ticket)
    } catch (error) {
      if (error.status === 422) {
        console.error('Errores de validación de VineJS en store:', error.messages);
        return response.unprocessableEntity(error.messages)
      }
      console.error('Error al crear ticket:', error)
      return response.internalServerError({ message: 'Error al crear el ticket', error: error.message })
    }
  }

  /**
   * Actualizar un ticket existente.
   */
  async update({ params, request, response }: HttpContext) {
    const ticket = await Ticket.find(params.id)
    if (!ticket) {
      return response.notFound({ message: 'Ticket no encontrado' })
    }

    try {
      const payload = await request.validateUsing(ticketValidator.actualizar)

      // --- CONSOLE.LOG DEPURACIÓN ---
      console.log('--- PAYLOAD RECIBIDO Y VALIDADO EN TicketsController.update ---')
      console.log(payload)
      console.log('--------------------------------------------------------------')
      // --- FIN CONSOLE.LOG DEPURACIÓN ---

      const estadoAnteriorId = ticket.estadoId
      const usuarioQueActualizaId = payload.usuario_id

      // 1. Lógica para manejar el archivo adjunto (eliminación o carga de nuevo)
      if (payload.clear_adjunto) {
        if (ticket.nombreArchivo) {
          const filePath = app.publicPath(`uploads/tickets/${ticket.nombreArchivo}`)
          if (existsSync(filePath)) {
            try {
              await rm(filePath) // Usando await rm()
              ticket.nombreArchivo = null
              console.log(`Archivo ${filePath} eliminado exitosamente.`)
            } catch (err: any) {
              console.error('Error al eliminar archivo adjunto (clear_adjunto):', err)
              throw new Error(`Error al eliminar el archivo adjunto existente: ${err.message}`)
            }
          }
        }
      } else if (payload.archivo_adjunto) {
        // Si se envió un nuevo archivo, eliminar el anterior si existe
        if (ticket.nombreArchivo) {
          const oldFilePath = app.publicPath(`uploads/tickets/${ticket.nombreArchivo}`)
          if (existsSync(oldFilePath)) {
            try {
              await rm(oldFilePath)
              console.log(`Archivo anterior ${oldFilePath} eliminado exitosamente.`)
            } catch (err: any) {
              console.error('Error al eliminar archivo adjunto anterior (al subir nuevo):', err)
            }
          }
        }
        const newFileName = `${cuid()}.${payload.archivo_adjunto.extname}`
        await payload.archivo_adjunto.move(app.publicPath('uploads/tickets'), {
          name: newFileName,
          overwrite: true,
        })
        ticket.nombreArchivo = newFileName
      }

      // 2. Construir un objeto con las actualizaciones del ticket
      const ticketUpdates: Partial<Ticket> = {}

      if (payload.titulo !== undefined) ticketUpdates.titulo = payload.titulo
      if (payload.descripcion !== undefined) ticketUpdates.descripcion = payload.descripcion
      if (payload.estado_id !== undefined) ticketUpdates.estadoId = payload.estado_id
      if (payload.prioridad_id !== undefined) ticketUpdates.prioridadId = payload.prioridad_id
      if (payload.empresas_id !== undefined) ticketUpdates.empresasId = payload.empresas_id
      if (payload.categoria_id !== undefined) ticketUpdates.categoriaId = payload.categoria_id
      if (payload.servicio_id !== undefined) ticketUpdates.servicioId = payload.servicio_id

      // Lógica específica para `usuario_asignado_id` y `fechaAsignacion`
      if (payload.usuario_asignado_id !== undefined) {
        if (ticket.usuarioAsignadoId !== payload.usuario_asignado_id) {
            ticketUpdates.usuarioAsignadoId = payload.usuario_asignado_id
            ticketUpdates.fechaAsignacion = payload.usuario_asignado_id !== null ? DateTime.now() : null
        }
      }

      // Aplicar las actualizaciones al modelo del ticket
      ticket.merge(ticketUpdates)

      // 3. Guardar en historial solo si el estado cambió
      if (estadoAnteriorId !== ticket.estadoId && usuarioQueActualizaId) {
        const estadoAnterior = await EstadoTicket.find(estadoAnteriorId)
        const estadoNuevo = await EstadoTicket.find(ticket.estadoId)

        const comentarioTexto = `Cambio de estado: ${estadoAnterior?.nombre || estadoAnteriorId} → ${estadoNuevo?.nombre || ticket.estadoId}`

        await HistorialEstadosTicket.create({
          ticketId: ticket.id,
          estadoId: ticket.estadoId,
          comentario: comentarioTexto,
          usuarioId: usuarioQueActualizaId,
          fechaCambio: DateTime.now(),
        })
      }

      // 4. Notificación de cambio de estado
      const estado = await EstadoTicket.find(ticket.estadoId)

      // ⭐⭐⭐ LA CORRECCIÓN ES AQUÍ: cambiamos 'crearParaTodos' por 'crearParaCreadorTicket' ⭐⭐⭐
      const ID_ESTADO_NOTIFICACION_CAMBIO = 1; // EJEMPLO: Asegúrate de que este ID exista en tu tabla 'estado_notificacions'

      await NotificacionesController.crearParaCreadorTicket({ // ¡Método renombrado!
        titulo: 'Cambio de estado',
        mensaje: `El ticket #${ticket.id} cambió de estado a ${estado?.nombre || 'nuevo estado'}`,
        ticketId: ticket.id,
        estadoId: ID_ESTADO_NOTIFICACION_CAMBIO, // Usamos el ID de notificación válido
      })
      // ⭐⭐⭐ FIN DE LA CORRECCIÓN ⭐⭐⭐

      // 5. Lógica para fechaFinalizacion (cerrar/reabrir ticket)
      const estadoCerrado = await EstadoTicket.findBy('nombre', 'Cerrado')

      if (estadoCerrado && ticket.estadoId === estadoCerrado.id && !ticket.fechaFinalizacion) {
        ticket.fechaFinalizacion = DateTime.now()
      } else if (ticket.fechaFinalizacion && (!estadoCerrado || ticket.estadoId !== estadoCerrado.id)) {
        ticket.fechaFinalizacion = null
      }

      // Guardar todos los cambios en la base de datos
      await ticket.save()

      // 6. Cargar relaciones para la respuesta final
      await ticket.load('usuarioAsignado')
      await ticket.load('categoria')
      await ticket.load('empresa')
      await ticket.load('servicio')
      await ticket.load('estado')
      await ticket.load('prioridad')
      await ticket.load('creador')

      return response.ok(ticket)
    } catch (error: any) {
      if (error.code === 'E_ROW_NOT_FOUND') {
        return response.notFound({ message: 'Ticket no encontrado' })
      }
      if (error.status === 422) {
        console.error('Errores de validación de VineJS en update:', error.messages)
        return response.unprocessableEntity(error.messages)
      }
      console.error('Error al actualizar ticket:', error)
      if (error.message && error.message.includes('Error al eliminar el archivo adjunto existente')) {
          return response.internalServerError({ message: 'Error en el servidor al eliminar el archivo adjunto. Verifique permisos.', error: error.message })
      }
      return response.internalServerError({ message: 'Error desconocido al actualizar el ticket', error: error.message })
    }
  }

  /**
   * Eliminar un ticket.
   * También elimina el archivo adjunto si existe.
   */
  async destroy({ params, response }: HttpContext) {
    const ticket = await Ticket.find(params.id)
    if (!ticket) {
      return response.notFound({ message: 'Ticket no encontrado' })
    }

    // Eliminar el archivo adjunto físico si existe
    if (ticket.nombreArchivo) {
      const filePath = app.publicPath(`uploads/tickets/${ticket.nombreArchivo}`)
      if (existsSync(filePath)) {
        try {
          await rm(filePath)
          console.log(`Archivo ${filePath} eliminado exitosamente al destruir ticket.`);
        } catch (err: any) {
          console.error('Error al eliminar archivo adjunto al destruir ticket:', err)
        }
      }
    }

    await ticket.delete()
    return response.ok({ mensaje: 'Ticket eliminado correctamente' })
  }

  /**
   * Nuevo método para servir archivos adjuntos (descarga/visualización).
   */
  async downloadAttachment({ params, response }: HttpContext) {
    const ticket = await Ticket.find(params.id)
    if (!ticket || !ticket.nombreArchivo) {
      return response.notFound({ message: 'Archivo adjunto no encontrado o ticket inválido.' })
    }

    const filePath = app.publicPath(`uploads/tickets/${ticket.nombreArchivo}`)

    if (!existsSync(filePath)) {
      return response.notFound({ message: 'El archivo adjunto no existe en el servidor.' })
    }

    // `response.download` automáticamente establece los headers para descarga o visualización
    return response.download(filePath)
  }

  /**
   * Obtiene el historial de tickets con filtros y paginación.
   */
  async historial({ request, response }: HttpContext) {
    try {
      const page = request.input('page', 1)
      const limit = request.input('limit', 10)

      const estadoId = request.input('estado_id')
      const creadorId = request.input('creador_id')
      const categoriaId = request.input('categoria_id')
      const fechaInicio = request.input('fecha_inicio')
      const fechaFin = request.input('fecha_fin')

      const query = Ticket.query()
        .preload('usuarioAsignado')
        .preload('categoria')
        .preload('empresa')
        .preload('servicio')
        .preload('estado')
        .preload('prioridad')
        .preload('creador')
        .preload('comentarios', (comentarioQuery) => comentarioQuery.preload('usuario'))
        .orderBy('id', 'desc')

      if (estadoId) query.where('estado_id', estadoId)
      if (creadorId) query.where('creador_id', creadorId)
      if (categoriaId) query.where('categoria_id', categoriaId)

      if (fechaInicio && fechaFin) {
        query.whereBetween('created_at', [fechaInicio, fechaFin])
      }

      const paginatedTickets = await query.paginate(page, limit)

      return response.ok(paginatedTickets)
    } catch (error) {
      console.error(error)
      return response.internalServerError({
        message: 'Error al obtener el historial de tickets',
        error,
      })
    }
  }
}
