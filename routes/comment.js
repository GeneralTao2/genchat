const express = require('express');
const router = express.Router();
const models = require('../models');

//Comment add
router.post('/add', async (req, res) => {
  const userId = req.session.userId;
  const userLogin = req.session.userLogin;

  if(!userId || !userLogin) {
    console.log('====No logined====');
    res.json({
      ok: false
    })
  } else {
    const post = req.body.post;
    const body = req.body.body;
    const parent = req.body.parent;
    if(!body) {
      res.json({
        ok: false,
        error: 'Пустой комментарий'
      })
    }
    try {
      if(!parent) {
        await models.comment.create({
          post,
          body,
          owner: userId
        });
        res.json({
          ok: true,
          body,
          login: userLogin
        });

      } else {
        const parentComment = await models.comment.findById(parent);
        if(!parentComment) {
          console.log('====No parent====');
          res.json({
            ok: false
          });
        }
        const comment = await models.comment.create({
          post,
          body,
          parent,
          owner: userId
        });
        const children = parentComment.children;
        children.push(comment.id);
        parentComment.children = children;
        await parentComment.save();
        res.json({
          ok: true,
          body,
          login: userLogin
        });
      }
    } catch (error) {
      console.log(error);
      res.json({
        ok: false
      })
    }
  }
});

module.exports = router;
