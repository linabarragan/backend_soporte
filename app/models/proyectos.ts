import { DateTime } from 'luxon'
import { BaseModel, column, manyToMany } from '@adonisjs/lucid/orm'
import Empresa from './empresas.js'
import type { ManyToMany } from '@adonisjs/lucid/types/relations'

export default class Proyecto extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare nombre: string

  @manyToMany(() => Empresa, {
    pivotTable: 'proyecto_empresa',
  })
  declare empresas: ManyToMany<typeof Empresa>

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}
