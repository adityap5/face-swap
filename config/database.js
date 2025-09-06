const { MongoClient } = require('mongodb');

let db;

const connectDB = async () => {
  try {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
      throw new Error('MONGODB_URI is not defined in .env');
    }

    const client = new MongoClient(uri);
    await client.connect();

    db = client.db(process.env.DB_NAME || 'faceswap');
    console.log('MongoDB Connected Successfully');
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
    process.exit(1);
  }
};

const getDB = () => {
  if (!db) {
    throw new Error('Database not initialized. Call connectDB() first.');
  }
  return db;
};

module.exports = { connectDB, getDB };
