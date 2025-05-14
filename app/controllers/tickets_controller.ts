import { HttpContext } from '@adonisjs/core/http'
import Ticket from '../models/tickets.js'

export default class TicketsController {
  public async list({ response }: HttpContext) {
    const tickets = await Ticket.all()
    return response.ok(tickets)
  }

  public async store({ request, response }: HttpContext) {
    const data = request.only([
      'titulo',
      'descripcion',
      'estado',
      'prioridad',
      'cliente',
      'usuarioasignado',
      'categoria',
      'servicio',
      'proyecto',
    ])
    const ticket = await Ticket.create(data)
    return response.created(ticket)
  }
}
