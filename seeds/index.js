
const mongoose = require('mongoose');
const cities = require('./cities');
const Campground = require('../models/campground')
const { places, descriptors } = require('./seedHelpers');
mongoose.connect('mongodb://localhost:27017/yelp-camp', {
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
const sample = (array) => array[Math.floor(Math.random() * array.length)];
const seeddb = async () => {
    await Campground.deleteMany({});
    for (let i = 0; i < 30; i++) {
        const random1000 = Math.floor(Math.random() * 1000);
        const price = Math.floor(Math.random() * 20) + 10;
        const camp = new Campground({
            author: '6280ef53697e299238265ecc',
            location: `${cities[random1000].city},${cities[random1000].state}`,
            title: `${sample(descriptors)} ${sample(places)}`,
            images: [{ url: "https://res.cloudinary.com/dazgmwbbf/image/upload/v1655278832/YelpCamp/wz1d6kwnx7cutw5pdwed.jpg", filename: "YelpCamp/wz1d6kwnx7cutw5pdwed" }],
            description: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Debitis sit minus itaque tempore iste voluptates molestiae excepturi modi unde, qui enim accusamus tenetur earum illo obcaecati sequi numquam esse distinctio.',
            price
        })
        await camp.save();
    }
}
seeddb().then(() => {
    mongoose.connection.close()

})

