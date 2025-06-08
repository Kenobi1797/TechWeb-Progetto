const express = require('express');
const cors = require('cors');
require('dotenv').config();

const initDb = require('./config/initDb');
const authRoutes = require('./routes/auth');
const catRoutes = require('./routes/cats');
const commentRoutes = require('./routes/comments');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/auth', authRoutes);
app.use('/uploads', express.static('uploads'));
app.use('/cats', catRoutes);
app.use('/comments', commentRoutes);

const PORT = process.env.PORT || 4000;

initDb()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server listening on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error('Error initializing the database', err);
    process.exit(1);
  });
