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
    if (userIsAuthorized(req)) {
        res.redirect("/createLesson");
        return;
    }
    res.render("html/index.hbs", {
        layout: "default"
    });
});

app.post("/", upload.none(), (req, res) => {
    const result = req.body;
    const login = result["login"];
    const password = result["password"];
    const hash = crypto.createHash('md5').update(login+password).digest("hex")
    if (!Object.keys(users).includes(login)) {
        users[login] = {
            password,
            hash
        };
        res.cookie(
            "user",
            hash,
            {maxAge: 9000000, httpOnly: true});
    }
    if (users[login].password !== password) {
        res.send("Неверный пароль или имя пользователя");
    }
    res.redirect("/createLesson");
});

app.get("/createLesson", (req, res) => {
    if (userIsAuthorized(req)) {
        res.render("html/createLesson.hbs", {
            layout: "default"
        });
        return;
    }
    res.redirect("/");
});

app.post("/createLesson", upload.none(), (req, res) => {
    const result = req.body;
    const lessonName = result.lesson;
    //todo
});

const students = [
    {
        name: "student1",
        question: true,
        answer: true,
        points: 0
    },
    {
        name: "student2",
        question: false,
        answer: false,
        points: 0
    },
    {
        name: "student3",
        question: true,
        answer: false,
        points: 0
    },
    {
        name: "student4",
        question: false,
        answer: true,
        points: 0
    },

];

function userIsAuthorized(req) {
    const hash = req.cookies.user;
    return hash && userWithHashExists(hash);
}

function userWithHashExists(hash)
{
    for (const user of Object.values(users)) {
        if (user.hash === hash)
            return true;
    }
    return false;
}

app.get("/students", (_, res) => {
    res.render("html/studentsResults.hbs", {
        layout: "default",
        students: students
    });
});

app.listen(port, () => console.log(`App listening on port ${port}`));
