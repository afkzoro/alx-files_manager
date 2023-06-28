const sha1 = require('sha1');
const { v4: uuidv4 } = require('uuid');
const redisClient = require('../utils/redis');
const dbClient = require('../utils/db');

class AuthController {
  static async getConnect(req, res) {
    const authHeader = req.header('Authorization');

    if (!authHeader || !authHeader.startsWith('Basic ')) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const encodedCredentials = authHeader.slice(6);
    const decodedCredentials = Buffer.from(encodedCredentials, 'base64').toString();
    const [email, password] = decodedCredentials.split(':');

    if (!email || !password) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
      const hashedPassword = sha1(password);
      const user = await dbClient.users.findOne({ email, password: hashedPassword });

      if (!user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const token = uuidv4();
      const key = `auth_${token}`;
      await redisClient.set(key, user._id.toString(), 24 * 60 * 60);

      return res.status(200).json({ token });
    } catch (error) {
      console.error('Error signing in:', error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  static async getDisconnect(req, res) {
    const token = req.header('X-Token');

    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
      const key = `auth_${token}`;
      const userId = await redisClient.get(key);

      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      await redisClient.del(key);

      return res.status(204).send();
    } catch (error) {
      console.error('Error signing out:', error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  static async getMe(req, res) {
    const token = req.header('X-Token');

    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
      const key = `auth_${token}`;
      const userId = await redisClient.get(key);

      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const user = await dbClient.users.findById(userId, { email: 1, _id: 1 });

      if (!user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      return res.json({ email: user.email, id: user._id });
    } catch (error) {
      console.error('Error retrieving user:', error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }
}

module.exports = AuthController;
