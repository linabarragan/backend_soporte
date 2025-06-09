import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'usuarios'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.string('nombre', 100).notNullable()
      table.string('apellido', 100).notNullable()
      table.string('telefono', 20).notNullable()
      table.string('correo', 255).notNullable().unique()
      table.string('foto_perfil', 255).nullable()
      table.string('password', 180).notNullable()

      // ===========================================
      // ¡AQUÍ ES DONDE NECESITAS AÑADIR LA COLUMNA rol_id!
      // ===========================================
      table
        .integer('rol_id') // Define la columna como un entero
        .unsigned() // Asegura que sea un entero sin signo (para IDs positivos)
        .references('id') // Referencia la columna 'id'
        .inTable('roles') // De la tabla 'roles'
        .onDelete('SET NULL') // Si un rol es eliminado, establece rol_id en NULL en usuarios
        .nullable() // Permite que un usuario pueda existir sin un rol asignado inicialmente

      table.timestamp('created_at', { useTz: true }).notNullable() // Con useTz para consistencia
      table.timestamp('updated_at', { useTz: true }).notNullable() // Con useTz para consistencia
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
