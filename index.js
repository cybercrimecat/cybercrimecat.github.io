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

// Function to generate the HTML for the post list
function generatePostListHtml(posts) {
  let postListHtml = '<ul>';
  posts.forEach(post => {
    postListHtml += `<li><a href="/posts/${post.filename}">${post.title}</a></li>`;
  });
  postListHtml += '</ul>';
  return postListHtml;
}

// Function to inject the post list into any file (HTML, CSS, JS, etc.)
function injectPostList(content, postListHtml) {
  return content.replace('<div id="recentpostlistdiv"></div>', `<div id="recentpostlistdiv">${postListHtml}</div>`)
                .replace('<div id="postlistdiv"></div>', `<div id="postlistdiv">${postListHtml}</div>`);
}

// Serve all files in the site directory, injecting the post list if needed
app.get('/*', (req, res) => {
  let filePath = path.join(siteDir, req.path);

  // If root ("/") is requested, serve "index.html"
  if (req.path === '/' || req.path === '') {
    filePath = path.join(siteDir, 'index.html');
  }

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

    // Read the requested file (HTML, CSS, JS, etc.)
    fs.readFile(filePath, 'utf8', (err, content) => {
      if (err) {
        return res.status(404).send('File not found');
      }

      // Inject post list if placeholders exist
      const updatedContent = injectPostList(content, postListHtml);
      res.send(updatedContent);
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