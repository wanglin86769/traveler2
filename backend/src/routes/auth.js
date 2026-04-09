const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const jwt = require('jsonwebtoken');
const { User } = require('../models/User');
const ApiError = require('../utils/ApiError');
const authController = require('../controllers/auth');
const { authenticate } = require('../middleware/auth');
const { validateRequest } = require('../middleware/validation');

const config = require('../config');

router.post('/login', [
  body('username').notEmpty().withMessage('Username is required'),
  body('password').notEmpty().withMessage('Password is required')
], validateRequest, authController.login);

router.get('/me', authenticate, authController.getMe);

router.post('/logout', authenticate, authController.logout);

router.post('/refresh', authenticate, authController.refreshToken);

router.get('/providers', authController.getProviders);

module.exports = router;