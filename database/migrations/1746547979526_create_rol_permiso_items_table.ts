import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'rol_permiso_items'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.integer('rol_id').unsigned().references('id').inTable('rols').onDelete('CASCADE')
      table.integer('item_id').unsigned().references('id').inTable('items').onDelete('CASCADE')

      table
        .integer('permiso_id')
        .unsigned()
        .references('id')
        .inTable('permisos')
        .onDelete('CASCADE')

      table.primary(['rol_id', 'permiso_id', 'item_id'])

      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
