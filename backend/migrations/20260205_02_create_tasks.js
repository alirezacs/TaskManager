exports.up = async function (knex) {
  await knex.schema.createTable('tasks', (table) => {
    table.increments('id').primary();
    table.integer('owner_id').unsigned().notNullable();
    table.string('title', 200).notNullable();
    table.text('description');
    table.enu('priority', ['low', 'medium', 'high']).notNullable().defaultTo('medium');
    table.enu('status', ['todo', 'done', 'hold', 'canceled']).notNullable().defaultTo('todo');
    table.date('due_date');
    table.timestamps(true, true);

    table.foreign('owner_id').references('users.id').onDelete('CASCADE');
  });
};

exports.down = async function (knex) {
  await knex.schema.dropTableIfExists('tasks');
};
