import express from 'express';
import expressAsyncHandler from 'express-async-handler';
import User from '../models/User.js';
import { isAuth } from '../utils.js';

const usersRouter = express.Router();

//update image

usersRouter.put(
  'updateimg',
  isAuth,
  expressAsyncHandler(async (req, res) => {
    //if (req.user._id === req.params.id) {
      try {
        const updatedUser = await User.findByIdAndUpdate(req.params.id, {
          $set: {
            ...req.user,
            profilePicture: req.body.profilePicture ? req.body.profilePicture : req.user.profilePicture,
          },
        });
        res.status(200).json(await User.findById(req.params.id));
      } catch (error) {
        res.status(500).json(error);
      }
    //} else {
    //  res.status(403).json({ message: 'you can update only your account.' });
    //}
  })
);

//update

// usersRouter.put(
//   'update/:id',
//   isAuth,
//   expressAsyncHandler(async (req, res) => {
//     if (req.user._id === req.params.id || req.user.isAdmin) {
//       try {
//         const updatedUser = await User.findByIdAndUpdate(req.params.id, {
//           $set: {
//             ...req.user,
//             email: req.body.email ? req.body.email : req.user.email,
//             username: req.body.username ? req.body.username : req.user.username,
//           },
//         });
//         res.status(200).json(await User.findById(req.params.id));
//       } catch (error) {
//         res.status(500).json(error);
//       }
//     } else {
//       res.status(403).json({ message: 'you can update only your account.' });
//     }
//   })
// );

//delete
usersRouter.delete(
  '/delete/:id',
  isAuth,
  expressAsyncHandler(async (req, res) => {
    console.log('here');
    if (req.user._id === req.params.id || req.user.isAdmin) {
      try {
        await User.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: 'User Has Been Deleted' });
      } catch (error) {
        res.status(500).json(error);
      }
    } else {
      res.status(403).json({ message: 'you can delete only your account.' });
    }
  })
);


//get

usersRouter.get(
  '/find/:id',
  isAuth,
  expressAsyncHandler(async (req, res) => {
    try {
      const user = await User.findById(req.params.id);
      const { password, ...info } = user._doc;
      res.status(200).json(user);
    } catch (error) {
      res.status(500).json(error);
    }
  })
);

//get all users

usersRouter.get(
  '/admin/find-all',
  isAuth,
  expressAsyncHandler(async (req, res) => {
    const query = req.query.new;
    if (req.user.isAdmin) {
      try {
        const users = query
          ? await User.find().sort({ _id: -1 }).limit(5)
          : await User.find();
        res.status(200).json(users);
      } catch (error) {
        res.status(500).json(error);
      }
    } else {
      res.status(403).json({ message: 'You are not an admin' });
    }
  })
);

//get User Stats

usersRouter.get(
  '/admin/stats',
  isAuth,
  expressAsyncHandler(async (req, res) => {
    const today = new Date();
    const lastYear = today.setFullYear(today.setFullYear() - 1);

    try {
      const data = await User.aggregate([
        {
          $project: { 
            month: { $month: '$createdAt' } 
        },
        },
        {
          $group: {
            _id: '$month',
            total: { $sum: 1 },
          },
        },
      ]);
      res.status(200).json(data);
    } catch (err) {
      res.status(500).json(err);
    }
  })
);

export default usersRouter;