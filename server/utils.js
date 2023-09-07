import jwtoken from 'jsonwebtoken';
import emailValidator from 'deep-email-validator';

export async function isEmailValid(email) {
  return emailValidator.validate(email)
}

export const generateToken = (user) => {
    return jwtoken.sign(
      {
        _id: user._id,
        username: user.username,
        email: user.email,
        isAdmin: user.isAdmin,
      },
      process.env.JWT,
      { expiresIn: '15d' }
    );
  };
  
export const isAuth = (req, res, next) => {
    const authorization = req.headers.authorization;
    if (authorization) {
      const token = authorization.slice(7, authorization.length); // Bearer XXXXXX
      jwtoken.verify(token, process.env.JWT, (err, decode) => {
        if (err) {
          console.log('Invalid Token');
          res.status(401).send({ message: 'Invalid Token' });
        } else {
          console.log("valid token")
          req.user = decode;
          next();
        }
      });
    } else {
      res.status(401).send({ message: 'No Token' });
    }
  };