import type { HttpContext } from '@adonisjs/core/http'
import Usuario from '../models/usuarios.js'
import Hash from '@adonisjs/core/services/hash'

export default class UsuariosController {
  async index({ response }: HttpContext) {
    const usuarios = await Usuario.all()
    return response.ok(usuarios)
  }

  async store({ request, response }: HttpContext) {
    const data = request.only(['nombre', 'apellido', 'telefono', 'correo', 'password'])

    const usuario = await Usuario.create({
      nombre: data.nombre,
      apellido: data.apellido,
      telefono: data.telefono,
      correo: data.correo,
      password: await Hash.make(data.password),
    })
    console.log('usuarioPayload:', usuario)
    return response.created(usuario)
  }

  async show({ params, response }: HttpContext) {
    const usuario = await Usuario.findOrFail(params.id)
    return response.ok(usuario)
  }

  async update({ params, request, response }: HttpContext) {
    const usuario = await Usuario.findOrFail(params.id)
    const data = request.only(['nombre', 'apellido', 'telefono', 'correo'])

    usuario.merge(data)
    await usuario.save()

    return response.ok(usuario)
  }

  async destroy({ params, response }: HttpContext) {
    const usuario = await Usuario.findOrFail(params.id)
    await usuario.delete()

    return response.noContent()
  }
}
