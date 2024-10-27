require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const bodyParser = require('body-parser')
const dns = require('dns')

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

app.use(bodyParser.urlencoded({ extended: false }))

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});

const shortedUrlIds = []

function isValidURL(url) {
  const urlPattern = new RegExp(
    '^(https?:\\/\\/)?' + // Protocol (http or https)
    '((([a-zA-Z\\d]([a-zA-Z\\d-]*[a-zA-Z\\d])*)\\.)+[a-zA-Z]{2,}|' + // Domain name
    '((\\d{1,3}\\.){3}\\d{1,3}))' + // OR IP address
    '(\\:\\d+)?' + // Port
    '(\\/[-a-zA-Z\\d%_.~+]*)*' + // Path
    '(\\?[;&a-zA-Z\\d%_.~+=-]*)?' + // Query string
    '(\\#[-a-zA-Z\\d_]*)?$',
    'i'
  );

  return !!urlPattern.test(url);
}

app.post('/api/shorturl', async (req, res) => {
  const url = req.body.url 

  if (!url) {
    res.json({
      error: 'invalid url'
    })

    return
  }

  const err = !isValidURL(req.body.url)

    if (err) {
      res.json({
        error: 'invalid url'
      })
    } else {
      const existingUrl = shortedUrlIds.find(urlObj => {
        return urlObj.originalUrl == url
      })

      if (existingUrl) {
        res.json({
          original_url: url,
          short_url: existingUrl.shortUrl
        })
      }

      let shortUrlNumber = Math.round(Math.random() * 99999)

      const existedNumber = shortedUrlIds.find(urlObj => {
        return urlObj.shortUrl == shortUrlNumber
      })

      if (existedNumber) {
        shortUrlNumber = Math.round(Math.random() * 99999)
      }

      const shortedUrl = {
        originalUrl: url,
        shortUrl: shortUrlNumber
      }

      shortedUrlIds.push(shortedUrl)

      res.json({
        original_url: url,
        short_url: shortedUrl.shortUrl
      })
    }
  

})

app.get('/api/shorturl/:id', async(req, res) => {
  const id = req.params.id

  if (!Number(id)) {
    res.redirect('/')
  }

  const existShortUrl =   shortedUrlIds.find(urlObj => {
    return urlObj.shortUrl == id
  })

  if (!existShortUrl) {
    res.redirect('/')
  }

  res.redirect(existShortUrl.originalUrl)

})