const express = require('express');
const router = express.Router();
const path = require('path')
const multer = require('multer');
const Sharp = require('sharp');
const mkdirp = require('mkdirp');
const config = require('../config');
const diskStorage = require('../utils/diskStorage');
const models = require('../models');

const rs = () =>
  Math.random()
    .toString(36)
    .slice(-3);

const storage = diskStorage({
  destination: (req, file, cb) => {
    const dir = '/' + rs() + '/' + rs();
    req.dir = dir;

    mkdirp(config.DESTINATION + dir, err => cb(
      err,
      config.DESTINATION + dir
    ));
    //cb(null, config.DISTINATION + dir);
  },
  filename: async (req, file, cb) => {
    const userId = req.session.userId;
    const filename = Date.now().toString(36)
      + path.extname(file.originalname);
    const dir = req.dir;
    console.log(req.body);

    const post = await models.post.findById(req.body.postId);
    if(!post) {
      const err = new Error('No post');
      err.code = "NOPOST";
      return cb(err);
    }
    //upload
    const upload = await models.upload.create({
      owner: userId,
      path: dir + '/' + filename
    });

    //write to post
    const uploads = post.uploads;
    uploads.unshift(upload.id);
    post.uploads = uploads;
    await post.save()

    req.filePath = dir + '/' + filename;

    cb(null, filename);
  },
  sharp: (req, file, cb) => {
    const resizer = Sharp()
    .resize(1024, 768)
    .resize({ fit: "inside" })
    //.withoutEnkargament()
    .toFormat('jpg')
    .jpeg({
      quality: 40,
      progressive: true
    });
    cb(null, resizer);
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 2 * 1024 * 1024
  },
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    if(ext !== '.jpg' && ext !== '.jpeg' && ext !== '.png') {
      const err = new Error('Extention');
      err.code = "EXTENTION";
      return cb(err);
    }
    cb(null, true)
  }
}).single('file');

//post for image --------------------------------------------
router.post('/image', (req, res) => {
  upload(req, res, err => {
    let error = '';
    if (err) {
      if(err.code === 'LIMIT_FILE_SIZE') {
        error = 'Картинка не более 2mb!'
      }
      if(err.code === 'EXTENTION') {
        error = 'Только jpeg и png!'
      }
      if(err.code === 'NOPOST') {
        error = 'Обновите страницу!'
      }
    }
    res.json({
      ok: !error,
      error,
      filePath: req.filePath
    })
    console.log(error);
  });
})

module.exports = router;
