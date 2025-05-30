// app/Controllers/Http/TicketsController.ts

import { HttpContext } from '@adonisjs/core/http'
import Ticket from '../models/tickets.js'
// Comentadas las importaciones de schema y rules para eliminar la validación
// import { schema, rules } from '@adonisjs/core/validator'
import app from '@adonisjs/core/services/app'
import { cuid } from '@adonisjs/core/helpers'
import { DateTime } from 'luxon'

export default class TicketsController {
  /**
   * Listar todos los tickets.
   * Incluye las relaciones para mostrar los nombres en el frontend.
   */
  async index({ response }: HttpContext) {
    const tickets = await Ticket.query()

      .preload('usuarioAsignado')
      .preload('categoria')
      .preload('servicio')
      .preload('estado')
      .preload('prioridad')
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
      .preload('servicio')
      .preload('estado')
      .preload('prioridad')
      .firstOrFail()
    return response.ok(ticket)
  }

  /**
   * Crear un nuevo ticket.
   * ¡ADVERTENCIA! Validación removida temporalmente.
   */
  async store({ request, response }: HttpContext) {
    // Ya no usamos request.validate(). Accedemos a los campos directamente.
    // Esto es DANGEROUS para producción.
    const titulo = request.input('titulo')
    const descripcion = request.input('descripcion')
    const estado_id = request.input('estado_id')
    const prioridad_id = request.input('prioridad_id')
    const usuario_asignado_id = request.input('usuario_asignado_id')
    const categoria_id = request.input('categoria_id')
    const servicio_id = request.input('servicio_id')
    const archivo_adjunto = request.file('archivo_adjunto') // Obtener el archivo directamente

    let adjuntoUrl: string | null = null

    if (archivo_adjunto) {
      const fileName = `${cuid()}.${archivo_adjunto.extname}`
      await archivo_adjunto.move(app.tmpPath('uploads'), {
        name: fileName,
        overwrite: true,
      })
      adjuntoUrl = `/uploads/${fileName}`
    }

    const ticket = await Ticket.create({
      titulo: titulo,
      descripcion: descripcion,
      estadoId: estado_id,
      prioridadId: prioridad_id,
      usuarioAsignadoId: usuario_asignado_id,
      categoriaId: categoria_id,
      servicioId: servicio_id,
      fechaAsignacion: DateTime.now(),
    })


    await ticket.load('usuarioAsignado')
    await ticket.load('categoria')
    await ticket.load('servicio')
    await ticket.load('estado')
    await ticket.load('prioridad')

    return response.created(ticket)
  }

  /**
   * Actualizar un ticket existente.
   * ¡ADVERTENCIA! Validación removida temporalmente.
   */
  async update({ params, request, response }: HttpContext) {
    const ticket = await Ticket.find(params.id)
    if (!ticket) {
      return response.notFound({ message: 'Ticket no encontrado' })
    }

    // Ya no usamos request.validate(). Accedemos a los campos directamente.
    const data = request.only([
      'titulo',
      'descripcion',
      'estado_id',
      'prioridad_id',
      'cliente_id',
      'usuario_asignado_id',
      'categoria_id',
      'servicio_id',
      'clear_adjunto', // Mantener esto si lo necesitas para la lógica del adjunto
    ])
    const archivo_adjunto = request.file('archivo_adjunto')


    // Actualizar solo los campos que fueron enviados en la solicitud
    // Aquí usamos un enfoque más manual para evitar sobrescribir con undefined si un campo no se envía
    if (data.titulo !== undefined) ticket.titulo = data.titulo
    if (data.descripcion !== undefined) ticket.descripcion = data.descripcion
    if (data.estado_id !== undefined) ticket.estadoId = data.estado_id
    if (data.prioridad_id !== undefined) ticket.prioridadId = data.prioridad_id

    if (data.usuario_asignado_id !== undefined) ticket.usuarioAsignadoId = data.usuario_asignado_id
    if (data.categoria_id !== undefined) ticket.categoriaId = data.categoria_id
    if (data.servicio_id !== undefined) ticket.servicioId = data.servicio_id
    // Siempre actualizamos adjuntoUrl basado en la lógica de archivo_adjunto / clear_adjunto
    await ticket.save()

    await ticket.load('usuarioAsignado')
    await ticket.load('categoria')
    await ticket.load('servicio')
    await ticket.load('estado')
    await ticket.load('prioridad')

    return response.ok(ticket)
  }

  /**
   * Eliminar un ticket.
   */
  async destroy({ params, response }: HttpContext) {
    const ticket = await Ticket.find(params.id)
    if (!ticket) {
      return response.notFound({ message: 'Ticket no encontrado' })
    }

    await ticket.delete()
    return response.ok({ mensaje: 'Ticket eliminado correctamente' })
  }
}
