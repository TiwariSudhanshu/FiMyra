import mongoose from 'mongoose';

// Global cache for mongoose connection (for serverless environments)
declare global {
  // eslint-disable-next-line no-var
  var mongooseConnection: {
    conn: typeof mongoose | null;
    promise: Promise<typeof mongoose> | null;
  } | undefined;
}

// Initialize cached connection
const cached = global.mongooseConnection || { conn: null, promise: null };

if (!global.mongooseConnection) {
  global.mongooseConnection = cached;
}

/**
 * Connects to MongoDB database
 * Uses connection pooling and handles reconnection automatically
 * Optimized for serverless environments (Vercel)
 */
export const connectDB = async (): Promise<void> => {
  // Set mongoose options
  mongoose.set('strictQuery', true);

  // If already connected, return early
  if (cached.conn && mongoose.connection.readyState === 1) {
    return;
  }

  // Get MongoDB URI from environment variables
  const MONGODB_URI = process.env.MONGODB_URI;

  if (!MONGODB_URI) {
    throw new Error(
      '❌ Please define the MONGODB_URI environment variable inside .env.local'
    );
  }

  // If no existing promise, create new connection
  if (!cached.promise) {
    const opts = {
      dbName: 'fimyra',
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      bufferCommands: false, // Disable buffering for serverless
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongooseInstance) => {
      return mongooseInstance;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (error) {
    cached.promise = null;
    throw new Error(`Failed to connect to MongoDB: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

/**
 * Disconnects from MongoDB database
 * Useful for cleanup in serverless functions or testing
 */
export const disconnectDB = async (): Promise<void> => {
  if (!cached.conn) {
    return;
  }

  try {
    await mongoose.disconnect();
    cached.conn = null;
    cached.promise = null;
  } catch (error) {
    console.error('Error disconnecting from MongoDB:', error);
    throw error;
  }
};

/**
 * Get current connection status
 */
export const getConnectionStatus = (): boolean => {
  return mongoose.connection.readyState === 1;
};

export default { connectDB, disconnectDB, getConnectionStatus };