//index.js
/**
* Required External Modules
*/

const express = require("express");
const path = require("path");
const router = express.Router();
const fs = require('fs');
const bodyParser = require('body-parser');

var count = 1;
var connections = {};

/**
* App Variables
*/

const app = express();
const port = process.env.PORT || "8080";

var globalState;

/**
* Server Activation
*/
server = app.listen(port, () => {
  console.log(`Listening to requests on http://localhost:${port}`);
});


const http = require('http').Server(app);
const io = require('socket.io')(server);

io.on('connection', (socket) => {
  socket.on('videoState', (state) => {
    connections[socket.id] = state;
    console.log('videoState: ' + String(connections[socket.id].currentTime));
    socket.broadcast.emit('stateChange', state);
    console.log("end");
  });
});

/**
*  App Configuration
*/

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");
app.use(express.static(path.join(__dirname, "public")));
app.use(bodyParser.json());

app.use(function (req, res, next) {
  // website you wish to allow to connect
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:8080');

  // Request methods you wish to allow
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

  // Request headers you wish to allow
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

  // Set to true if you need the website to include cookies in the requests sent
  // to the API (e.g. in case you use sessions)
  res.setHeader('Access-Control-Allow-Credentials', true);

  // Pass to next layer of middleware
  next();
});

/**
* Routes Definitions
*/
app.get("/", (req, res) => {
  res.render("index", { title: "Home"});
});

app.post("/", (req, res) => {
  console.log(req.body);
  res.statusCode = 200;
  res.json(req.body);
  io.emit('state', req.body);
});

app.get('/playback', (req,res) =>  {
  res.json(["Video Playing"]);
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

