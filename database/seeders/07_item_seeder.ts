import db from '@adonisjs/lucid/services/db' // Importa el servicio de base de datos
import { BaseSeeder } from '@adonisjs/lucid/seeders'

export default class ItemSeeder extends BaseSeeder {
  async run() {
    // Inserta aquí los ítems que corresponden a las vistas de tu sidebar
    await db.table('items').insert([
      { id: 1, nombre: 'Dashboard' },
      { id: 2, nombre: 'Profile' },
      { id: 3, nombre: 'Settings' },
      { id: 4, nombre: 'Usuarios' },
      { id: 5, nombre: 'Tickets' },
      { id: 6, nombre: 'Empresas' },
      { id: 7, nombre: 'Proyectos' },
      { id: 8, nombre: 'Asignar Permisos' }, // Esta es la vista actual
      // Puedes añadir más ítems si tienes otras secciones en tu aplicación que quieras controlar
      // { id: 9, nombre: 'Facturación' },
      // { id: 10, nombre: 'Reportes Detallados' },
    ])
  }
}
