// import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
// import Proyecto from 'App/Models/Proyecto'
import type { HttpContext } from '@adonisjs/core/http'
import Proyecto from '#models/proyectos'
export default class ProyectosController {
  public async index({ response }: HttpContext) {
    try {
      const proyectos = await Proyecto.query().preload('empresa')

      const proyectosConEmpresa = proyectos.map((proyecto) => {
        return {
          id: proyecto.id,
          nombre: proyecto.nombre,
          empresa: proyecto.empresa
            ? {
                nombre: proyecto.empresa.nombre,
              }
            : null,
        }
      })

      return response.ok(proyectosConEmpresa)
    } catch (error) {
      return response.status(500).send({ mensaje: 'Error al obtener proyectos' })
    }
  }
  public async store({ request, response }: HttpContext) {
    try {
      const datos = request.only(['nombre', 'empresa_id'])

      const nuevoProyecto = await Proyecto.create(datos)

      await nuevoProyecto.load('empresa')

      return response.created({
        id: nuevoProyecto.id,
        nombre: nuevoProyecto.nombre,
        empresa: nuevoProyecto.empresa
          ? {
              nombre: nuevoProyecto.empresa.nombre,
            }
          : null,
      })
    } catch (error) {
      return response.status(500).send({ mensaje: 'Error al crear el proyecto' })
    }
  }
}
