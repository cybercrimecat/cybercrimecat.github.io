const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const siteDir = path.join(__dirname, 'site');
const postsDir = path.join(siteDir, 'posts');

// Middleware to block access to /unlisted/ path
app.use('/unlisted', (req, res, next) => {
  res.status(403).send('Access to this directory is forbidden.');
});

// Serve static files from the 'site' folder
app.use(express.static(siteDir));

// Function to generate the HTML for the post list
function generatePostListHtml(posts) {
  let postListHtml = '<ul>';
  posts.forEach(post => {
    postListHtml += `<li><a href="/posts/${post.filename}">${post.title}</a></li>`;
  });
  postListHtml += '</ul>';
  return postListHtml;
}

// Serve the index with posts embedded in the HTML
app.get('/', (req, res) => {
  fs.readdir(postsDir, (err, files) => {
    if (err) {
      return res.status(500).send('Unable to scan posts directory');
    }

    const posts = files
      .filter(file => file.endsWith('.html'))
      .map(file => ({
        filename: file,
        title: file.replace(/-/g, ' ').replace('.html', ''),
      }));

    const postListHtml = generatePostListHtml(posts);
    
    // Read the index.html file and inject the post list into it
    fs.readFile(path.join(siteDir, 'main.html'), 'utf8', (err, html) => {
      if (err) {
        return res.status(500).send('Unable to read index.html');
      }

      // Inject the post list into a placeholder in the HTML
      const updatedHtml = html.replace('<div id="recentpostlistdiv"></div>', `<div id="recentpostlistdiv">${postListHtml}</div>`);
      res.send(updatedHtml);
    });
  });
});

// Serve the posts.html with embedded post list
app.get('/posts', (req, res) => {
  fs.readdir(postsDir, (err, files) => {
    if (err) {
      return res.status(500).send('Unable to scan posts directory');
    }

    const posts = files
      .filter(file => file.endsWith('.html'))
      .map(file => ({
        filename: file,
        title: file.replace(/-/g, ' ').replace('.html', ''),
      }));

    const postListHtml = generatePostListHtml(posts);

    // Read the posts.html file and inject the post list into it
    fs.readFile(path.join(siteDir, 'posts.html'), 'utf8', (err, html) => {
      if (err) {
        return res.status(500).send('Unable to read posts.html');
      }

      // Inject the post list into a placeholder in the HTML
      const updatedHtml = html.replace('<div id="postlistdiv"></div>', `<div id="postlistdiv">${postListHtml}</div>`);
      res.send(updatedHtml);
    });
  });
});

// Serve the 404 page if no other route matches
app.use((req, res, next) => {
  res.status(404).sendFile(path.join(siteDir, '404.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});