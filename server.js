const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const hbs = require("express-handlebars");
const multer  = require('multer');
const upload = multer();
const crypto = require("crypto");

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

const users = {};

app.get("/", (req, res) => {
    if (req.cookies.user) {
        if (Object.entries(users).length !== 0) {
            res.redirect("/createLesson");
        } else {
            res.render("html/index.hbs", {
                layout: "default"
            });
        }
    }
});

app.post("/", upload.none(), (req, res) => {
    const result = req.body;
    const login = result["login"];
    const password = result["password"];
    if (!Object.keys(users).includes(login)) {
        users[login] = password;
    }
    if (users[login] !== password) {
        res.send("Неверный пароль или имя пользователя");
    }
    res.cookie(
        "user",
        crypto.createHash('md5').update(login+password).digest("hex"),
        {maxAge: 9000000, httpOnly: true});
    res.redirect("/createLesson");
});

app.get("/createLesson", (_, res) => {
    res.render("html/createLesson.hbs", {
        layout: "default"
    });
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


