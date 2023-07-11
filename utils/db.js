import { MongoClient } from 'mongodb';

const host = process.env.DB_HOST || '0.0.0.0';
const port = process.env.DB_PORT || 27017;
const database = process.env.DB_DATABASE || 'files_manager';
const url = `mongodb://${host}:${port}/`;

class DBClient {
  constructor() {
    this.db = null;
    this.users = null;
    this.files = null;

    MongoClient.connect(url, { useUnifiedTopology: true })
      .then((client) => {
        this.db = client.db(database);
        this.users = this.db.collection('users');
        this.files = this.db.collection('files');
        this.createCollections();
      })
      .catch((error) => {
        console.error('Error connecting to MongoDB:', error);
      });
  }

  createCollections() {
    this.users.createIndex({ email: 1 }, { unique: true })
      .catch((error) => {
        console.error('Error creating index:', error);
      });
  }

  isAlive() {
    return !!this.db;
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

  async getUser(query) {
    try {
      console.log('QUERY IN DB.JS', query);
      const user = await this.users.findOne(query);
      console.log('GET USER IN DB.JS', user);
      return user;
    } catch (error) {
      console.error('Error retrieving user:', error);
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
export default dbClient;
