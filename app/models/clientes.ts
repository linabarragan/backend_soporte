import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Empresa from '../models/empresas.js'

export default class Cliente extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare primer_nombre: string

  @column()
  declare segundo_nombre: string

  @column()
  declare primer_apellido: string

  @column()
  declare segundo_apellido: string

  @column()
  declare telefono: string

  @column()
  declare correo_primario: string

  @column()
  declare correo_secundario: string

  @column()
  declare empresaId: number

  @belongsTo(() => Empresa)
  declare empresa: BelongsTo<typeof Empresa>

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}
