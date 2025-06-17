import type { HttpContext } from '@adonisjs/core/http'
import Ticket from '#models/tickets'
import HistorialEstadosTicket from '#models/historial_estado_tickets'
import EstadoTicket from '#models/estados_ticket'
import NotificacionesController from './notificacions_controller.js'
// Comentadas las importaciones de schema y rules para eliminar la validación
// import { schema, rules } from '@adonisjs/core/validator'
import app from '@adonisjs/core/services/app'
import { cuid } from '@adonisjs/core/helpers'
import { DateTime } from 'luxon'
import { unlink, existsSync } from 'node:fs' // Importar para manejar archivos

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
    const data = request.only([
      'titulo',
      'descripcion',
      'estado_id',
      'prioridad_id',
      'empresas_id',
      'usuario_asignado_id',
      'categoria_id',
      'servicio_id',
      'userId',
    ])

    const archivoAdjunto = request.file('archivo_adjunto', {
      size: '5mb',
      extnames: ['jpg', 'jpeg', 'png', 'pdf', 'doc', 'docx', 'xls', 'xlsx'],
    })

    let uploadedFileName: string | null = null

    if (archivoAdjunto) {
      if (!archivoAdjunto.isValid) {
        return response.badRequest({
          message: 'Archivo adjunto inválido',
          errors: archivoAdjunto.errors,
        })
      }

      uploadedFileName = `${cuid()}.${archivoAdjunto.extname}`
      await archivoAdjunto.move(app.publicPath('uploads/tickets'), {
        name: uploadedFileName,
        overwrite: true,
      })
    }

    const ticketData: Partial<Ticket> = {
      titulo: data.titulo,
      descripcion: data.descripcion,
      estadoId: data.estado_id,
      prioridadId: data.prioridad_id,
      empresasId: data.empresas_id,
      categoriaId: data.categoria_id,
      servicioId: data.servicio_id,
      nombreArchivo: uploadedFileName,
      creadorId: data.userId,
    }
    if (data.usuario_asignado_id) {
      ticketData.usuarioAsignadoId = data.usuario_asignado_id
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
      usuarioId: data.userId, // corregido
      fechaCambio: DateTime.now(),
    })

    // Cargar relaciones
    await ticket.load('usuarioAsignado')
    await ticket.load('categoria')
    await ticket.load('empresa')
    await ticket.load('servicio')
    await ticket.load('estado')
    await ticket.load('prioridad')
    await ticket.load('creador')

    return response.created(ticket)
  }

  /**
   * Actualizar un ticket existente.
   */
  async update({ params, request, response }: HttpContext) {
    const ticket = await Ticket.find(params.id)
    if (!ticket) {
      return response.notFound({ message: 'Ticket no encontrado' })
    }

    const data = request.only([
      'titulo',
      'descripcion',
      'estado_id',
      'prioridad_id',
      'empresas_id',
      'usuario_asignado_id',
      'categoria_id',
      'servicio_id',
      'clear_adjunto',
      'usuario_id',
    ])

    const archivoAdjunto = request.file('archivo_adjunto', {
      size: '5mb',
      extnames: ['jpg', 'jpeg', 'png', 'pdf', 'doc', 'docx', 'xls', 'xlsx'],
    })

    if (data.clear_adjunto) {
      if (ticket.nombreArchivo) {
        const filePath = app.publicPath(`uploads/tickets/${ticket.nombreArchivo}`)
        if (existsSync(filePath)) {
          unlink(filePath, (err) => {
            if (err) console.error('Error al eliminar archivo adjunto:', err)
          })
        }
        ticket.nombreArchivo = null
      }
    } else if (archivoAdjunto) {
      if (!archivoAdjunto.isValid) {
        return response.badRequest({
          message: 'Archivo adjunto inválido',
          errors: archivoAdjunto.errors,
        })
      }

      if (ticket.nombreArchivo) {
        const oldFilePath = app.publicPath(`uploads/tickets/${ticket.nombreArchivo}`)
        if (existsSync(oldFilePath)) {
          unlink(oldFilePath, (err) => {
            if (err) console.error('Error al eliminar archivo adjunto anterior:', err)
          })
        }
      }

      const newFileName = `${cuid()}.${archivoAdjunto.extname}`
      await archivoAdjunto.move(app.publicPath('uploads/tickets'), {
        name: newFileName,
        overwrite: true,
      })

      ticket.nombreArchivo = newFileName
    }

    const estadoAnteriorId = ticket.estadoId
    const { usuario_id: usuarioId, ...restoData } = data

    ticket.merge(restoData)

    if (data.usuario_asignado_id !== undefined) {
      if (ticket.usuarioAsignadoId !== data.usuario_asignado_id) {
        ticket.usuarioAsignadoId = data.usuario_asignado_id
        ticket.fechaAsignacion = data.usuario_asignado_id !== null ? DateTime.now() : null
      }
    }

    if (data.estado_id !== undefined) ticket.estadoId = data.estado_id
    if (data.prioridad_id !== undefined) ticket.prioridadId = data.prioridad_id
    if (data.empresas_id !== undefined) ticket.empresasId = data.empresas_id
    if (data.categoria_id !== undefined) ticket.categoriaId = data.categoria_id
    if (data.servicio_id !== undefined) ticket.servicioId = data.servicio_id

    await ticket.save()

    // ✅ Comentario del historial usando nombres de estados
    if (estadoAnteriorId !== restoData.estado_id && usuarioId) {
      const estadoAnterior = await EstadoTicket.find(estadoAnteriorId)
      const estadoNuevo = await EstadoTicket.find(restoData.estado_id)

      const comentarioTexto = `Cambio de estado: ${estadoAnterior?.nombre || estadoAnteriorId} → ${estadoNuevo?.nombre || restoData.estado_id}`

      await HistorialEstadosTicket.create({
        ticketId: ticket.id,
        estadoId: ticket.estadoId,
        comentario: comentarioTexto,
        usuarioId: usuarioId,
        fechaCambio: DateTime.now(),
      })
    }
    const estado = await EstadoTicket.find(ticket.estadoId)
    await NotificacionesController.crearParaTodos({
      titulo: 'Cambio de estado',
      mensaje: `El ticket #${ticket.id} cambió de estado a ${estado?.nombre || 'nuevo estado'}`,
      ticketId: ticket.id,
      estadoId: 1,
    })

    const estadoCerrado = await EstadoTicket.findBy('nombre', 'Cerrado')

    if (estadoCerrado && ticket.estadoId === estadoCerrado.id) {
      ticket.fechaFinalizacion = DateTime.now()
    } else if (ticket.fechaFinalizacion) {
      // Si estaba cerrado y ahora no, limpia la fecha
      ticket.fechaFinalizacion = null
    }

    await ticket.load('usuarioAsignado')
    await ticket.load('categoria')
    await ticket.load('empresa')
    await ticket.load('servicio')
    await ticket.load('estado')
    await ticket.load('prioridad')
    await ticket.load('creador')

    return response.ok(ticket)
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
        unlink(filePath, (err) => {
          if (err) console.error('Error al eliminar archivo adjunto al destruir ticket:', err)
        })
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

    // `download` automáticamente establece los headers para descarga o visualización
    return response.download(filePath)
  }

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
        .orderBy('created_at', 'desc')

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

