import type { HttpContext } from '@adonisjs/core/http'
import Ticket from '#models/tickets'
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
      size: '5mb', // Límite de tamaño, ejemplo 5MB
      extnames: ['jpg', 'jpeg', 'png', 'pdf', 'doc', 'docx', 'xls', 'xlsx'],
    })

    let uploadedFileName: string | null = null // Variable para guardar el nombre del archivo subido

    if (archivoAdjunto) {
      if (!archivoAdjunto.isValid) {
        return response.badRequest({
          message: 'Archivo adjunto inválido',
          errors: archivoAdjunto.errors,
        })
      }
      uploadedFileName = `${cuid()}.${archivoAdjunto.extname}`
      await archivoAdjunto.move(app.publicPath('uploads/tickets'), {
        // CAMBIO DE PATH A publicPath
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
      nombreArchivo: uploadedFileName, // Asignar el nombre del archivo al ticket
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
    ])

    const archivoAdjunto = request.file('archivo_adjunto', {
      size: '5mb',
      extnames: ['jpg', 'jpeg', 'png', 'pdf', 'doc', 'docx', 'xls', 'xlsx'],
    })

    // Lógica para el archivo adjunto en la actualización
    if (data.clear_adjunto) {
      // Si se solicita limpiar el adjunto existente
      if (ticket.nombreArchivo) {
        const filePath = app.publicPath(`uploads/tickets/${ticket.nombreArchivo}`)
        if (existsSync(filePath)) {
          unlink(filePath, (err) => {
            // Eliminar el archivo físico
            if (err) console.error('Error al eliminar archivo adjunto:', err)
          })
        }
        ticket.nombreArchivo = null // Eliminar el registro en la DB
      }
    } else if (archivoAdjunto) {
      if (!archivoAdjunto.isValid) {
        return response.badRequest({
          message: 'Archivo adjunto inválido',
          errors: archivoAdjunto.errors,
        })
      }
      // Si ya hay un archivo existente, bórralo antes de subir el nuevo
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
        // CAMBIO DE PATH A publicPath
        name: newFileName,
        overwrite: true,
      })
      ticket.nombreArchivo = newFileName // Guardar el nombre del nuevo archivo
    }

    // Actualizar solo los campos que fueron enviados en la solicitud
    // Es mejor usar un enfoque de mapeo para evitar duplicar el código
    ticket.merge(data) // Esto aplica los cambios a las propiedades del modelo directamente

    if (data.usuario_asignado_id !== undefined) {
      if (ticket.usuarioAsignadoId !== data.usuario_asignado_id) {
        ticket.usuarioAsignadoId = data.usuario_asignado_id
        if (data.usuario_asignado_id !== null) {
          ticket.fechaAsignacion = DateTime.now()
        } else {
          ticket.fechaAsignacion = null
        }
      }
    }
    // Asegúrate de que las propiedades del modelo se actualicen con los nombres de columna correctos (camelCase)
    if (data.estado_id !== undefined) ticket.estadoId = data.estado_id
    if (data.prioridad_id !== undefined) ticket.prioridadId = data.prioridad_id
    if (data.empresas_id !== undefined) ticket.empresasId = data.empresas_id
    if (data.categoria_id !== undefined) ticket.categoriaId = data.categoria_id
    if (data.servicio_id !== undefined) ticket.servicioId = data.servicio_id

    await ticket.save()

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
}
