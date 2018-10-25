const User = require('./../../models/User');

const users = [{
  name: 'John Doe',
  email: 'john.doe@mail.com',
  password: '12345',
},
{
  name: 'Matk Smith',
  email: 'smith@gmail.com',
  password: '56478',
},
];

const populateUsers = (done) => {
  // User.deleteMany({})
  //   .then(() => User.insertMany(users)).then(() => done());
  User.deleteMany({}).then(() => {
    const userOne = new User(users[0]).save();
    const userTwo = new User(users[1]).save();

    return Promise.all([userOne, userTwo]);
  }).then(() => done());
};

module.exports = {
  users,
  populateUsers,
};
