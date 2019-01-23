const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt-nodejs');
const models = require('../models');
const mongoose = require('mongoose');
///const bcrypt = require('bcrypt-nodejs');

//const models = require('../models');

router.post('/register', (req, res) => {
  const login = req.body.login;
  const password = req.body.password;
  const passwordConfirm = req.body.passwordConfirm;

  if(!login || !password || !passwordConfirm) {//---------
    const fields = [];
    if(!login) fields.push('login');
    if(!password) fields.push('password');
    if(!passwordConfirm) fields.push('passwordConfirm');
    res.json({
      ok:false,
      error: 'Все поля должны быть заполнены!',
      fields: fields
    });
  } else if (!/^[a-zA-Z0-9]+$/.test(login)) {
    res.json({
      ok:false,
      error: 'Только латинские символы и цифры!',
      fields: ['login']
    });
  } else if (login.length < 3 || login.length > 16) {//---------
    res.json({
      ok:false,
      error: 'Длина логина должна быть от 3 до 16 символов!',
      fields: ['login']
    });
  } else if (password !== passwordConfirm)//---------
  {
    res.json({
      ok:false,
      error: 'Пароли не совпадают!',
      fields: ['password', 'passwordConfirm']
    });
  } else if (password.length < 6 || password.length > 16)//---------
  {
    res.json({
      ok:false,
      error: 'Длина пароля должна быть 6-16 символов!',
      fields: ['password', 'passwordConfirm']
    });
  } else {//--------------------------------------
    models.user.findOne({
      login
    }).then(user => {
      if(!user) {
        console.log('all oooooooooooook');
      } else {
        console.log('is nit all ooooooooooook');
      }
    });

    bcrypt.hash(password, null, null, (err, hash) => {
    models.user.create({
      login,
      password: hash
    })
    .then(user => {
      console.log(user);
      req.session.userId = user.id;
      req.session.userLogin = user.login;
      res.json({
        ok: true
      });
    })
    .catch(err => {
      console.log(err);
      res.json({
        ok:false,
        error: "Ошибка"
      })
    });
})
  }
});

//Post is login1
router.post('/login', (req, res) => {
  console.log(req.body);
  const login = req.body.login;
  const password = req.body.password;
  if(!login || !password) {//---------
    const fields = [];
    if(!login) fields.push('login');
    if(!password) fields.push('password');
    res.json({
      ok:false,
      error: 'Все поля должны быть заполнены!',
      fields: fields
    });
  } else {
    models.user.findOne({
      login
    })
    .then(user => {
      if(!user) {
        res.json({
          ok:false,
          error: 'Логин или пароль неверны!',
          fields: ['Login', 'password']
        });
      } else {
        bcrypt.compare(password, user.password, function(err, result) {
          if(!result) {
            res.json({
              ok:false,
              error: 'Логин или пароль неверны!',
              fields: ['Login', 'password']
            });
          } else {
            req.session.userId = user.id;
            req.session.userLogin = user.login;
            res.json({
              ok:true
            });
          }
        });
      }
    })
    .catch(err => {
      console.log(err);
      res.json({
        ok:false,
        error: "Ошибка"
      })
    });
  }
});

//GET for logout
router.get('/logout', (req, res) => {
  if(req.session) {
    req.session.destroy(() => {
      res.redirect('/');
    });
  } else {
    res.redirect('/');
  }
});

module.exports = router;
