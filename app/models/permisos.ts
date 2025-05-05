import { DateTime } from 'luxon'
import { BaseModel, column, manyToMany, ManyToMany } from '@ioc:Adonis/Lucid/Orm'
import Rol from './Rol'
import Item from './Item'

export default class Permiso extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare nombre: string

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @manyToMany(() => Rol, {
    pivotTable: 'roles_permisos_item',
  })
  declare roles: ManyToMany<typeof Rol>

  @manyToMany(() => Item, {
    pivotTable: 'permisos_item',
  })
  declare items: ManyToMany<typeof Item>
}
