# directory-server

Small application to serve a directory from a network drive, this application will help you serve a directory from D:/myFolder into http://localhost:3270/

You have fetch your a directory list from a json file like below located on index.js

```
request.get("http://<example.com>/link.json", function(
  err,
  response,
  body
) {
  if (!err && response.statusCode == 200) {
    var locals = JSON.parse(body);

    for (var i = 0; i < locals.length; i++) {
      console.log("serving " + locals[i].title);

      apps.use(locals[i].title, serveIndex(path.join(locals[i].path)));
      apps.use(locals[i].title, express.static(path.join(locals[i].path)));
    }
  }
});

```

Sample Json data

```
[

  {

    "title": "/MyDirectory",

    "path": "//NetworkDrive/PublicFiles/"

  } 

]

```

Then Run NPM Start

```
npm start
```

Then using your web browser navigate to http://localhost:3270 you can change the port number located on index.js

```
server.listen(process.env.PORT || 3270);
```
