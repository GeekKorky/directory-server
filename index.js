const electron = require("electron");
const { app, BrowserWindow, Menu, ipcMain, Tray, dialog, shell } = electron;
const url = require("url");
const path = require("path");
var fs = require("fs");
const fetch = require("electron-fetch");
// var AutoLaunch = require("auto-launch");
var express = require("express");
var apps = express();
var server = require("http").createServer(apps);
var io = require("socket.io").listen(server);
var bodyParser = require("body-parser");
apps.use(bodyParser.json()); // support json encoded bodies
apps.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies
var glob = require("glob");
var serveIndex = require("serve-index");
var request = require("request");

let win;
let appIcon = null;

// var appLauncher = new AutoLaunch({
//     name: 'SMT-Dashboard-software'
// });

server.listen(process.env.PORT || 3270);
console.log("listening to port 3270, server is running..");

request.get("http://localhost/server/link.json", function(
  err,
  response,
  body
) {
  if (!err && response.statusCode == 200) {
    var locals = JSON.parse(body);
    //res.render("<YOUR TEMPLATE>", locals);

    for (var i = 0; i < locals.length; i++) {
      console.log("serving " + locals[i].title);

      apps.use(locals[i].title, serveIndex(path.join(locals[i].path)));
      apps.use(locals[i].title, express.static(path.join(locals[i].path)));
    }
  }
});

apps.get("/", function(req, res) {
  // res.sendFile(__dirname + "/about.html");

  request.get("http://proweb.ecp.priv/server/link.json", function(
    err,
    response,
    body
  ) {
    if (!err && response.statusCode == 200) {
      var locals = JSON.parse(body);
      //res.sendFile(__dirname + "/about.html", locals);
      var output = "";
      for (var i = 0; i < locals.length; i++) {
        output +=
          "<li>" +
          "<a href='" +
          locals[i].title +
          "'>" +
          locals[i].title +
          "</a>";
        ("</li>");
      }

      res.send(
        `<!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <meta http-equiv="X-UA-Compatible" content="ie=edge" />
          <title>Server List | Directory Server</title>
          <link rel="shortcut icon" href="favicon.ico" type="image/x-icon" />
        </head>
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
      
          body {
            font-family: Arial, Helvetica, sans-serif;
            font-size: 2rem;
          }
      
          .container {
            padding: 50px;
          }
      
          h2 {
            letter-spacing: 10px;
          }
      
          ul {
            list-style: none;
          }
      
          a {
            text-decoration: none;
          }
        </style>
      
        <body>
          <div class="container">
            <h2>Servers Directory</h2>
            <hr />
            <br />
            <ul>
              ` +
          output +
          `
            </ul>
          </div>
        </body>
      </html>
      `
      );
    }
  });
});

// var tmp = "//phapplagstorage/process$/PROCESS ENGG - AISMT/PROCESS/SPI/GBX/";
// var dbWIS = "//phapplagstorage/process$/AISMT/WIS FOLDER/DB Modified WIS/";

// apps.use("/db", serveIndex(path.join(dbWIS)));
// apps.use("/db", express.static(path.join(dbWIS)));

var shouldQuit = app.makeSingleInstance(function(
  commandLine,
  workingDirectory
) {
  // Someone tried to run a second instance, we should focus our window.
  if (win) {
    if (win.isMinimized()) win.restore();
    win.focus();
  }
});

if (shouldQuit) {
  app.quit();
  return;
}

app.on("ready", () => {
  let win = new BrowserWindow({
    minWidth: 250,
    minHeight: 250,
    width: 220,
    height: 250,
    icon: __dirname + "/favicon.ico",
    maximizable: false,
    resizable: false
  });
  win.setMenu(null);

  win.loadURL(`file://${__dirname}/index.html`);

  // win.loadURL('http://proweb/process/tools/capabilityV2/lines-dashboard.php');

  // win.webContents.openDevTools();
  //win.setFullScreen(true)
  win.hide();

  appIcon = new Tray(__dirname + "/favicon.ico");
  appIcon.setToolTip("Directory server | version " + app.getVersion());
  const contextMenu = Menu.buildFromTemplate([
    {
      label: "Server at port 3270"
    },
    {
      label: "Show App",
      click: function() {
        win.show();
      }
    },
    {
      label: "Quit",
      click: function() {
        app.isQuiting = true;
        app.quit();
      }
    }
  ]);

  appIcon.on("double-click", () => {
    win.show();
    // win.maximize();
  });

  // Call this again for Linux because we modified the context menu
  appIcon.setContextMenu(contextMenu);

  win.on("minimize", function(event) {
    event.preventDefault();
    win.hide();
  });

  win.on("close", function(event) {
    if (!app.isQuiting) {
      event.preventDefault();
      win.hide();
    }
    return false;
  });

  ipcMain.on("item:sendMessage", function(e, item) {
    console.log("restored!");
    win.show();
    //win.maximize();
  });
});
