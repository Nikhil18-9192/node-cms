const express = require('express');
const router = express.Router();
const Post = require('../../modules/Post');
const Category = require('../../modules/Category');
const User = require('../../modules/User');
const bcrypt = require('bcryptjs');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy

router.all('/*',(req, res, next)=>{

    req.app.locals.layout = 'home';
    next();


});


//index rout
router.get('/', (req, res)=>{

  const perPage = 10;
  const page = req.query.page || 1;

  
  Post.find({})
  .skip((perPage*page)-perPage)
  .limit(perPage)
  
  .then(posts=>{

    Post.countDocuments().then(postCount=>{

      Category.find({}).then(categories=>{

      
        res.render('home/index',{
          posts:posts,
           categories: categories,
          current: parseInt(page),
          pages: Math.ceil(postCount / perPage)
          
          });
    
        });

    }) ;
 
  });

  
});

//about route
router.get('/about', (req, res)=>{

res.render('home/about');
});

//login route
router.get('/login', (req, res)=>{
  
res.render('home/login');

});

//app login

passport.use(new LocalStrategy({usernameField: 'email'}, (email, password, done)=>{

   User.findOne({email: email}).then(user=>{

    if(!user) return done(null, false, {message: 'no user found'});

    bcrypt.compare(password, user.password, (err, matched)=>{

      if(err) return err;

      if(matched){
        return done(null, user);
      }else{

        return done(null, false, {message: 'incorrect password.'});

      }
    });
   });
}));


passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.findById(id, function(err, user) {
    done(err, user);
  });
});

//login POST route
router.post('/login', (req, res, next)=>{

  passport.authenticate('local', {

    successRedirect: '/admin',
    failureRedirect: '/login',
    failureFlash: true

  })(req, res, next);
  });

  //logout router

  router.get('/logout', (req, res)=>{

    req.logOut();
    res.redirect('/login');
     


  });

//register route
router.get('/register', (req, res)=>{

res.render('home/register');
});
//register post route
router.post('/register', (req, res)=>{
  let errors = [];
  
  if(!req.body.firstName){
      errors.push({message: 'please add a firstName'});
  }
  
  if(!req.body.lastName){
      errors.push({message: 'please add a lastName'});
  }

  if(!req.body.email){
    errors.push({message: 'please add a email'});
  }
  if(!req.body.password){
    errors.push({message: 'please enter a password'});
  }
  if(!req.body.passwordConfirm){
    errors.push({message: 'This field cant be blank'});
  }
   
   
  if(req.body.password !== req.body.passwordConfirm){
  errors.push({message: 'password fields dont match'});
  }

  if(errors.length> 0){
      res.render('home/register', {

          errors: errors,
          firstName: req.body.firstName,
          lastName: req.body.lastName,
          email: req.body.email
      })
    }else{

      User.findOne({email: req.body.email}).then(user=>{

          if(!user){

            const newUser = new User({
              firstName: req.body.firstName,
              lastName: req.body.lastName,
              email: req.body.email,
              password: req.body.password,
          });
      
            bcrypt.genSalt(10, (err, salt)=>{
      
              bcrypt.hash(newUser.password, salt, (err, hash)=>{
      
                newUser.password = hash;
      
                newUser.save().then(savedUser=>{
      
                  req.flash('success_message', 'you are now registerd, please login');
                  res.redirect('/login');
              })
      
      
              });
      
            });
          }else{
            req.flash('error_message', 'email already exist please login');
            res.redirect('/login');
          }


      });



      

    }
 
  });

//post route
router.get('/post/:slug', (req, res)=>{

  Post.findOne({slug: req.params.slug}).populate({path: 'comments', match: {approveComment: true}, populate: {path: 'user', modules: 'User'}}).populate('user')
  .then(post=>{

    Category.find({}).then(categories=>{

      
      res.render('home/post',{post:post, categories: categories});
  
      });

  });
 
  });

module.exports = router;
