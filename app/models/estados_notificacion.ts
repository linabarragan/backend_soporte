import { DateTime } from 'luxon'
import { BaseModel, column, hasMany, HasMany } from '@ioc:Adonis/Lucid/Orm'
import Notificacion from './Notificacion'

export default class EstadoNotificacion extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare nombre: string

  @column()
  declare descripcion: string

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoUpdate: true, autoCreate: true })
  declare updatedAt: DateTime

  @hasMany(() => Notificacion)
  declare notificaciones: HasMany<typeof Notificacion>
}
