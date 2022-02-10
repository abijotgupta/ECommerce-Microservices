const jwt = require('jsonwebtoken');

export async function isAuthenticated(req, res, next) {
    //Bearer <token>.split()
    //["Bearer", "token"]

    const token = req.headers["authorization"].split(" ")[1];
    jwt.verify(token, "ecret", (err, user) => {
        if(err) {
            return res.json( {message: err} );
        } else {
            req.user = user;
            next();
        }
    })

}