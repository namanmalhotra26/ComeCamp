const mongoose = require('mongoose');
const Review = require('./review');
const { campgroundSchema } = require('../schema');
const Schema = mongoose.Schema;
const campgroundschema = new Schema({
    title: String,
    price: Number,
    description: String,
    location: String,
    images: [{
        url: String,
        filename: String
    }],
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Review'
        }
    ]
});

campgroundschema.post('findOneAndDelete', async function (doc) {
    if (doc) {
        await Review.deleteMany({
            _id: {
                $in: doc.reviews
            }
        })
    }
})
module.exports = mongoose.model('Campground', campgroundschema);