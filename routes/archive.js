const express = require('express');
const router = express.Router();
const config = require('../config');
const models = require('../models');
const moment = require('moment');
const showdown = require('showdown');
moment.locale('ru');

async function posts(req, res) {
  const userId = req.session.userId;
  const userLogin = req.session.userLogin;
  const perPage = +config.PER_PAGE;
  const page = req.params.page || 1;

  try {
    let posts = await models.post.find({
      status: 'published'
    })
    .skip(perPage * page - perPage)
    .limit(perPage)
    .populate('owner')
    .populate('uploads')
    .sort({ createdAt: -1 });

    const converter = new showdown.Converter();

    posts = posts.map(post => {
      let body = post.body;
      if(post.uploads.length) {
        post.uploads.forEach(upload => {
          body = body.replace(`image${upload.id}`, `/${config.DESTINATION}${upload.path}`)
        })
      }
      return Object.assign(post, {
        body: converter.makeHtml(body)
      })
    })

    const count = await models.post.count();

    res.render('archive/index', {
      posts,
      current: page,
      pages: Math.ceil(count / perPage),
      user: {
        id: userId,
        login: userLogin
      }
    });
  } catch (error) {
    throw new Error('Server Error');
  }
}
//###0###
//Routers---------------------------------------------------
router.get('/', (req, res) => posts(req, res));
router.get('/archive/:page', (req, res) => posts(req, res));

router.get('/posts/:post', async (req, res, next) => {
  const url = req.params.post.trim().replace(/ +(?= )/g, '');
  const userId = req.session.userId;
  const userLogin = req.session.userLogin;

  if (!url) {
    const err = new Error('Not Found');
    err.status = 404;
    next(err);
  } else {
    try {
      const post = await models.post.findOne({
        url,
        status: 'published'
      })
      .populate('owner')
      .populate('uploads');

      if(!post) {
        const err = new Error('Not Found');
        err.status = 404;
        next(err);
      } else {
        const comments = await models.comment.find({
          post: post.id,
          parent: {
            $exists: false
          }
        });

            const converter = new showdown.Converter();

        let body = post.body;
        if(post.uploads.length) {
          post.uploads.forEach(upload => {
            body = body.replace(`image${upload.id}`, `/${config.DESTINATION}${upload.path}`)
          })
        }

        res.render('post/post', {
          post: Object.assign(post, {
            body: converter.makeHtml(body)
          }),
          comments,
          moment,
          user: {
            id: userId,
            login: userLogin
          }
       });
     }
    } catch (e) {
      console.log(e);
      throw new Error('Server Error');
    }
    //###1###
 }
});

//users posts--------------------------------------------------
router.get('/users/:login/:page*?', async (req, res) => {
  const userId = req.session.userId;
  const userLogin = req.session.userLogin;
  const perPage = +config.PER_PAGE;
  const page = req.params.page || 1;
  const login = req.params.login;

  try {
    const user = await models.user.findOne({
      login
    });

    let posts = await models.post.find({
      owner: user.id
    })
    .skip(perPage * page - perPage)
    .limit(perPage)
    .populate('owner')
    .sort({ createdAt: -1 })
    .populate('uploads');

    const count = await models.post.count({
        owner: user.id
      });

      const converter = new showdown.Converter();

      posts = posts.map(post => {
        let body = post.body;
        if(post.uploads.length) {
          post.uploads.forEach(upload => {
            body = body.replace(`image${upload.id}`, `/${config.DESTINATION}${upload.path}`)
          })
        }
        return Object.assign(post, {
          body: converter.makeHtml(body)
        })
      })

    const render = await res.render('archive/user', {
        posts,
        _user: user,
        current: page,
        pages: Math.ceil(count / perPage),
        user: {
          id: userId,
          login: userLogin
        }
      });

  } catch (e) {
    throw new Error('Server Error');
  }
 //###2###
});

module.exports = router;
