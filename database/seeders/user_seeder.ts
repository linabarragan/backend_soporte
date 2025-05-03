import User from '#models/user'
import { BaseSeeder } from '@adonisjs/lucid/seeders'

export default class extends BaseSeeder {
  async run() {
    const user = await User.create({
      fullName: 'test_user',
      email: 'romain@adonisjs.com',
      password: '1234',
    })
  }
}
