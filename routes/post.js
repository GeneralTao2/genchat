const express = require('express');
const router = express.Router();
const models = require('../models');
const tr = require('transliter');

//Get for add--------------------------------------------
router.get('/edit/:id', async (req, res) => {
  const userId = req.session.userId;
  const userLogin = req.session.userLogin;
  const id = req.params.id.trim().replace(/ +(?= )/g, '');
  if(!userId || !userLogin) {
    res.redirect('/')
  } else {
    try {
      const post = await models.post.findById(id)
      .populate('uploads');
      if(!post) {
        const err = new Error('Not Found');
        err.status = 404;
        next(err);
      }
      res.render('post/edit', {
        post,
        user: {
          id: userId,
          login: userLogin
        }
      });
    } catch (error) {
      console.log(error);
    }
  }
});

//Get for add--------------------------------------------
router.get('/add', async (req, res) => {
  const userId = req.session.userId;
  const userLogin = req.session.userLogin;
  if(!userId || !userLogin) {
    res.redirect('/')
  } else {
    try {
      const post = await models.post.findOne({
        owner: userId,
        status: 'draft'
      });
      if(post) {
        res.redirect(`/post/edit/${post.id}`);
      } else {
        const post = await models.post.create({
          owner: userId,
          status: 'draft'
        });
        res.redirect(`/post/edit/${post.id}`);
      }
    } catch (e) {
      console.log(e);
    }
  }
});

//post for add --------------------------------------------
router.post('/add', async (req, res) => {
  const userId = req.session.userId;
  const userLogin = req.session.userLogin;

  if(!userId || !userLogin) {
    res.redirect('/')
  } else {
    const title = req.body.title.trim().replace(/ +(?= )/g, '');
    const body = req.body.body.trim();
    const isDraft = !!req.body.isDraft;
    const postId = req.body.postId;
    const url = `${tr.slugify(title)} - ${Date.now.toString(26)}`;

    if(!title || !body) {//---------
      const fields = [];
      if(!title) fields.push('title');
      if(!body) fields.push('body');
      res.json({
        ok:false,
        error: 'Все поля должны быть заполнены!',
        fields: fields
      });
    } else if (title.length < 3 || title.length > 64) {//---------
      res.json({
        ok: false,
        error: 'Длина заголовка должна быть от 3 до 64 символов!',
        fields: ['title']
      });
    } else if (body.length < 3) {//---------
      res.json({
        ok: false,
        error: 'Длина текста должна быть от 3 символов!',
        fields: ['body']
      });
    } else if (!postId) {
      res.json({
        ok: false
      });
    } else {
      try {
        const post = await models.post.findOneAndUpdate ({
          _id: postId,
          owner: userId
        },
      {
        title,
        body,
        url,
        owner: userId,
        status: isDraft ? 'draft' : 'published',
      },
    {new:true}
    );

    if (!post) {
      res.json({
        ok: false,
        error: 'Доступ запрещён!'
      });
    } else {

      res.json({
        ok: true,
        post
      });

    }
      } catch (e) {
        console.log(e);
        res.json({
          ok: false
        });
      }
      //===888===
    }
  }
});

module.exports = router;
