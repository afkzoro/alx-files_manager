import AppController from '../controllers/AppController';
import UsersController from '../controllers/UsersController';
import AuthController from '../controllers/AuthController';
import FilesController from '../controllers/FilesController';

const express = require('express');

const router = (app) => {
  const paths = express.Router();
  app.use(express.json());
  app.use('/', paths);

  paths.get('/status', ((request, response) => AppController.getStatus(request, response)));
  paths.get('/stats', ((request, response) => AppController.getStats(request, response)));
  paths.post('/users', ((request, response) => UsersController.postNew(request, response)));
  paths.get('/connect', ((request, response) => AuthController.getConnect(request, response)));
  paths.get('/disconnect', ((request, response) => AuthController.getDisconnect(request, response)));
  paths.get('/users/me', ((request, response) => UsersController.getMe(request, response)));
  paths.post('/files', ((request, response) => FilesController.postUpload(request, response)));
  paths.get('/files/:id', ((request, response) => FilesController.getShow(request, response)));
  paths.get('/files', ((request, response) => FilesController.getIndex(request, response)));
  paths.put('/files/:id/publish', ((request, response) => FilesController.putPublish(request, response)));
  paths.put('/files/:id/unpublish', ((request, response) => FilesController.putUnpublish(request, response)));
  paths.get('/files/:id/data', ((request, response) => FilesController.getFile(request, response)));
};

export default router;
