import { HttpContext } from '@adonisjs/core/http'
import Ticket from '#models/tickets'
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
      .preload('empresa')
      .preload('servicio')
      .preload('estado')
      .preload('prioridad')
      .orderBy('id', 'desc') // Ordena por ID descendente para mostrar los más recientes primero
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
      .firstOrFail()
    return response.ok(ticket)
  }

  /**
   * Crear un nuevo ticket.
   * ¡ADVERTENCIA! Validación removida temporalmente. (Recomendado: reintroducir validación)
   */
  async store({ request, response }: HttpContext) {
    // Es mejor usar request.only para obtener todos los datos a la vez
    const data = request.only([
      'titulo',
      'descripcion',
      'estado_id',
      'prioridad_id',
      'empresas_id',
      'usuario_asignado_id', // Nombre recibido del frontend
      'categoria_id',
      'servicio_id',
    ])
    const archivoAdjunto = request.file('archivo_adjunto')

    if (archivoAdjunto) {
      const fileName = `${cuid()}.${archivoAdjunto.extname}`
      await archivoAdjunto.move(app.tmpPath('uploads'), {
        name: fileName,
        overwrite: true,
      })
      // Si guardas la ruta del archivo, podrías añadirla al ticket
      // ticket.nombreArchivoAdjunto = fileName
    }

    // Crear un objeto para los datos del ticket
    const ticketData: Partial<Ticket> = {
      titulo: data.titulo,
      descripcion: data.descripcion,
      estadoId: data.estado_id,
      prioridadId: data.prioridad_id,
      empresasId: data.empresas_id,
      categoriaId: data.categoria_id,
      servicioId: data.servicio_id,
    }

    // Lógica para usuarioAsignadoId y fechaAsignacion
    if (data.usuario_asignado_id) {
      ticketData.usuarioAsignadoId = data.usuario_asignado_id // Asigna el ID del usuario
      ticketData.fechaAsignacion = DateTime.now() // <--- ASIGNAR FECHA ACTUAL DE LUXON
    } else {
      // Si no hay usuario_asignado_id, asegúrate de que sean nulos (si es permitido por DB/modelo)
      ticketData.usuarioAsignadoId = null
      ticketData.fechaAsignacion = null
    }

    const ticket = await Ticket.create(ticketData)

    // Precargar las relaciones para la respuesta
    await ticket.load('usuarioAsignado')
    await ticket.load('categoria')
    await ticket.load('empresa')
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
      'empresas_id', // Incluir cliente_id en los datos a actualizar
      'usuario_asignado_id',
      'categoria_id',
      'servicio_id',
      'clear_adjunto', // Mantener esto si lo necesitas para la lógica del adjunto
    ])
    const archivoAdjunto = request.file('archivo_adjunto')

    // Actualizar solo los campos que fueron enviados en la solicitud
    if (data.titulo !== undefined) ticket.titulo = data.titulo
    if (data.descripcion !== undefined) ticket.descripcion = data.descripcion
    if (data.estado_id !== undefined) ticket.estadoId = data.estado_id
    if (data.prioridad_id !== undefined) ticket.prioridadId = data.prioridad_id

    // Manejar cliente_id: puede ser un número o null
    if (data.empresas_id !== undefined) ticket.empresasId = data.empresas_id

    if (data.usuario_asignado_id !== undefined) {
      // Si el usuario asignado cambia O se asigna por primera vez
      if (ticket.usuarioAsignadoId !== data.usuario_asignado_id) {
        ticket.usuarioAsignadoId = data.usuario_asignado_id
        if (data.usuario_asignado_id !== null) {
          // Si se asigna a alguien
          ticket.fechaAsignacion = DateTime.now() // Actualiza la fecha de asignación
        } else {
          // Si se desasigna
          ticket.fechaAsignacion = null // O la dejas como estaba, dependiendo de tu lógica
        }
      }
    }

    if (data.categoria_id !== undefined) ticket.categoriaId = data.categoria_id
    if (data.servicio_id !== undefined) ticket.servicioId = data.servicio_id

    // Lógica para el archivo adjunto en la actualización
    if (data.clear_adjunto) {
    } else if (archivoAdjunto) {
      const fileName = `${cuid()}.${archivoAdjunto.extname}`
      await archivoAdjunto.move(app.tmpPath('uploads'), {
        name: fileName,
        overwrite: true,
      })
    }

    await ticket.save()

    // Precargar las relaciones para la respuesta

    await ticket.load('usuarioAsignado')
    await ticket.load('categoria')
    await ticket.load('empresa') // Asegúrate de que la relación empresa esté definida en el modelo Ticket
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
