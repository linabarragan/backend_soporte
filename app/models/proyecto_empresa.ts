import { DateTime } from 'luxon'
import { BaseModel, belongsTo, column } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Proyecto from './proyectos.js'
import Empresa from '../models/empresas.js'

export default class ProyectoEmpresa extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare proyectoId: number

  @column()
  declare empresaId: number

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => Empresa, {
    foreignKey: 'empresa_id',
  })
  declare empresa: BelongsTo<typeof Empresa>

  @belongsTo(() => Proyecto, {
    foreignKey: 'proyecto_id',
  })
  declare proyecto: BelongsTo<typeof Proyecto>
}
