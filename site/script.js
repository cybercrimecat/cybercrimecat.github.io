let blogName = "vio's blog";
let authorName = "vio";
let authorLink = "https://twitter.com/cybercrimekitty";

let postsArray = [];

let url = window.location.pathname;

const postDateFormat = /\d{4}\-\d{2}\-\d{2}\-/;

let relativePath = ".";
if (url.includes("posts/")) {
  relativePath = "..";
}

let headerHTML = '<ul> <li><a href="' + relativePath + '/index.html">home</a></li>' +
  '<li><a href="' + relativePath + '/posts.html">posts</a></li>' +
  '<li><a href="' + relativePath + '/about.html">about</a></li> </ul>';

let footerHTML = "<hr><p>written by <a href='" + authorLink + "'>" + authorName + "</a>.</p>";

// Fetch posts from the API
fetch('/api/posts')
  .then(response => response.json())
  .then(data => {
    postsArray = data.map(post => [ "posts/" + post.filename, post.title ]);
    updatePostList();
  })
  .catch(err => console.error('Error fetching posts:', err));

function updatePostList() {
  let postListHTML = "<ul>";
  for (let i = 0; i < postsArray.length; i++) {
    postListHTML += formatPostLink(i);
  }
  postListHTML += "</ul>";

  let recentPostsCutoff = 3;
  let recentPostListHTML = "<h2>Recent Posts:</h2><ul>";
  let numberOfRecentPosts = Math.min(recentPostsCutoff, postsArray.length);
  for (let i = 0; i < numberOfRecentPosts; i++) {
    recentPostListHTML += formatPostLink(i);
  }

  if (postsArray.length > recentPostsCutoff) {
    recentPostListHTML += '<li class="moreposts"><a href=' + relativePath + '/archive.html>\u00BB more posts</a></li></ul>';
  } else {
    recentPostListHTML += "</ul>";
  }

  if (document.getElementById("postlistdiv")) {
    document.getElementById("postlistdiv").innerHTML = postListHTML;
  }
  if (document.getElementById("recentpostlistdiv")) {
    document.getElementById("recentpostlistdiv").innerHTML = recentPostListHTML;
  }
}

function formatPostLink(i) {
  let postTitle_i = postsArray[i][1];
  if (postDateFormat.test(postsArray[i][0].slice(6, 17))) {
    return '<p><li><a href="' + relativePath + '/' + postsArray[i][0] + '">' + postsArray[i][0].slice(6, 16) + " \u00BB " + postTitle_i + '</a></li></p>';
  } else {
    return '<p><li><a href="' + relativePath + '/' + postsArray[i][0] + '">' + postTitle_i + '</a></li></p>';
  }
}
