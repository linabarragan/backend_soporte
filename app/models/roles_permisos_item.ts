import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Rol from './roles.js'
import Permiso from './permisos.js'
import Item from './items.js'

export default class RolesPermisosItem extends BaseModel {
  public static table = 'roles_permisos_item'

  @column({ isPrimary: true })
  declare id: number

  @column()
  declare rolId: number

  @column()
  declare permisosId: number

  @column()
  declare itemId: number

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => Rol, {
    foreignKey: 'rolId',
  })
  declare rol: BelongsTo<typeof Rol>

  @belongsTo(() => Permiso, {
    foreignKey: 'permisosId',
  })
  declare permiso: BelongsTo<typeof Permiso>

  @belongsTo(() => Item, {
    foreignKey: 'itemId',
  })
  declare item: BelongsTo<typeof Item>
}
