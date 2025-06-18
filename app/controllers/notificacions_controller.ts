import type { HttpContext } from '@adonisjs/core/http'
import Notificacion from '#models/notificaciones'
import Usuario from '#models/usuarios'
import Ticket from '#models/tickets' // ¡Importante!

export default class NotificacionesController {
  /**
   * Listar notificaciones del usuario logueado
   */
  public async index({ request, response }: HttpContext) {
    const usuarioId = request.input('usuarioId')

    if (!usuarioId) {
      return response.status(400).json({ mensaje: 'usuarioId es requerido' })
    }

    const notificaciones = await Notificacion.query()
      .where('usuario_id', usuarioId)
      .orderBy('created_at', 'desc')

    return notificaciones
  }

  /**
   * Marcar una notificación como leída
   */
  public async marcarComoLeida({ params, response }: HttpContext) {
    const notificacion = await Notificacion.find(params.id)

    if (!notificacion) {
      return response.status(404).json({ mensaje: 'Notificación no encontrada' })
    }

    notificacion.leido = true
    await notificacion.save()

    return { mensaje: 'Notificación marcada como leída' }
  }

  /**
   * Crea una notificación para el creador de un ticket específico.
   * Este método es llamado desde otros controladores (ej. TicketsController).
   * @param data Los datos de la notificación, incluyendo el ID del ticket.
   */
  public static async crearParaCreadorTicket(data: {
    titulo: string
    mensaje: string
    ticketId: number
    estadoId?: number // Opcional para el tipo de estado de la notificación
  }) {
    try {
      // 1. Encontrar el ticket para obtener el ID de su creador
      const ticket = await Ticket.find(data.ticketId)
      if (!ticket) {
        console.warn(`[NotificacionesController] No se encontró el ticket con ID ${data.ticketId}. No se pudo crear la notificación para el creador.`)
        return // Salir si el ticket no existe
      }

      // 2. Crear la notificación para el usuario creador del ticket
      const notificacionData = {
        titulo: data.titulo,
        mensaje: data.mensaje,
        ticketId: data.ticketId,
        estadoId: data.estadoId, // Este es el ID de estado para la notificación
        usuarioId: ticket.creadorId, // ¡La notificación es SOLO para el creador del ticket!
        leido: false,
      }

      await Notificacion.create(notificacionData) // Usamos `create` porque es una sola notificación
      console.log(`Notificación de cambio de estado creada para el creador del ticket #${data.ticketId} (Usuario ID: ${ticket.creadorId}).`)

    } catch (error) {
      console.error('[NotificacionesController] Error al crear notificación para el creador del ticket:', error)
    }
  }

  // El método 'crearParaTodos' fue reemplazado por 'crearParaCreadorTicket'.
  // Si lo necesitas para otros fines no relacionados con tickets, puedes crearlo como un método aparte.
}