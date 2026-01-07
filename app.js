// app.js

const express = require('express');
const path = require('path');
const showdown = require('showdown');
const fs = require('fs');
const logger = require('morgan');
const cookieParser = require('cookie-parser');

// Initialize Express
const app = express();

// Set up logging
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Set up static files
app.use(express.static(path.join(__dirname, 'public')));

// Set up Showdown for markdown conversion
const converter = new showdown.Converter();

// Set up the blog posts path
const blogPostsPath = path.join(__dirname, 'blog-posts');

// Helper function to read markdown file and return HTML
function getPostContent(postName) {
  const filePath = path.join(blogPostsPath, `${postName}.md`);
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    return converter.makeHtml(content);
  } catch {
    throw new Error(`Post ${postName} not found`);
  }
}

// Index route
app.get('/', (req, res) => {
  try {
    const postNames = fs.readdirSync(blogPostsPath, 'utf8')
      .filter(file => file.endsWith('.md'))
      .map(file => file.slice(0, -3));
    res.render('index', { postNames });
  } catch (err) {
    res.status(500).render('error', { message: 'Error loading blog posts', error: err });
  }
});

// Post route
app.get('/posts/:postName', (req, res) => {
  try {
    const postName = req.params.postName;
    const content = getPostContent(postName);
    res.render('post', { postName, content });
  } catch (err) {
    res.status(404).render('error', { message: 'Post not found', error: err });
  }
});

// View engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Error handler
app.use((err, req, res, next) => {
  res.status(err.status || 500).render('error', {
    message: err.message,
    error: err
  });
});

// Listening port
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

module.exports = app;
```

```javascript
// views/index.ejs
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Blog</title>
</head>
<body>
  <h1>Blog Posts</h1>
  <ul>
    <% postNames.forEach(postName => { %>
      <li>
        <a href="/posts/<%= postName %>"><%= postName %></a>
      </li>
    <% }); %>
  </ul>
</body>
</html>
```

```javascript
// views/post.ejs
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title><%= postName %></title>
</head>
<body>
  <h1><%= postName %></h1>
  <%- content %>
</body>
</html>
```

```javascript
// views/error.ejs
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Error</title>
</head>
<body>
  <h1><%= message %></h1>
  <p><%= error.stack %></p>
</body>
</html>