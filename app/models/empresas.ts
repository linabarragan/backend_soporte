import { DateTime } from 'luxon'
import { BaseModel, column, hasMany } from '@adonisjs/lucid/orm'
import type { HasMany } from '@adonisjs/lucid/types/relations'
import Usuario from '../models/usuarios.js'
import Cliente from '../models/clientes.js'

export default class Empresas extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare nombre: string

  @column()
  declare nit: string

  @column()
  declare correo: string

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @hasMany(() => Usuario)
  declare usuarios: HasMany<typeof Usuario>

  @hasMany(() => Cliente)
  declare clientes: HasMany<typeof Cliente>
}
