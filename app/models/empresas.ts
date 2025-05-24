import { DateTime } from 'luxon'
import { BaseModel, column, hasMany, manyToMany } from '@adonisjs/lucid/orm'
import type { ManyToMany } from '@adonisjs/lucid/types/relations'
import type { HasMany } from '@adonisjs/lucid/types/relations'
import Usuario from '../models/usuarios.js'
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

  @manyToMany(() => Proyecto, {
    pivotTable: 'proyecto_empresa', // tabla intermedia
  })
  declare proyectos: ManyToMany<typeof Proyecto>

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @hasMany(() => Usuario)
  declare usuarios: HasMany<typeof Usuario>
}
