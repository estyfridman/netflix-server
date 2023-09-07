import express from 'express';
import expressAsyncHandler from 'express-async-handler';
import Content from '../models/Content.js';
import { isAuth } from '../utils.js';

const contentRouter = express.Router();

//get all

contentRouter.get(
  '/',
  isAuth,
  expressAsyncHandler(async (req, res) => {
    try {
      const data = await Content.find();
      res.status(200).json(data.reverse());
    } catch (error) {
      res.status(500).json(error);
    }
  })
);

contentRouter.get(
  '/search',
  isAuth,
  expressAsyncHandler(async (req, res) => {
    const query = req.query.query;
    const genre = req.query.genre;
    try {
      let options = {};
      if (query) options.title = { $regex: query, $options: 'i' };
      if (genre) options.genre = genre;
      const data = await Content.find(options);
      console.log(genre + ' ' + query);

      res.send(data);
    } catch (error) {
      res.status(500).json(error);
    }
  })
);

//create

contentRouter.post(
  '/add',
  isAuth,
  expressAsyncHandler(async (req, res) => {
    if (req.user.isAdmin) {
      const newContent = new Content(req.body);
      try {
        const contentToSave = await newContent.save();
        res.status(200).json(contentToSave);
      } catch (error) {
        res.status(500).json(error);
      }
    } else {
      res.status(403).json({ message: 'you are not an admin' });
    }
  })
);

//update
contentRouter.put(
  '/update/:id',
  isAuth,
  expressAsyncHandler(async (req, res) => {
    if (req.user.isAdmin) {
      try {
        const updatedContent = await Content.findByIdAndUpdate(
          req.params.id,
          {
            $set: req.body,
          },
          { new: true }
        );
        res.status(200).json(updatedContent);
      } catch (error) {
        res.status(500).json(error);
      }
    } else {
      res.status(403).json({ message: 'you are not an admin' });
    }
  })
);

//delete

contentRouter.delete(
  '/delete/:id',
  isAuth,
  expressAsyncHandler(async (req, res) => {
    if (req.user.isAdmin) {
      try {
        await Content.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: `content ${req.params.id} deleted` });
      } catch (error) {
        res.status(500).json(error);
      }
    } else {
      res.status(403).json({ message: 'you are not an admin' });
    }
  })
);

//get
contentRouter.get(
  '/get/:id',
  isAuth,
  expressAsyncHandler(async (req, res) => {
    try {
      const content = await Content.findById(req.params.id);
      res.status(200).json(content);
    } catch (error) {
      res.status(500).json(error);
    }
  })
);

//get random content
contentRouter.get(
  '/random',
  isAuth,
  expressAsyncHandler(async (req, res) => {
    const type = req.query.type;
    let content;
    try {
      if (type === 'series') {
        content = await Content.aggregate([
          { $match: { isSeries: true } },
          { $sample: { size: 1 } },
        ]);
      } else if (type === 'movies') {
        content = await Content.aggregate([
          { $match: { isSeries: false } },
          { $sample: { size: 1 } },
        ]);
      } else {
        content = await Content.aggregate([{ $sample: { size: 1 } }]);
      }
      res.status(200).json(content[0]);
    } catch (error) {
      res.status(500).json(error);
    }
  })
);

export default contentRouter;