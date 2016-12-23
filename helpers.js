const faker = require('faker');
const mongoose = require('mongoose');
const {BlogPost} = require('./models');

function seedBlogPostData() {
    console.info('Seeding Blog post data');
    const seedData = [];

    for (let i=0; i< 10; i++) {
        seedData.push(generateBlogPostData());
    }

    return BlogPost.insertMany(seedData);
}

function tearDownDb() {
    return new Promise((resolve, reject) => {
        mongoose.connection.dropDatabase()
        .then(result => resolve(result))
        .catch(error => reject(error));
    });
}

function generateBlogPostData() {
    return {
        author:
        {
            firstName: faker.name.firstName(),
            lastName: faker.name.lastName()
        },
        content: faker.lorem.paragraphs(5),
        title: faker.lorem.sentence(3),
        created: faker.date.past()
    };
}

module.exports = {tearDownDb, seedBlogPostData, generateBlogPostData}