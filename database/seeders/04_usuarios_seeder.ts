import { UsuariosFactory } from '#database/factories/usuarios_factory'
import { BaseSeeder } from '@adonisjs/lucid/seeders'
import Usuario from '#models/usuarios'

export default class extends BaseSeeder {
  async run() {
    await Usuario.query().delete()
    await Usuario.create({
      nombre: 'Laura',
      apellido: 'González',
      telefono: '3001234567',
      correo: 'laura@example.com',
      password: '12345678', // Se encripta automáticamente con `withAuthFinder`
    })
    await UsuariosFactory.createMany(99)
  }
}
