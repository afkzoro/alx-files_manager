import redisClient from '../utils/redis';
import dbClient from '../utils/db';

class AppController {
  static async getStatus(req, res) {
    const redisStatus = await redisClient.isAlive();
    const dbStatus = await dbClient.isAlive();

    return res.status(200).json({ redis: redisStatus, db: dbStatus });
  }

  static async getStats(req, res) {
    try {
      const userCount = await dbClient.nbUsers();
      const fileCount = await dbClient.nbFiles();

      return res.status(200).json({ users: userCount, files: fileCount });
    } catch (error) {
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }
}

module.exports = AppController;
