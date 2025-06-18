// app/Controllers/Http/EmpresasController.ts
import type { HttpContext } from '@adonisjs/core/http'
import Empresa from '#models/empresas' // Asegúrate de que el path sea correcto (Empresa o empresas)
// No necesitas importar Proyecto aquí si ya está precargado en el modelo Empresa
// y solo necesitas el conteo de proyectos.
// Si necesitas acceder a propiedades específicas de Proyecto, sí deberías importarlo.

export default class EmpresasController {
  // Obtener todas las empresas (filtradas por estado, opcionalmente)
  public async index({ request, response }: HttpContext) {
    try {
      // Obtener el parámetro 'estado' de la query string (ej: /api/empresas?estado=inactivo)
      const { estado } = request.qs()
      let empresasQuery = Empresa.query().preload('proyectos') // Precargar proyectos para el conteo

      if (estado && (estado === 'activo' || estado === 'inactivo')) {
        empresasQuery = empresasQuery.where('estado', estado)
      }
      // Si 'estado' es 'todos' o no se especifica, se traen todas por defecto (no se añade filtro)

      const empresas = await empresasQuery.orderBy('id', 'desc') // Ordenar para consistencia

      const empresasConConteo = empresas.map((empresa) => {
        const serialized = empresa.serialize()
        return {
          ...serialized,
          // Verifica que empresa.proyectos sea un array antes de acceder a .length
          proyectos: empresa.proyectos ? empresa.proyectos.length : 0, // Devuelve solo el número de proyectos
        }
      })

      return response.ok(empresasConConteo)
    } catch (error) {
      console.error(error) // Log para depuración
      return response.status(500).json({ mensaje: 'Error al obtener empresas' })
    }
  }

  // Crear una empresa
  public async store({ request, response }: HttpContext) {
    try {
      const datos = request.only(['nombre', 'nit', 'correo', 'telefono'])
      // Al crear, por defecto se establece como 'activo'
      const empresa = await Empresa.create({ ...datos, estado: 'activo' })
      return response.created(empresa)
    } catch (error) {
      console.error(error) // Log para depuración
      return response.status(500).json({ mensaje: 'Error al crear empresa' })
    }
  }

  // Actualizar una empresa por ID
  public async update({ params, request, response }: HttpContext) {
    try {
      const empresa = await Empresa.findOrFail(params.id)
      // Asegúrate de que 'estado' pueda ser actualizado si se envía desde el formulario
      const datos = request.only(['nombre', 'nit', 'correo', 'telefono', 'estado'])
      empresa.merge(datos)
      await empresa.save()
      return response.ok(empresa)
    } catch (error) {
      console.error(error) // Log para depuración
      return response.status(500).json({ mensaje: 'Error al actualizar empresa' })
    }
  }

  // Inactivar (soft delete) una empresa por ID
  public async inactivate({ params, response }: HttpContext) {
    try {
      const empresa = await Empresa.findOrFail(params.id)
      empresa.estado = 'inactivo'
      await empresa.save()
      return response.ok({ mensaje: 'Empresa inactivada correctamente' })
    } catch (error) {
      console.error(error)
      return response.status(500).json({ mensaje: 'Error al inactivar empresa' })
    }
  }

  // Activar una empresa por ID
  public async activate({ params, response }: HttpContext) {
    try {
      const empresa = await Empresa.findOrFail(params.id)
      empresa.estado = 'activo'
      await empresa.save()
      return response.ok({ mensaje: 'Empresa activada correctamente' })
    } catch (error) {
      console.error(error)
      return response.status(500).json({ mensaje: 'Error al activar empresa' })
    }
  }

  // Eliminar una empresa permanentemente por ID
  // Este método reemplaza el 'destroy' original para la eliminación física
  public async destroyPermanently({ params, response }: HttpContext) {
    try {
      const empresa = await Empresa.findOrFail(params.id)
      await empresa.delete() // Esto sí elimina el registro de la DB
      return response.ok({ mensaje: 'Empresa eliminada permanentemente' })
    } catch (error) {
      console.error(error)
      return response.status(500).json({ mensaje: 'Error al eliminar empresa permanentemente' })
    }
  }
}