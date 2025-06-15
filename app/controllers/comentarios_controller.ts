// app/controllers/comentarios_controller.ts
import { HttpContext } from '@adonisjs/core/http'
import ComentarioTicket from '#models/comentarios_tickets'
import NotificacionesController from './notificacions_controller.js'

export default class ComentariosController {
  async store({ request, params, response }: HttpContext) {
    const ticketId = Number(params.id)
    const contenidoComentario = request.input('comentario')
    const usuarioId = request.input('usuarioId')

    if (!contenidoComentario || !contenidoComentario.trim()) {
      return response.badRequest({ message: 'El comentario no puede estar vacío' })
    }

    if (!usuarioId) {
      return response.badRequest({ message: 'El ID del usuario es obligatorio' })
    }

    const comentario = await ComentarioTicket.create({
      comentario: contenidoComentario.trim(),
      ticketId,
      usuarioId,
    })

    await NotificacionesController.crearParaTodos({
      titulo: 'Nuevo comentario',
      mensaje: `Se agregó un nuevo comentario al ticket #${ticketId}`,
      ticketId: ticketId,
    })

    await comentario.load('usuario') // Opcional para retornar con info del usuario

    return response.created(comentario)
  }
}
