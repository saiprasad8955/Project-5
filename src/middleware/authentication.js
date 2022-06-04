const jwt = require('jsonwebtoken')

// AUTHENTICATION
const authentication = async (req, res, next) => {

  try {

    // Extract token from Authorization
    let token1 = req.headers['authorization']

    // if no token found
    if (!token1) {
      return res.status(401).send({ status: false, msg: "Authentication token is required" })
    }

    // split the bearer token 
    let token2 = token1.split(' ')

    // store the bearer token inside token
    let token = token2[1]

    // decode token
    let decodedToken = jwt.verify(token, "Group8")

    // if decoded token not found
    if (! decodedToken) {
      return res.status(400).send({ status: false, msg: "Token is not valid" })
    }

    // Store userId in request for authorization purpose
    req.userId = decodedToken.userId;
    next()

  }
  catch (err) {
    console.log("This is the error :", err.message)
    res.status(500).send({ msg: "Error", error: err.message })
  }
};


module.exports = { authentication }