import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, hasMany } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Ticket from '../models/tickets.js'
import Cliente from '../models/clientes.js'
import type { HasMany } from '@adonisjs/lucid/types/relations'

export default class Proyecto extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare nombre: string

  @column()
  declare clienteId: number

  @belongsTo(() => Cliente)
  declare cliente: BelongsTo<typeof Cliente>

  @hasMany(() => Ticket)
  declare tickets: HasMany<typeof Ticket>

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}
