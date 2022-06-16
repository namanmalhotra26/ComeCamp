module.exports.isloggedin = (req, res, next) => {
    if (!req.isAuthenticated()) {
        req.session.returnTo = req.originalUrl
        req.flash('error', 'You must be loged in');
        return res.redirect('/')
    }
    next();
}

