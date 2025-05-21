import { HttpContext } from '@adonisjs/core/http'
import Cliente from '../models/clientes.js' // Ajusta la ruta

export default class ClientesController {
  async index({ response }: HttpContext) {
    const clientes = await Cliente.all()
    return response.ok(clientes)
  }
}