// database/migrations/TU_TIMESTAMP_create_rol_permiso_items_table.ts

import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'rol_permiso_items'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table
        .integer('rol_id')
        .unsigned()
        .notNullable()
        .references('id')
        // ******************************************************
        // ¡CAMBIO CLAVE AQUÍ! AHORA APUNTA A 'rols'
        .inTable('rols') // <--- ¡CORREGIDO A 'rols' (singular sin 'e')!
        // ******************************************************
        .onDelete('CASCADE')

      table
        .integer('item_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('items') // Asumo que esta sigue siendo 'items'
        .onDelete('CASCADE')

      table
        .integer('permiso_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('permisos') // Asumo que esta sigue siendo 'permisos'
        .onDelete('CASCADE')

      table.primary(['rol_id', 'permiso_id', 'item_id'])

      table.timestamp('created_at', { useTz: true })
      table.timestamp('updated_at', { useTz: true })
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}