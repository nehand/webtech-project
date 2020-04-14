const path = require('path')
const express = require('express')
const ejs = require('ejs')
const bodyParser = require('body-parser')
const mongoose = require('mongoose')
const passport = require('passport')
const LocalStrategy = require('passport-local')
const Campground = require('../models/campground')
const seedDb = require('../seeds')
const Comment = require('../models/comment')
const User = require('../models/user')
const methodOverride = require('method-override')

const app = express()
var port = process.env.PORT || 3000

const viewPath = path.join(__dirname,'./views')

app.use(bodyParser.urlencoded({extended:true}))
app.use(methodOverride('_method'))
app.set('view engine', 'ejs')
app.set('views', viewPath)

//passport login
app.use(require('express-session')({
    secret: 'vaishnav',
    resave: false,
    saveUninitialized: false
}))
app.use(passport.initialize())
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()))
passport.serializeUser(User.serializeUser())
passport.deserializeUser(User.deserializeUser())

//

app.use(function(req, res, next){
    res.locals.currentUser = req.user;
    next();
})


// seedDb();
//mongoDB
mongoose.connect("mongodb://localhost/yelp_camp", {useNewUrlParser: true} )

app.get('/', (req, res) => {
    res.render('landing')
})

app.get('/campgrounds', (req, res) => {
    Campground.find({}, function(err, allCampgrounds){
        if(err){
            console.log(err)
        } else {
            res.render('index',{campgrounds: allCampgrounds, currentUser: req.user})
        }
    })
    
})

app.post('/campgrounds', isLoggedIn, (req, res) => {
    var name = req.body.name;
    var image = req.body.image;
    var description = req.body.description;
    var price = req.body.price;
    var number= req.body.number;
    console.log(price)
    var author = {
        id: req.user._id,
        username: req.user.username
    }
    var newCampground = {name: name, image: image, description: description, price: price,number:number,author: author}
    Campground.create(newCampground, function(err, newlyCreated){
        if(err){
            console.log(err)
        } else {
            res.redirect('/campgrounds')
        }
    })
})

app.get('/campgrounds/new', isLoggedIn, (req, res) => {
    res.render('new')
})

app.get("/campgrounds/:id", function(req, res){
    Campground.findById(req.params.id).populate('comments').exec(function(err, foundCampground){
        if(err){
            console.log(err)
        } else {
            res.render('show', {campground: foundCampground})
        }
    })
})


app.get('/campgrounds/:id/comments/new', isLoggedIn, function(req, res){
    Campground.findById(req.params.id, function(err, campground){
        if(err){
            console.log(err)
        } else{
            res.render('newComment', { campground: campground})
        }
    })
    
})

app.post('/campgrounds/:id/comments', isLoggedIn, function(req, res){
    Campground.findById(req.params.id, function(err, campground) {
        if(err){
            console.log(err)
            res.redirect('/campgrounds')
        } else {
            Comment.create(req.body.comment, function(err, comment){
                if(err){
                    console.log(err)
                } else {
                    comment.author.id = req.user._id;
                    comment.author.username = req.user.username;
                    comment.save()
                    campground.comments.push(comment)
                    campground.save()
                    res.redirect('/campgrounds/'+campground._id)
                }
            })
        }
    })
})

app.get("/register", function(req, res){
    res.render('register')
})

app.post('/register', function(req, res){
    var newuser = new User({username: req.body.username});
    User.register(newuser, req.body.password, function(err, user){
        if(err){
            console.log(err)
            return res.render("register")
        } passport.authenticate('local')(req, res, function(){
            res.redirect("/campgrounds")
        })
    })
})

app.get('/login', (req, res) => {
    res.render('login')
})

app.post('/login', passport.authenticate('local', {
    successRedirect: '/campgrounds',
    failureRedirect: '/login'
}),(req, res) => {
})

app.get('/logout', (req, res) => {
    req.logout();
    res.redirect('/campgrounds')
})

function isLoggedIn(req, res, next){
    if(req.isAuthenticated()){
        return next()
    }
    res.redirect('/login')
}

app.get('/campgrounds/:id/edit', checkCampgroundOwnership, (req, res)=> {
        Campground.findById(req.params.id, function(err, foundCampground){
            res.render('campgroundEdit', {campground: foundCampground })
        })
})

app.put('/campgrounds/:id', checkCampgroundOwnership, (req, res) => {
    Campground.findByIdAndUpdate(req.params.id, req.body.campground, function(err, updatedCampground){
        if(err){
            res.redirect('/campgrounds')
        } else{
            res.redirect('/campgrounds/' + req.params.id)
        }
    })
})

app.delete('/campgrounds/:id', checkCampgroundOwnership, (req, res) => {
    Campground.findByIdAndRemove(req.params.id, function(err) {
        if(err){
            res.redirect('/campgrounds')
        } else{
            res.redirect('/campgrounds')
        }
    })
})


function checkCampgroundOwnership(req, res, next) {
    if(req.isAuthenticated()){
        Campground.findById(req.params.id, function(err, foundCampground){
            if(err){
                console.log(err)
                res.redirect('back')
            } else {
                if(foundCampground.author.id.equals(req.user._id)){
                    next()
                } else{
                    res.redirect('back')
                }
            }
        })
    } else {
        res.redirect('back')
    }
}

app.listen(port, () => {
    console.log('Server is up on port ' + port)
})