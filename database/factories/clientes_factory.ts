import factory from '@adonisjs/lucid/factories'
import Cliente from '#models/clientes'
import { faker } from '@faker-js/faker'
import Empresa from '#models/empresas'

export const ClienteFactory = factory
  .define(Cliente, async () => {
    // Obtener todos los IDs de empresas existentes
    const empresas = await Empresa.all()
    const empresaIds = empresas.map((e) => e.id)

    // Elegir uno aleatorio
    const empresaId = faker.helpers.arrayElement(empresaIds)

    return {
      primer_nombre: faker.person.firstName(),
      segundo_nombre: faker.person.middleName(),
      primer_apellido: faker.person.lastName(),
      segundo_apellido: faker.person.lastName(),
      telefono: '+57' + faker.string.numeric(9),
      correo_primario: faker.internet.email(),
      correo_secundario: faker.internet.email(),
      empresaId, // Ahora es aleatorio
    }
  })
  .build()
