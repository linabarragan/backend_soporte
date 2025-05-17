import { BaseSeeder } from '@adonisjs/lucid/seeders'
import Cliente from '#models/clientes'
import { ClienteFactory } from '#database/factories/clientes_factory'
import Database from '@adonisjs/lucid/services/db'

export default class extends BaseSeeder {
  async run() {
    // Limpia tabla antes de insertar
    await Database.from('clientes').delete()

    // Cliente fijo
    await Cliente.create({
      primer_nombre: 'Carlos',
      segundo_nombre: 'Andrés',
      primer_apellido: 'Ramírez',
      segundo_apellido: 'Gómez',
      telefono: '3004567890',
      correo_primario: 'carlos.ramirez@example.com',
      correo_secundario: 'carlos.secundario@example.com',
      empresaId: 1, // Asegúrate que esta empresa exista
    })

    // Clientes aleatorios con factory
    await ClienteFactory.createMany(49)
  }
}
