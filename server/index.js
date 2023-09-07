import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import authRouter from './rourers/authRouter.js';
import contentRouter from './rourers/contentRouter.js';
import listsRouter from './rourers/listsRouter.js';
import seedRouter from './rourers/seedRouter.js';
import userRouter from './rourers/userRouter.js';

dotenv.config();
const PORT = process.env.PORT || 5000;
const app = express();
app.use(cors());  
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

app.use('/api/auth', authRouter);
app.use('/api/content', contentRouter);
app.use('/api/lists', listsRouter);
app.use('/api/seed', seedRouter);
app.use('/api/user', userRouter);

mongoose.connect(process.env.MONGO_URL)
.then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}).catch((err) => console.log(err));


