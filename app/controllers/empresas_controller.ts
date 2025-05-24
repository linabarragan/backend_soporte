import type { HttpContext } from '@adonisjs/core/http'
import Empresa from '#models/empresas'

export default class EmpresasController {
  // Obtener todas las empresas
  public async index({ response }: HttpContext) {
    try {
      const empresas = await Empresa.all()
      return response.ok(empresas)
    } catch (error) {
      return response.status(500).json({ mensaje: 'Error al obtener empresas' })
    }
  }

  // Crear una empresa
  public async store({ request, response }: HttpContext) {
    try {
      const datos = request.only(['nombre', 'nit', 'correo', 'telefono'])
      const empresa = await Empresa.create(datos)
      return response.created(empresa)
    } catch (error) {
      return response.status(500).json({ mensaje: 'Error al crear empresa' })
    }
  }

  // Actualizar una empresa por ID
  public async update({ params, request, response }: HttpContext) {
    try {
      const empresa = await Empresa.findOrFail(params.id)
      const datos = request.only(['nombre', 'nit', 'correo', 'telefono'])
      empresa.merge(datos)
      await empresa.save()
      return response.ok(empresa)
    } catch (error) {
      return response.status(500).json({ mensaje: 'Error al actualizar empresa' })
    }
  }

  // Eliminar una empresa por ID
  public async destroy({ params, response }: HttpContext) {
    try {
      const empresa = await Empresa.findOrFail(params.id)
      await empresa.delete()
      return response.ok({ mensaje: 'Empresa eliminada correctamente' })
    } catch (error) {
      return response.status(500).json({ mensaje: 'Error al eliminar empresa' })
    }
  }
}
