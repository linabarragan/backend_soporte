import { DateTime } from 'luxon'
import Hash from '@adonisjs/core/services/hash'
import { compose } from '@adonisjs/core/helpers'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm' // Agrega 'belongsTo' aquí
import { withAuthFinder } from '@adonisjs/auth/mixins/lucid'
import { DbAccessTokensProvider } from '@adonisjs/auth/access_tokens'
import Rol from './roles.js' // Importa tu modelo de Rol. Asegúrate de que la ruta sea correcta.
import type { BelongsTo } from '@adonisjs/lucid/types/relations' // Importa BelongsTo para tipado

const AuthFinder = withAuthFinder(() => Hash.use('scrypt'), {
  uids: ['correo'],
  passwordColumnName: 'password',
})

export default class Usuario extends compose(BaseModel, AuthFinder) {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare nombre: string

  @column()
  declare apellido: string

  @column()
  declare telefono: string

  @column()
  declare correo: string

  @column({ serializeAs: null }) // 👈 Oculta este campo en la API
  declare password: string

  // ¡NUEVA COLUMNA PARA EL ID DEL ROL!
  // Asume que la columna en la base de datos se llama 'rol_id'.
  // Si tu columna en la DB se llama 'rolId' directamente, puedes omitir '{ columnName: 'rol_id' }'.
  @column({ columnName: 'rol_id' })
  declare rolId: number

  // ¡NUEVA RELACIÓN PARA EL ROL!
  // Define la relación de pertenencia (belongsTo) con el modelo Rol.
  // 'foreignKey' es la columna en esta tabla (usuarios) que referencia a la otra tabla (roles).
  // 'localKey' es la columna en la otra tabla (roles) que es referenciada.
  @belongsTo(() => Rol, {
    foreignKey: 'rolId', // La foreign key en el modelo Usuario
    localKey: 'id',      // La primary key en el modelo Rol
  })
  declare role: BelongsTo<typeof Rol> // El nombre de la relación que usarás en .preload('role')

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  static accessTokens = DbAccessTokensProvider.forModel(Usuario, {
    expiresIn: '30 days',
    prefix: 'oat_',
    table: 'auth_access_tokens',
    type: 'auth_token',
    tokenSecretLength: 40,
  })
}
