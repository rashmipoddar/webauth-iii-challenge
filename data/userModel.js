const db = require('./dbConfig');

const getUsers = () => {
  return db('users').select('id', 'username', 'department');
};

const getUserById = (id) => {
  return db('users').where({id}).select('id', 'username', 'department').first();
}

const getUserBy = (filter) => {
  return db('users').where(filter).first();
}

const addUser = (user) => {
  return db('users').insert(user)
    .then(ids => {
      return getUserById(ids[0]);
    })
};

module.exports = {
  getUsers,
  getUserBy,
  getUserById,
  addUser
}