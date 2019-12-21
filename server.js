const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const hbs = require("express-handlebars");
const multer  = require('multer');
const upload = multer();

const rootDir = process.cwd();
const port = process.env.PORT || 5000;

const app = express();

app.use(express.static('static'));

app.use(cookieParser());

app.use(bodyParser.json());

app.use(express.json());

app.engine(
    "hbs",
    hbs({
        extname: "hbs",
        defaultView: "default",
        layoutsDir: path.join(rootDir, "views/layouts"),
    })
);

app.get("/", (_, res) => {
    res.render("html/index.hbs", {
        layout: "default"
    });
});

app.get("/authTeacher", (_, res) => {
   res.render("html/authTeacher.hbs", {
       layout: "default"
   });
});

app.post("/authTeacher", (req, res) => {
   const login = req.query.login;
   const password = req.query.password;
   console.log(login + password);
});

app.post("/", upload.none(), (req, res) => {
    let result = req.body;
    console.log(result);
    let currentScore = 0;
    for (const question of questions) {
        if (result[question.index]) {
            if (result[question.index] === question.answer) {
                currentScore++;
            }
        } else {
            console.log(`have no answer for question ${question.name}`)
        }
    }
    console.log(currentScore);
    score = currentScore;
    res.redirect('/');
});

app.listen(port, () => console.log(`App listening on port ${port}`));

// app.get("/json", (req, res) => {
// //     res.json({ 'login' : 'lol', 'password' : 'kek' });
// // });
// //
// // app.get('/user/:id', function (req, res, next) {
// //     res.end(req.params.id);
// // });

