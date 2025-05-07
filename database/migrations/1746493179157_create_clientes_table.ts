import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'clientes'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.string('primer_nombre', 100).notNullable()
      table.string('segundo_nombre', 100).notNullable()
      table.string('primer_apellido', 100).notNullable()
      table.string('segundo_apellido', 100).notNullable()
      table.string('telefono', 20).notNullable()
      table.string('correo_primario', 150).notNullable().unique()
      table.string('correo_secundario', 150).notNullable().unique()
      table
        .integer('empresa_id')
        .unsigned()
        .references('id')
        .inTable('empresas')
        .onDelete('CASCADE')
        .notNullable()
      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
