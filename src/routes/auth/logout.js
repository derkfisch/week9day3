module.exports = (req, res) => {
    // Clear the JWT
    res.clearCookie('jwtoken');
    res.redirect('/auth/login');
};