import express from "express";
import expressAsyncHandler from "express-async-handler";
import bcrypt from "bcryptjs";
import User from "../models/User.js";
import { generateToken, isEmailValid } from "../utils.js";

const authRouter = express.Router();

authRouter.post(
  "/login",
  expressAsyncHandler(async (req, res) => {
    const user = await User.findOne({ email: req.body.email });
    if (user) {
      if (bcrypt.compareSync(req.body.password, user.password)) {
        res.send({
          _id: user._id,
          username: user.username,
          profilePicture: user.profilePicture,
          email: user.email,
          isAdmin: user.isAdmin,
          token: generateToken(user),
        });
      } else {
        res.status(401).send({ message: "Invalid Password" });
      }
    } else {
      res.status(401).send({ message: "User not found" });
    }
  })
);

authRouter.post(
  "/register",
  expressAsyncHandler(async (req, res) => {
    try {
      //const { valid, reason, validators } = await isEmailValid(req.body.email);
      //console.log(valid);
      //if (valid) {
        console.log(req.body.email);
        const newUser = new User({
          username: req.body.username,
          email: req.body.email,
          password: bcrypt.hashSync(req.body.password),
        });
        const user = await newUser.save();
  
        res.send({
          _id: user._id,
          username: user.username,
          email: user.email,
          token: generateToken(user),
        });
      // }else {
      //   return res.status(400).send({
      //     message: "PPPPlease provide a valid email address.",
      //     reason: validators[reason].reason
      //   })
      // }
    } catch (error) {
      console.log(error);
    }
    
  })
);


export default authRouter;
