/* eslint-disable */
const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const { DB_HOST = '127.0.0.1', DB_PORT = 27017, DB_DATABASE = 'files_manager' } = process.env;
const url = `mongodb://${DB_HOST}:${DB_PORT}/${DB_DATABASE}`;

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
});

const filesSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  name: { type: String, required: true },
  type: { type: String, required: true },
  isPublic: { type: Boolean, default: false },
  parentId: { type: String, default: '0' },
  localPath: { type: String },
});

class DBClient {
  constructor() {
    this.connect();
    this.users = mongoose.model('User', userSchema);
    this.files = mongoose.model('File', filesSchema);
  }

  async connect() {
    try {
      await mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true });
      console.log('Connected to MongoDB');
    } catch (error) {
      console.error('Error connecting to MongoDB:', error);
      process.exit(1);
    }
  }

  async isAlive() {
    return mongoose.connection.readyState === 1;
  }

  async nbUsers() {
    try {
      const count = await this.users.countDocuments();
      return count;
    } catch (error) {
      console.error('Error retrieving the number of users:', error);
      throw error;
    }
  }

  async nbFiles() {
    try {
      const count = await this.files.countDocuments();
      return count;
    } catch (error) {
      console.error('Error retrieving the number of files:', error);
      throw error;
    }
  }
}

const dbClient = new DBClient();
module.exports = dbClient;
