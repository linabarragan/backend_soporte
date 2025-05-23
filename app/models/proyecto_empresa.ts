import { DateTime } from 'luxon'
import { BaseModel, column, manyToMany } from '@adonisjs/lucid/orm'
import type { ManyToMany } from '@adonisjs/lucid/types/relations'
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

  @manyToMany(() => Empresa, {
    pivotTable: 'proyecto_empresa',
  })
  declare empresa: ManyToMany<typeof Empresa>

  @manyToMany(() => Proyecto, {
    pivotTable: 'proyecto_empresa',
  })
  declare proyecto: ManyToMany<typeof Proyecto>
}
