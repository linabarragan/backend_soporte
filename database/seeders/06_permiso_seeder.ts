import Permiso from '#models/permisos'
import { BaseSeeder } from '@adonisjs/lucid/seeders'

export default class extends BaseSeeder {
  async run() {
    await Permiso.createMany([
      { nombre: 'crear_ticket' },
      { nombre: 'editar_ticket' },
      { nombre: 'eliminar_ticket' },
      { nombre: 'asignar_ticket' },
      { nombre: 'cambiar_estado' },
      { nombre: 'ver_todos_tickets' },
      { nombre: 'administrar_usuarios' },
      { nombre: 'generar_reportes' },
    ])
  }
}
