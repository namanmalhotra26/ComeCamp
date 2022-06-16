if (process.env.NODE_ENV !== "production") {
    require('dotenv').config();
}
//const session = require('express-session')
const express = require('express');
const app = express();
const path = require('path');
const mongoose = require('mongoose');
const Campground = require('./models/campground')
const methodOverride = require('method-override')
const ejsmate = require('ejs-mate');
const catchasync = require('./utils/catchasync');
const expresserror = require('./utils/ExpressError');
const res = require('express/lib/response');
const joi = require('joi');
const { campgroundSchema, reviewSchema } = require('./schema.js');
const Review = require('./models/review');
const campgrounds = require('./routes/campgrounds')
const reviews = require('./routes/reviews');
const req = require('express/lib/request');
const session = require('express-session');
const { date } = require('joi');
const flash = require('connect-flash');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/user');
const userRoutes = require('./routes/users');
const MongoDBStore = require('connect-mongo')(session);
const dburl = process.env.DB_URL || 'mongodb://localhost:27017/yelp-camp';
//mongodb://localhost:27017/yelp-camp
mongoose.connect(dburl, {
    useNewUrlParser: true,

    useUnifiedTopology: true

})
    .then(() => {
        console.log("mongo started")
    })
    .catch(err => {
        console.log("mongo error!!!")
        console.log(err)
    });
app.engine('ejs', ejsmate)
app.use(methodOverride('_method'))
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'))
app.use(express.urlencoded({ extended: true }))

app.use(express.static(path.join(__dirname, 'public')))
const secret = process.env.SECRET || 'namanmalhotra'
const store = new MongoDBStore({
    url: dburl,
    secret,
    touchAfter: 24 * 60 * 60
});
store.on("error", function (e) {
    console.log("session store error", e)
})
const sessionConfig = {
    store,
    name: 'session',
    secret: 'namanmalhotra',
    resave: false,
    saveUninitialized: true,
    cokie: {
        httpOnly: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}
app.use(session(sessionConfig))
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()))
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser())
app.use(flash());
app.use((req, res, next) => {
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error')
    next();
})

app.use('/campgrounds', campgrounds)
app.use('/campgrounds/:id/reviews', reviews)
app.use('/', userRoutes)

app.get('/', (req, res) => {
    res.render('home')

})

// app.get('/makecampground', async (req, res) => {
//     const camp = new Campground({ title: 'My backyard', description: 'cheap camp' });
//     await camp.save();
//     res.send(camp)
// })



app.all('*', (req, res, next) => {
    next(new expresserror('Page not found', 404))

})

app.use((err, req, res, next) => {
    const { statuscode = 500
    } = err;
    if (!err.message) err.message = 'oh no, wrong'
    res.status(statuscode).render('error', { err });

})
const port = process.env.PORT || 3000
app.listen(3000, () => {
    console.log('3000 active')
})