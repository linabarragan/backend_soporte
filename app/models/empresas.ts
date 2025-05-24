import { DateTime } from 'luxon'
import { BaseModel, column, hasMany } from '@adonisjs/lucid/orm'
// import type { ManyToMany } from '@adonisjs/lucid/types/relations'
import type { HasMany } from '@adonisjs/lucid/types/relations'
// import Usuario from '../models/usuarios.js'
import Proyecto from './proyectos.js'

export default class Empresas extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare nombre: string

  @column()
  declare nit: string

  @column()
  declare correo: string

  @column()
  declare telefono: string

  @hasMany(() => Proyecto, {
    foreignKey: 'empresa_id', // 👈 clave foránea en el modelo Proyecto
  })
  declare proyectos: HasMany<typeof Proyecto>

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}
