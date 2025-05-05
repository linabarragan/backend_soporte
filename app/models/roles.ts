import { DateTime } from 'luxon'
import { BaseModel, column, manyToMany, ManyToMany } from '@ioc:Adonis/Lucid/Orm'
import Usuario from './Usuario'
import Permiso from './Permiso'

export default class Rol extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare nombre: string

  @column()
  declare descripcion: string

  @column()
  declare estado: string

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @manyToMany(() => Usuario, {
    pivotTable: 'usuarios_roles',
  })
  declare usuarios: ManyToMany<typeof Usuario>

  @manyToMany(() => Permiso, {
    pivotTable: 'roles_permisos_item',
  })
  declare permisos: ManyToMany<typeof Permiso>
}
