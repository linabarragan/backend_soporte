import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'tickets'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').notNullable()
      table.string('titulo', 255).notNullable()
      table.text('descripcion').notNullable()
      table
        .integer('estado_id')
        .unsigned()
        .references('id')
        .inTable('estado_tickets')
        .onDelete('SET NULL')
        .defaultTo(1)
      table
        .integer('prioridad_id')
        .unsigned()
        .references('id')
        .inTable('prioridads')
        .onDelete('SET NULL')
      table
        .integer('cliente_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('clientes')
        .onDelete('CASCADE')
      table
        .integer('usuario_asignado_id')
        .unsigned()
        .references('id')
        .inTable('usuarios')
        .onDelete('SET NULL')
      table
        .integer('categoria_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('categorias')
        .onDelete('CASCADE')
      table
        .integer('servicio_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('servicios')
        .onDelete('CASCADE')
      table
        .integer('proyecto_id')
        .unsigned()
        .references('id')
        .inTable('proyectos')
        .onDelete('SET NULL')
      table.timestamp('fecha_asignacion', { useTz: true }).defaultTo(this.now())
      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
