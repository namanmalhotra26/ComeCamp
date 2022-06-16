


const express = require('express');
const router = express.Router();
const catchasync = require('../utils/catchasync');
const expresserror = require('../utils/ExpressError');
const Campground = require('../models/campground');
const { campgroundSchema, reviewSchema } = require('../schema.js');
const { isloggedin } = require('../middleware');
const campgrounds = require('../controllers/campgrounds')
const multer = require('multer')

const { storage } = require('../cloudinary');
const upload = multer({ storage })
const validatecampground = (req, res, next) => {

    const { error } = campgroundSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',')
        throw new expresserror(msg, 400)
    }
    else {
        next();
    }
}
const isauthor = async (req, res, next) => {
    const { id } = req.params;
    const campgroundd = await Campground.findById(id);
    if (!campgroundd.author.equals(req.user._id)) {
        req.flash('error', 'nopeeeeee');
        return res.redirect(`/campgrounds/${id}`);
    }
    next();
}
router.get('/', catchasync(campgrounds.index))
router.get('/new', isloggedin, (req, res) => {
    res.render('campgrounds/new')
})
router.post('/', isloggedin, upload.array('image'), validatecampground, catchasync(async (req, res, next) => {
    // if (!req.body.Campground) throw new expresserror('invalid', 400)

    const campground = new Campground(req.body.campground);
    campground.images = req.files.map(f => ({ url: f.path, filename: f.filename }))
    campground.author = req.user._id;
    await campground.save();
    req.flash('success', 'New campground made');
    res.redirect(`/campgrounds/${campground._id}`)
}))
router.get('/:id/edit', isloggedin, isauthor, catchasync(async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findById(id)
    if (!campground) {
        req.flash('error', 'cannot find that campground');
        return res.redirect('/campgrounds')
    }

    res.render('campgrounds/edit', { campground });
}))
router.get('/:id', catchasync(async (req, res) => {
    const campground = await Campground.findById(req.params.id).populate({
        path: 'reviews',
        populate: {
            path: 'author'
        }
    }).populate('author');
    if (!campground) {
        req.flash('error', 'cannot find that campground');
        return res.redirect('/campgrounds')
    }

    res.render('campgrounds/show', { campground });
}))

router.put('/:id', isloggedin, isauthor, upload.array('image'), catchasync(async (req, res) => {

    const { id } = req.params;

    const campground = await Campground.findByIdAndUpdate(id, { ...req.body.campground });
    const imges = req.files.map(f => ({ url: f.path, filename: f.filename }))
    campground.images.push(...imges);
    await campground.save();
    req.flash('success', 'Updated!!')
    res.redirect(`/campgrounds/${campground._id}`)
}))
router.delete('/:id', isloggedin, isauthor, catchasync(async (req, res) => {
    const { id } = req.params;

    await Campground.findByIdAndDelete(id);
    req.flash('success', 'Deleted campground!')
    res.redirect('/campgrounds');
}))
module.exports = router;