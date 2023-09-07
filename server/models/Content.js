import mongoose from 'mongoose';

const ContentSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, unique: true },
    description: { type: String, required: true },
    img: { type: String, required: true },
    imgTitle: { type: String, required: true },
    imgThumb: { type: String, required: true },
    imgVertical: { type: String, required: true },
    trailer: { type: String, required: true },
    movie: { type: String, required: true },
    duration: { type: String, required: true, default: ""},
    year: { type: String, required: true },
    limit: { type: String, required: true },
    genre: { type: String, required: true },
    isSeries: { type: Boolean, required: true, default: false },
  },
  { timestamps: true }
);

const Content = mongoose.model('Content', ContentSchema);
export default Content;