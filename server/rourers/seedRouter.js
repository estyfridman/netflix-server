import express from 'express';
import { data, listMovieNames, listSeriesNames, genres } from '../data.js';
import User from '../models/User.js';
import Content from '../models/Content.js';
import List from '../models/List.js';
import expressAsyncHandler from 'express-async-handler';

const seedRouter = express.Router();

seedRouter.get(
  '/',
  expressAsyncHandler(async (req, res) => {
    try {
      
      await Content.deleteMany({});
      await User.deleteMany({});
      await List.deleteMany({});

      const createdContent = await Content.insertMany(data.content);

      const createdUsers = await User.insertMany(data.users);

      await seedLists(listSeriesNames, 'series');
      await seedLists(listMovieNames, 'movies');
      const createdLists = await List.insertMany(data.lists);
      
      console.log('finishedLists');
      res.send({ createdContent, createdLists, createdUsers });
    } catch (err) {
      console.log(`Failed to update users: ${err.message}`);
    }
  })
);

const seedLists = async (array, type) => {
  for (let i = 0; i < array.length; i++) {
    const isSeries = type === 'movies' ? false : true;

    const newList = await Content.aggregate([
      { $match: { isSeries: isSeries } },
      { $sample: { size: 8 } },
    ]);

    newList.map((i) => i._id);

    const newListcontent = new List({
      title: array[i],
      type: type,
      genre: genres[i],
      contents: newList,
    });
    console.log(newListcontent), console.log(newListcontent.contents);
    await newListcontent.save();
  }
};

//testing
seedRouter.get(
  '/delete',
  expressAsyncHandler(async (req, res) => {
    try {
      
      await Content.deleteMany({});
      await User.deleteMany({});
      await List.deleteMany({});

      console.log('i delete');
      res.status(200).send('i delete');
    } catch (err) {
      console.log(`Failed to update users: ${err.message}`);
    }
  })
);

export default seedRouter;