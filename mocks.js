const faker = require('faker');
const models = require('./models');
const owner = '5c330679db9066156c373a2d';
const tr = require('transliter');

module.exports = async () => {
  try {
    await models.post.remove();

    Array.from({length: 20}).forEach(async () => {
      const title = faker.lorem.words(5);
      const url = `${tr.slugify(title)} - ${Date.now.toString(26)}`;
      const post = await models.post.create({
        title,
        body: faker.lorem.words(100),
        url,
        owner
      });
      console.log(post);
    })
  } catch (e) {
    console.log(e);
  }
}
