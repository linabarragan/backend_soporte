import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Usuario from './usuarios.js'
import Rol from '#models/roles'

export default class UsuariosRol extends BaseModel {
  public static table = 'usuario_roles'
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare usuarioId: number

  @column()
  declare rolId: number

  @belongsTo(() => Usuario)
  declare usuario: BelongsTo<typeof Usuario>

  @belongsTo(() => Rol)
  declare rol: BelongsTo<typeof Rol>
}
