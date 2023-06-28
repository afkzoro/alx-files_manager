/* eslint-disable */
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const dbClient = require('../utils/db');
const redisClient = require('../utils/redis');

class FilesController {
  static async postUpload(req, res) {
    const { name, type, parentId = '0', isPublic = false, data } = req.body;
    const token = req.header('X-Token');

    if (!name) {
      return res.status(400).json({ error: 'Missing name' });
    }

    if (!type || !['folder', 'file', 'image'].includes(type)) {
      return res.status(400).json({ error: 'Missing type' });
    }

    if (type !== 'folder' && !data) {
      return res.status(400).json({ error: 'Missing data' });
    }

    try {
      const userId = await redisClient.get(`auth_${token}`);

      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const user = await dbClient.users.findById(userId);
      if (!user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      if (parentId !== '0') {
        const parentFile = await dbClient.files.findById(parentId);
        if (!parentFile) {
          return res.status(400).json({ error: 'Parent not found' });
        }

        if (parentFile.type !== 'folder') {
          return res.status(400).json({ error: 'Parent is not a folder' });
        }
      }

      let localPath;
      if (type !== 'folder') {
        const folderPath = process.env.FOLDER_PATH || '/tmp/files_manager';
        localPath = `${folderPath}/${uuidv4()}`;

        // Create directory if it doesn't exist
        if (!fs.existsSync(folderPath)) {
          fs.mkdirSync(folderPath, { recursive: true });
        }

        // Write file to local path
        fs.writeFileSync(localPath, Buffer.from(data, 'base64'));
      }

      const newFile = await dbClient.files.create({
        userId,
        name,
        type,
        isPublic,
        parentId,
        localPath: localPath || '',
      });

      return res.status(201).json(newFile);
    } catch (error) {
      console.error('Error uploading file:', error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  static async getShow(req, res) {
    const { id } = req.params;
    const token = req.header('X-Token');

    try {
      const userId = await redisClient.get(`auth_${token}`);

      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const file = await dbClient.files.findOne({ _id: id, userId });

      if (!file) {
        return res.status(404).json({ error: 'Not found' });
      }

      return res.json(file);
    } catch (error) {
      console.error('Error retrieving file:', error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  static async getIndex(req, res) {
    const { parentId = '0', page = 0 } = req.query;
    const token = req.header('X-Token');
    const pageSize = 20;
    const skip = page * pageSize;

    try {
      const userId = await redisClient.get(`auth_${token}`);

      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const files = await dbClient.files
        .find({ parentId, userId })
        .skip(skip)
        .limit(pageSize)
        .toArray();

      return res.json(files);
    } catch (error) {
      console.error('Error retrieving files:', error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  static async putPublish(req, res) {
    const { id } = req.params;
    const token = req.header('X-Token');

    try {
      const userId = await redisClient.get(`auth_${token}`);

      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const file = await dbClient.files.findOneAndUpdate(
        { _id: id, userId },
        { isPublic: true },
        { new: true }
      );

      if (!file) {
        return res.status(404).json({ error: 'Not found' });
      }

      return res.json(file);
    } catch (error) {
      console.error('Error publishing file:', error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  static async putUnpublish(req, res) {
    const { id } = req.params;
    const token = req.header('X-Token');

    try {
      const userId = await redisClient.get(`auth_${token}`);

      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const file = await dbClient.files.findOneAndUpdate(
        { _id: id, userId },
        { isPublic: false },
        { new: true }
      );

      if (!file) {
        return res.status(404).json({ error: 'Not found' });
      }

      return res.json(file);
    } catch (error) {
      console.error('Error unpublishing file:', error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }
}

module.exports = FilesController;
