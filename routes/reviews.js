const express = require('express');
const router = express.Router({ mergeParams: true });
const catchasync = require('../utils/catchasync');
const campgrounds = require('../routes/campgrounds')
const Campground = require('../models/campground');
const Review = require('../models/review');
const reviews = require('../routes/reviews')
const expresserror = require('../utils/ExpressError');
const { campgroundSchema, reviewSchema } = require('../schema.js');
const { isloggedin } = require('../middleware');
const validatereview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',')
        throw new expresserror(msg, 400)
    }
    else {
        next();
    }

}
const isreviewauthor = async (req, res, next) => {
    const { id, reviewId } = req.params;
    const review = await Review.findById(reviewId);
    if (!review.author.equals(req.user._id)) {
        req.flash('error', 'nopeeeeee');
        return res.redirect(`/campgrounds/${id}`);
    }
    next();
}
router.post('/', isloggedin, validatereview, catchasync(async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    const review = new Review(req.body.review);
    review.author = req.user._id;
    campground.reviews.push(review);
    await review.save();
    await campground.save();
    req.flash('success', 'Created new review')
    res.redirect(`/campgrounds/${campground._id}`);
}))

router.delete('/:reviewId', isloggedin, isreviewauthor, catchasync(async (req, res) => {
    const { id, reviewId } = req.params;
    await Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);
    req.flash('success', 'Deleted review!')
    res.redirect(`/campgrounds/${id}`);
}))

module.exports = router;