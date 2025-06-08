// Usa import type per evitare conflitti di dichiarazione multipla
import type { Router } from 'express';
import express = require('express');
const router: Router = express.Router();
const { register, login } = require('../controllers/authController');

router.post('/register', register);
router.post('/login', login);

export = router;
