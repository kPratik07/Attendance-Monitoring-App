import mongoose from 'mongoose';
import { env } from './env.js';

mongoose.set('bufferCommands', false);

const fallbackMongoUri = 'mongodb://127.0.0.1:27017/attendance-monitoring';

export const connectDatabase = async () => {
  if (mongoose.connection.readyState === 1) {
    return;
  }

  try {
    await mongoose.connect(env.MONGO_URI);
    console.log('MongoDB connected');
  } catch (error) {
    console.warn('Primary MongoDB connection failed:', (error as Error).message);

    try {
      await mongoose.connect(fallbackMongoUri);
      console.log('MongoDB connected using local fallback URI');
    } catch (fallbackError) {
      console.warn('MongoDB connection skipped:', (fallbackError as Error).message);
    }
  }
};
