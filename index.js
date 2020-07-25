//index.js
/**
* Required External Modules
*/

const express = require("express");
const path = require("path");
const router = express.Router();
const fs = require('fs');

/**
* App Variables
*/

const app = express();
const port = process.env.PORT || "8080";

/**
*  App Configuration
*/

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");
app.use(express.static(path.join(__dirname, "public")));

/**
* Routes Definitions
*/
app.get("/", (req, res) => {
  res.render("index", { title: "Home"});
});

app.get('/video', (req, res) => {
  const vpath = 'public/assets/samplevideo.mp4';

  fs.stat(vpath, (err, stat) => {

    // Handle file not found
    if (err !== null && err.code === 'ENOENT') {
      res.sendStatus(404);
    }

    const fileSize = stat.size
    const range = req.headers.range

    if (range) {

      const parts = range.replace(/bytes=/, "").split("-");

      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize-1;
                                                                  
      const chunksize = (end-start)+1;
      const file = fs.createReadStream(vpath, {start, end});
      const head = {
        'Content-Range': `bytes ${start}-${end}/${fileSize}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunksize,
        'Content-Type': 'video/mp4',
      }

        res.writeHead(206, head);
        file.pipe(res);
      } else {
      const head = {
        'Content-Length': fileSize,
        'Content-Type': 'video/mp4',
      }
                                                                                                                                                                                                                             res.writeHead(200, head);
      fs.createReadStream(vpath).pipe(res);
    }
  });
});

/**
* Server Activation
*/
app.listen(port, () => {
  console.log(`Listening to requests on http://localhost:${port}`);
});

