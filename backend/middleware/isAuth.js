import jwt from 'jsonwebtoken'

export const isAuth = async (req, res, next) => {
  const token = req.cookies?.token;
  if (!token) {
    return res.status(401).send({
      success: false,
      message: "Authentication required"
    })
  }

  try {
    const verifyToken = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = verifyToken.userId
    return next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).send({
        success: false,
        message: "Invalid or expired authentication token"
      })
    }

    return next(error)
  }
}