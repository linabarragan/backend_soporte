import db from '@adonisjs/lucid/services/db' // Importa el servicio de base de datos
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
        nombre: 'Settings',
        url: '/settings',
        icon: 'mdi-cog',
      },
      {
        nombre: 'Profile',
        url: '/profile',
        icon: 'mdi-account',
      },
    ])
  }
}
