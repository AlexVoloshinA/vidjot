const express = require('express');
const exphbs = require('express-handlebars');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');
const flash = require('connect-flash');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const app = express();

// Map global promise - get rid of warning
mongoose.Promise = global.Promise;
//Connect to mongoose
mongoose.connect('mongodb://localhost/vidjot-dev', {useNewUrlParser: true})
.then(() => console.log('MongoDb Connected ...'))
.catch(err => console.log(err));

// Body Parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

//Method override

app.use(methodOverride('_method'));

app.use(cookieParser());
//Express session midleware
app.use(session({
  secret: 'secret',
  resave: true,
  saveUninitialized: true,
  cookie: {secure: true}
}));

app.use(flash());

//GLobal variables

app.use(function (req,res,next) { 
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.error = req.flash('error');
  next();
});

// Load Idea Model
const Idea = require('./models/Idea');

//Handlebars middleware
app.engine('handlebars', exphbs({
  defaultLayout: 'main'
}));
app.set('view engine', 'handlebars');



//Index route
app.get('/', (req,res) => {
  const title = 'Welcome';
  res.render('index', {title: title});
});

//About route

app.get('/about', (req,res) => {
  res.render('about');
});

//Ideas index page
app.get('/ideas', async (req,res) => {
  const ideas = await Idea.find().sort({date: 'desc'});
  res.render('ideas/index', {ideas:ideas});
});

//Add idea form
app.get('/ideas/add', (req,res) => {
  res.render('ideas/add');
});

//Edit idea form
app.get('/ideas/edit/:id', async (req,res) => {
  const idea = await Idea.findById(req.params.id);
  res.render('ideas/edit', {idea:idea});
});

app.put('/ideas/edit/:id', async (req,res) => {
  const idea = await Idea.findById(req.params.id);
  idea.title = req.body.title;
  idea.details = req.body.details;
  await idea.save();
  res.redirect('/ideas');
});

app.delete('/ideas/delete/:id', async (req,res) => {
  const idea = await Idea.findById(req.params.id);
  await idea.remove();
  req.flash('success_msg', 'Video idea removed');
  res.redirect('/ideas');
});

// Process Form
app.post('/ideas', async (req,res) => {
  let errors = [];
  if(!req.body.title){
    errors.push({text: 'Please add a title'});
  }
  if(!req.body.details){
    errors.push({text: 'Please add some details'});
  } 

  if(errors.length > 0){
    res.render('ideas/add', {
      errors: errors,
      title: req.body.title,
      details: req.body.details
    });
  } else {
    const idea = new Idea({
      title: req.body.title,
      details: req.body.details
    });
  
    await idea.save();
    res.redirect('/ideas');
  }
});

const port = 5000;

app.listen(port, () => {
  console.log(`Listening on the port ${port}`);
});