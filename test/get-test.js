
const chai = require('chai');
const chaiHttp = require('chai-http');

const expect = chai.expect;
chai.should();

const {DATABASE_URL} = require('../config');
const {BlogPost} = require('../models');
const {runServer, app} = require('../server');
const {tearDownDb, seedBlogPostData, generateBlogPostData} = require('../helpers')

chai.use(chaiHttp); 

describe('BlogPost API resource', () => {
    before(() => {
        return runServer();
    });

    beforeEach(() => {
        return seedBlogPostData();
    });

    afterEach(() => {
        return tearDownDb();
    });

    describe('GET endpoint', () => {
        it ('should return all existing blogposts', done => {
            let response;

            chai.request(app)
            .get('/posts')
            .then(_response => {
                response = _response;
                response.should.have.status(200);
                response.body.should.have.length.of.at.least(1);
                return response.body.length;
            })
            .then(count => {
                response.body.should.have.length.of(count);
                done();
            })
            .catch(error => console.error(error));
        });

        it ('should return posts with the correct fields', done => {
            let responsePost;
            chai.request(app)
            .get('/posts')
            .then(response => {
                response.should.have.status(200);
                response.should.be.json;
                response.body.should.be.a('array');
                response.body.should.have.length.of.at.least(1);

                response.body.forEach(post => {
                    post.should.be.a('object');
                    post.should.include.keys(
                        'id', 'author', 'content', 'title', 'created'
                    );
                });
                responsePost = response.body[0];
                return BlogPost.findById(responsePost.id);
            })
            .then(post => {
                responsePost.id.should.equal(post.id);
                responsePost.author.should.equal(post.authorName);
                responsePost.content.should.equal(post.content);
                responsePost.title.should.equal(post.title);
                done();
            })
            .catch(error => console.error(error));
        });
        it ('should get a single post', done => {
            let post;
            BlogPost
            .findOne()
            .exec()
            .then(_post => {
                post = _post;
                return chai.request(app).get(`/posts/${post.id}`);
            })
            .then(response => {
                response.should.have.status(200);
                response.should.be.json;
                response.body.should.be.a('object');
                response.body.should.include.keys(
                    'id', 'author', 'content', 'title', 'created'
                );
                response.body.id.should.equal(post.id);
                response.body.author.should.equal(post.authorName);
                response.body.content.should.equal(post.content);
                response.body.title.should.equal(post.title);

                done();
            })
            .catch(error => {console.log(error)});
        });
    });

    describe('POST endpoint', () => {
        it('should add a new post', done=> {
          const newPost = generateBlogPostData();
          chai.request(app)
          .post('/posts')
          .send(newPost)
          .then(response => {
            response.should.have.status(201);
              response.should.be.json;
              response.body.should.be.a('object');
              response.body.should.include.keys(
                'id', 'author', 'content', 'title', 'created');
              response.body.author.should.equal(`${newPost.author.firstName} ${newPost.author.lastName}`.trim());
              response.body.id.should.not.be.null;
              response.body.content.should.equal(newPost.content);
              response.body.title.should.equal(newPost.title);
              done();
          })
          .catch(error => {console.log(error)});
        });
  });

    describe('DELETE endpoint', () => {
        it ('should delete a single post', done => {
            let post;
            BlogPost
            .findOne()
            .exec()
            .then(_post => {
                post = _post;
                return chai.request(app).delete(`/posts/${post.id}`);
            })
            .then(response => {
                response.should.have.status(204);
                return BlogPost.findById(post.id);
            })
            .then(post => {
                expect(post).to.be.null;
                done();
            })
            .catch(error => {console.log(error)});
        });
    });
})