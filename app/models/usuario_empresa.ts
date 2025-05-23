import { DateTime } from 'luxon'
import { BaseModel, column, manyToMany } from '@adonisjs/lucid/orm'
import type { ManyToMany } from '@adonisjs/lucid/types/relations'
import Usuario from '../models/usuarios.js'
import Empresa from '../models/empresas.js'

export default class UsuarioEmpresa extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare usuarioId: number

  @column()
  declare empresaId: number

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @manyToMany(() => Empresa, {
    pivotTable: 'usuario_empresa',
  })
  declare empresa: ManyToMany<typeof Empresa>

  @manyToMany(() => Usuario, {
    pivotTable: 'usuario_empresa',
  })
  declare usuario: ManyToMany<typeof Usuario>
}
