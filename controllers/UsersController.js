const sha1 = require('sha1');
const dbClient = require('../utils/db');
const redisClient = require('../utils/redis');

class UsersController {
  static async postNew(req, res) {
    const { email, password } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Missing email' });
    }

    if (!password) {
      return res.status(400).json({ error: 'Missing password' });
    }

    try {
      const userExists = await dbClient.users.findOne({ email });
      if (userExists) {
        return res.status(400).json({ error: 'Already exist' });
      }

      const hashedPassword = sha1(password);
      const newUser = await dbClient.users.create({
        email,
        password: hashedPassword,
      });

      const { _id, email: newUserEmail } = newUser;

      return res.status(201).json({ id: _id, email: newUserEmail });
    } catch (error) {
      console.error('Error creating new user:', error);
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

      return res.json({ id: user._id, email: user.email });
    } catch (error) {
      console.error('Error retrieving user:', error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }
}

module.exports = UsersController;
