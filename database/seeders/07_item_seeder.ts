//import db from '@adonisjs/lucid/services/db' // Importa el servicio de base de datos
import { BaseSeeder } from '@adonisjs/lucid/seeders'
import Item from '#models/items'

export default class ItemSeeder extends BaseSeeder {
  async run() {
    await Item.createMany([
      {
        nombre: 'Dashboard',
        url: '/dashboard',
        icon: 'mdi-view-dashboard',
      },
      {
        nombre: 'Perfil',
        url: '/profile',
        icon: 'mdi-account',
      },
      {
        nombre: 'Roles',
        url: '/roles-crud',
        icon: 'mdi-account-group',
      },
      {
        nombre: 'Permisos',
        url: '/permisos',
        icon: 'mdi-account-group-outline',
      },
      {
        nombre: 'Crear Ticket',
        url: '/tickets',
        icon: 'mdi-ticket',
      },
      {
        nombre: 'Historial Tickets',
        url: '/historial-tickets',
        icon: 'mdi-history',
      },
      {
        nombre: 'Usuarios',
        url: '/Usuarios',
        icon: 'mdi-table',
      },
      {
        nombre: 'Empresas',
        url: '/formulario-empresas',
        icon: 'mdi-domain',
      },
      {
        nombre: 'Proyectos',
        url: '/proyectos',
        icon: 'mdi-domain',
      },
      {
        nombre: 'Notificaciones',
        url: '/Notificaciones',
        icon: 'mdi-history',
      },
    ])
  }
}
