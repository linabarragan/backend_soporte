import factory from '@adonisjs/lucid/factories'
import { faker } from '@faker-js/faker'
import Proyecto from '#models/proyectos'
import Cliente from '#models/clientes'

export const ProyectoFactory = factory
  .define(Proyecto, async () => {
    const cliente = await Cliente.query().select('id').orderByRaw('RAND()').firstOrFail()

    return {
      nombre: faker.company.name(),
      clienteId: cliente.id,
    }
  })
  .build()
