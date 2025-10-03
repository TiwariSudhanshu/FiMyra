import mongoose from 'mongoose';

// Track connection status
let isConnected = false;

/**
 * Connects to MongoDB database
 * Uses connection pooling and handles reconnection automatically
 */
export const connectDB = async (): Promise<void> => {
  // Set mongoose options
  mongoose.set('strictQuery', true);

  // If already connected, return early
  if (isConnected) {
    console.log('✅ MongoDB is already connected');
    return;
  }

  // Get MongoDB URI from environment variables
  const MONGODB_URI = process.env.MONGODB_URI;

  if (!MONGODB_URI) {
    throw new Error(
      '❌ Please define the MONGODB_URI environment variable inside .env.local'
    );
  }

  try {
    console.log('🔄 Connecting to MongoDB...');

    // Connect to MongoDB with optimized options
    const connection = await mongoose.connect(MONGODB_URI, {
      dbName: 'fimyra', // Database name
      maxPoolSize: 10, // Maintain up to 10 socket connections
      serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
      socketTimeoutMS: 45000, // Close connections after 45 seconds of inactivity
    });

    isConnected = connection.connections[0].readyState === 1;

    if (isConnected) {
      console.log('✅ MongoDB connected successfully');
      console.log(`📊 Database: ${connection.connections[0].name}`);
      console.log(`🌐 Host: ${connection.connections[0].host}:${connection.connections[0].port}`);
    }

  } catch (error) {
    console.error('❌ MongoDB connection failed:', error);
    
    // Reset connection status on error
    isConnected = false;
    
    // Re-throw error to be handled by the caller
    throw new Error(`Failed to connect to MongoDB: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

/**
 * Disconnects from MongoDB database
 * Useful for cleanup in serverless functions or testing
 */
export const disconnectDB = async (): Promise<void> => {
  if (!isConnected) {
    console.log('⚠️ MongoDB is not connected');
    return;
  }

  try {
    await mongoose.disconnect();
    isConnected = false;
    console.log('✅ MongoDB disconnected successfully');
  } catch (error) {
    console.error('❌ Error disconnecting from MongoDB:', error);
    throw error;
  }
};

/**
 * Get current connection status
 */
export const getConnectionStatus = (): boolean => {
  return isConnected && mongoose.connection.readyState === 1;
};

/**
 * Handle connection events
 */
mongoose.connection.on('connected', () => {
  console.log('🔗 Mongoose connected to MongoDB');
  isConnected = true;
});

mongoose.connection.on('error', (error) => {
  console.error('❌ Mongoose connection error:', error);
  isConnected = false;
});

mongoose.connection.on('disconnected', () => {
  console.log('🔌 Mongoose disconnected from MongoDB');
  isConnected = false;
});

// Handle process termination
process.on('SIGINT', async () => {
  try {
    await mongoose.connection.close();
    console.log('🛑 Mongoose connection closed through app termination');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error during graceful shutdown:', error);
    process.exit(1);
  }
});

export default { connectDB, disconnectDB, getConnectionStatus };