
exports.up = function(knex) {
  return knex.schema
    .createTable('users', tbl => {
      tbl.increments();
      tbl.string('username', 128);
      tbl.string('password', 64);
      tbl.string('department', 64);
    })
};

exports.down = function(knex) {
  return knex.schema.dropTableIfExists('users');
};
