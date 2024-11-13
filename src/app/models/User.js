import mongoose from 'mongoose';

const GarmentItemSchema = new mongoose.Schema({
  imageUrl: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  description: String,
  modelDescription: String,
  upscale: Boolean,
  aiDescription: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const ClothingSetSchema = new mongoose.Schema({
  top: {
    type: GarmentItemSchema,
    default: null
  },
  bottom: {
    type: GarmentItemSchema,
    default: null
  }
});

const GeneratedImageSchema = new mongoose.Schema({
  description: String,
  imageUrl: String
});

const CollectionSchema = new mongoose.Schema({
  date: {
    type: Date,
    default: Date.now
  },
  name: {
    type: String,
    default: ""
  },
  images: {
    type: [GeneratedImageSchema],
    default: []
  }
});

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  image: {
    type: String
  },
  googleId: {
    type: String,
    unique: true,
    sparse: true
  },
  clothes: {
    type: [ClothingSetSchema],
    default: []
  },
  collections: {
    type: [CollectionSchema],
    default: []
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Delete and recreate the model to ensure schema changes are applied
mongoose.models = {};

export default mongoose.model('User', UserSchema);
