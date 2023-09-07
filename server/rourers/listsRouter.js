import express from 'express';
import expressAsyncHandler from 'express-async-handler';
import List from '../models/List.js';
import Content from '../models/Content.js';
import { isAuth } from '../utils.js';

const listsRouter = express.Router();

//get list origin return my list or al lists 

listsRouter.get('/get', isAuth, async (req, res) => {
  const typeQuery = req.query.type;
  const genreQuery = req.query.genre;
  let list = [];
  try {
    if (typeQuery) {
      if (genreQuery) {
        list = await List.aggregate([
          { $sample: { size: 10 } },
          { $match: { type: typeQuery, genre: genreQuery } },
        ]);
        list = await List.populate(list, { path: 'contents' });
      } else {
        list = await List.aggregate([
          { $sample: { size: 10 } },
          { $match: { type: typeQuery } },
        ]);
        list = await List.populate(list, { path: 'contents' });
      }
    } else {
      list = await List.find({ type: { $in: ['series', 'movies'] } })
        .populate('contents')
        .exec();
    }
    res.status(200).json(list);
  } catch (err) {
    res.status(500).json(err);
  }
});

//create

listsRouter.post(
  '/create',
  isAuth,
  expressAsyncHandler(async (req, res) => {
    if (req.user.isAdmin) {
      const newList = new List(req.body);
      console.log('before' + newList);
      try {
        const savedList = await newList.save();
        console.log('after' + savedList);
        res.status(200).json(savedList);
      } catch (error) {
        res.status(500).json(error);
      }
    } else res.status(403).json({ message: 'you are not allowed to create' });
  })
);

//delete list

listsRouter.delete(
  '/delete/:id',
  isAuth,
  expressAsyncHandler(async (req, res) => {
    if (req.user.isAdmin) {
      try {
        await List.findByIdAndDelete(req.params.id);
        res.status(201).json(`The list ${req.params.id} has been deleted...`);
      } catch (err) {
        res.status(500).json(err);
      }
    } else {
      res.status(403).json('You are not allowed!');
    }
  })
);

listsRouter.get(
  '/add/:id',
  isAuth,
  expressAsyncHandler(async (req, res) => {
    try {
      let list = await List.findOne({ type: { $eq: req.user._id } });
      const newContent = await Content.findById(req.params.id);
      if (!list) {
        list = new List({
          title: `${req.user.username}'s List`,
          type: req.user._id,
          genre: 'all',
          contents: [],
        });
      }
      var found = list.contents.indexOf(newContent._id);
      console.log('found Item: ' + found);
      if (found !== -1) {
      } else {
        list.contents.push(newContent._id);
      }

      await list.save();

      list = await List.populate(list, { path: 'contents' });

      res.status(200).json(list);
    } catch (err) {
      res.status(500).json(err);
    }
  })
);

listsRouter.get(
  '/remove/:id',
  isAuth,
  expressAsyncHandler(async (req, res) => {
    try {
      let list = await List.findOne({ type: { $eq: req.user._id } });
      const contentToRemove = await Content.findById(req.params.id);
      console.log(list.contents);
      console.log(contentToRemove._id);
      var found = list.contents.indexOf(contentToRemove._id);
      console.log(found);
      if (found !== -1) {
        list.contents.splice(found, 1);
      }
      await list.save();
      console.log(list.contents);
      list = await List.populate(list, { path: 'contents' });
      res.status(200).json(list);
    } catch (err) {
      res.status(500).json(err);
    }
  })
);

export default listsRouter;