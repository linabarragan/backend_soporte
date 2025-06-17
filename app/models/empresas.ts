import { DateTime } from 'luxon'
import { BaseModel, column, hasMany } from '@adonisjs/lucid/orm'

import Proyecto from './proyectos.js' // Asegúrate de que esta ruta sea correcta (ej. Proyecto.js o proyectos.js)
import Usuario from './usuarios.js' // ✨ IMPORTA TU MODELO DE USUARIO. Asegúrate de la ruta y el nombre (Usuario.js o usuarios.js)

import type { HasMany } from '@adonisjs/lucid/types/relations'

export default class Empresa extends BaseModel {
  // Asegúrate de que el nombre del modelo sea 'Empresa' si tu archivo es 'Empresa.ts'
  // y tu tabla es 'empresas'. AdonisJS hace un buen trabajo de inferencia.
  public static table = 'empresas' // Especifica explícitamente el nombre de la tabla si no coincide con el plural del modelo

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

  // Relación HasMany con el modelo Proyecto (ya la tenías)
  @hasMany(() => Proyecto, {
    foreignKey: 'empresa_id', // La clave foránea en el modelo Proyecto que apunta a esta empresa
    localKey: 'id', // La clave primaria en este modelo (Empresa) que es referenciada
  })
  declare proyectos: HasMany<typeof Proyecto>

  // ✨ NUEVA RELACIÓN HasMany con el modelo Usuario
  @hasMany(() => Usuario, {
    foreignKey: 'empresaId', // La clave foránea en el modelo Usuario que apunta a esta empresa (la propiedad `empresaId`)
    localKey: 'id', // La clave primaria en este modelo (Empresa) que es referenciada
  })
  declare usuarios: HasMany<typeof Usuario> // El nombre de la relación para acceder a los usuarios de esta empresa

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}