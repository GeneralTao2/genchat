const mongoose = require('mongoose');
const Schema = mongoose.Schema;
//URLSlugs = require('mongoose-url-slugs');
const tr = require('transliter');


const schema = new Schema(
  {
  title: {
    type: String
  },
  body: {
     type: String
   },
   url: {
     type: String
   },
   owner: {
     type: Schema.Types.ObjectId,
     ref: 'User'
   },
   status: {
     type: String,
     enum: ['published', 'draft'],
     required: true,
     default: 'published'
   },
   commentCount: {
     type: Number,
     default: 0
   },
   uploads: [
     {
       type: Schema.Types.ObjectId,
       ref: 'Upload'
     }
   ]
 },
 {
   timestamps: true
 }
);
/*schema.plugin(
  URLSlugs('title', {
    field: 'url',
    generator: text => tr.slugify(text)
  })
);*/

schema.statics = {
  incCommentCount(postId) {
    console.log(postId);
    return this.findByIdAndUpdate(
      postId,
      { $inc: { commentCount: 1 } },
      { new: true }
    )
  }
};

schema.set('toJSON', {
  virtuals: true
});

/*schema.pre('save', function (next) {
  this.url = `${tr.slugify(this.title)} - ${Date.now.toString(26)}`;
  next();
})*/

module.exports = mongoose.model('Post', schema);
