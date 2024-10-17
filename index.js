const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const postsDir = path.join(__dirname, 'site/posts'); // Adjust the path if necessary

// Middleware to block access to /unlisted/ path
app.use('/unlisted', (req, res, next) => {
  res.status(403).send('Access to this directory is forbidden.');
});

// Serve static files from the public folder
app.use(express.static('site'));

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
    res.sendFile(__dirname + '/site/index.html');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
