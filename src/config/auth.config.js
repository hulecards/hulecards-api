module.exports = {
    secret: process.env.JWT_SECRET,
    jwtExpiration: 86400,
    jwtRefreshExpiration: 172800,
    /* for test */
    // jwtExpiration: 10,
    // jwtRefreshExpiration: 20,
};