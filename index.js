const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const siteDir = path.join(__dirname, 'site'); // Serve from the 'site' directory
const postsDir = path.join(siteDir, 'posts'); // Adjusted path for posts

// Middleware to block access to /unlisted/ path
app.use('/unlisted', (req, res, next) => {
  res.status(403).send('Access to this directory is forbidden.');
});

// Serve static files from the 'site' folder
app.use(express.static(siteDir)); // Now serving the entire 'site' folder

// API to get the list of posts
app.get('/api/posts', (req, res) => {
  fs.readdir(postsDir, (err, files) => {
    if (err) {
      return res.status(500).json({ error: 'Unable to scan posts directory' });
    }

    // Filter HTML files
    const posts = files
      .filter(file => file.endsWith('.html'))
      .map(file => ({
        filename: file,
        title: file.replace(/-/g, ' ').replace('.html', ''),
      }));

    res.json(posts);
  });
});

app.get('/', (req, res) => {
  res.sendFile(path.join(siteDir, 'index.html')); // Serve index.html from 'site'
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});