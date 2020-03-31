const express = require('express');
const router = express.Router();
const faker = require('faker');
const Post = require('../../modules/Post');
const category = require('../../modules/Category');
const comment = require('../../modules/comment');
const user = require('../../modules/User');
const {userAuthenticated,} = require('../../helpers/authentication');

//set leayout for admin 
router.all('/*', userAuthenticated, (req, res, next)=>{

    req.app.locals.layout = 'admin';
    next();


});



// admin index rout
router.get('/', (req, res)=>{

    Post.countDocuments({}).then(postCount=>{

        category.countDocuments({}).then(categoryCount=>{

            comment.countDocuments({}).then(commentCount=>{
               user.countDocuments({}).then(userCount=>{

            res.render('admin/index', {postCount: postCount, categoryCount: categoryCount, commentCount: commentCount, userCount: userCount});

        });
        });
        });
    });
    
});

router.post('/generate-fake-posts', (req, res)=>{

    for(let i = 0; i< req.body.amount; i++){

        let post = new Post();

        post.title = faker.name.title();
        post.status = 'public';
        post.slug = faker.name.title();
        post.allowComments = faker.random.boolean();
        post.body = faker.lorem.sentence();

        post.save(function(err){

            if(err) throw err;
        });
       
 
    }
    res.redirect('/admin/posts');
 
});

 
 

module.exports = router;
