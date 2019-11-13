const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const Users = require('./userModel');


router.post('/register', validateUserData, (req, res) => {

  const userData = req.body;
  const hashedPassword = bcrypt.hashSync(userData.password, 12);
  userData.password = hashedPassword;

  Users.addUser(userData)
    .then(user =>{
      const token = createToken(user);
      user.token = token;
      res.status(201).send(user);
    })
    .catch(error => {
      console.log(error);
      res.status(500).send({message: 'The user could not be registered. Please try again.'});
    })

});

router.post('/login', validateUserLogin, (req, res) => {
  const { username, password } = req.body;
  
  Users.getUserBy({ username })
    .then(user => {
      if (user && bcrypt.compareSync(password, user.password)) {
        const token = createToken(user);
        user.token = token;
        res.status(200).send(user);
      } else {
        res.status(401).send({message: 'You shall not pass.'});
      }
    })
    .catch(err => {
      console.log(err);
      res.status(500).send({message: 'There was an error with the db. Try again.'});
    })
});

router.get('/users', checkUserLoggedIn, (req, res) => {
  Users.getUsers()
    .then(users => {
      res.status(200).send(users);
    })
    .catch(err => {
      console.log(err);
      res.status(500).send({message: 'There was an error in getting users from the database. Try again.'})
    })
});


function validateUserData(req, res, next) {
  const user = req.body;

  if(!user.username || !user.password || !user.department) {
    res.status(400).send({message: 'Username, password and department are required.'});
  } else {
    next();
  }
};

function validateUserLogin (req, res, next) {
  const user = req.body;

  if (!user.username || !user.password) {
    res.status(400).send({message: 'The username and password are required.'});
  } else {
    next();
  }
};

function createToken(user) {
  const secret = process.env.JWT_SECRET || 'This is a secret';

  const payload = {
    id: user.id,
    username: user.username
  };

  const options = {
    expiresIn: '2h'
  };

  return jwt.sign(payload, secret, options);
};

function checkUserLoggedIn(req, res, next) {
  const token = req.headers.authorization;

  if (token) {
    const secret = process.env.JWT_SECRET || 'This is a secret';
    jwt.verify(token, secret, function(err, decoded) {
      if (err) {
        console.log(err);
        res.status(401).send({message: 'Invalid credentials'});    
      } else {
        req.decodedToken = decoded;
        next();
      }
    });
  } else {
    res.status(403).send({message: 'Please provide credentials'});
  }
};

module.exports = router;
