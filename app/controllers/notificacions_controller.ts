// app/controllers/Http/NotificacionesController.ts

import type { HttpContext } from '@adonisjs/core/http'
import Notificacion from '#models/notificaciones'
import Usuario from '#models/usuarios'

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
   * Crear una notificación para todos los usuarios (llamado desde otros controladores)
   */
  public static async crearParaTodos(data: {
    titulo: string
    mensaje: string
    ticketId: number
    estadoId?: number
  }) {
    const usuarios = await Usuario.all()

    const notificaciones = usuarios.map((usuario) => {
      return {
        titulo: data.titulo,
        mensaje: data.mensaje,
        ticketId: data.ticketId,
        estadoId: data.estadoId !== undefined ? data.estadoId : undefined,
        usuarioId: usuario.id,
        leido: false,
      }
    })

    await Notificacion.createMany(notificaciones)
  }
}
