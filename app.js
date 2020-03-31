const express = require('express');
const app = express();
const path = require('path');
const exphbs = require('express-handlebars');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');
const upload = require('express-fileupload');
const session = require('express-session');
const flash = require('connect-flash');
const {mongoDbUrl} = require('./config/database');
const passport = require('passport');


mongoose.Promise = global.Promise;

//connect to db
mongoose.connect(' mongodb+srv://cms-user:123@cluster0-jyvlu.mongodb.net/test?retryWrites=true&w=majority',({useNewUrlParser:true,useUnifiedTopology:true,useCreateIndex:true}), ()=>{

    console.log('connected');
});



 //public file like css js to include
app.use(express.static(path.join(__dirname, 'public')));

const {select, generateDate, paginate} = require('./helpers/handlebars-helpers');

//handlebars extensions and set view engine
app.engine('handlebars', exphbs({defaultLayout: 'home', helpers: {select: select, generateDate: generateDate, paginate: paginate}}));
app.set('view engine', 'handlebars');

//upload meddlaware
app.use(upload());

//body parser
app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());

//method override
app.use(methodOverride('_method'));

//session or flash
app.use(session({
    secret: 'nikhil',
    resave: true,
    saveUninitialized: true

}));

app.use(flash());

//this is used for passport authentication
app.use(passport.initialize());
app.use(passport.session());


//local variables use middleware
app.use((req, res, next)=>{

    res.locals.user = req.user || null; //this is used for passed session value to pages using user key
     
    res.locals.success_message = req.flash('success_message');
    res.locals.error_message = req.flash('error_message');
   res.locals.error = req.flash('error');//login page errors
    next();
});


//load admin and home  routes
const home = require('./routes/home/index');
const admin = require('./routes/admin/index');
const posts = require('./routes/admin/posts');
const categories = require('./routes/admin/categories');
const comments = require('./routes/admin/comments');

//use admin and home routes
app.use('/',home);
app.use('/admin',admin);
app.use('/admin/posts',posts);
app.use('/admin/categories', categories);
app.use('/admin/comments', comments);

app.listen(4500, ()=>{

    console.log(`listening on port 4500`);

});