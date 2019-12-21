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

const teachers = {};

app.get("/", (req, res) => {
    if (teacherIsAuthorized(req)) {
        res.redirect("/createLesson");
        return;
    }
    res.render("html/index.hbs", {
        layout: "default"
    });
});

app.get("/logout", (req, res) => {
   res.status(200).clearCookie('teacher', {
       path: "/"
   });
   res.redirect("/");
});

app.post("/", upload.none(), (req, res) => {
    const result = req.body;
    const login = result["login"];
    const password = result["password"];
    const hash = crypto.createHash('md5').update(login+password).digest("hex")
    if (!Object.keys(teachers).includes(login)) {
        teachers[login] = {
            password,
            hash,
            lessons: {}
        };
        res.cookie(
            "teacher",
            hash,
            {maxAge: 9000000, httpOnly: true});
    }
    if (teachers[login].password !== password) {
        res.send("Неверный пароль или имя пользователя");
    }
    res.redirect("/createLesson");
});

app.get("/createLesson", (req, res) => {
    if (teacherIsAuthorized(req)) {
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
    const teacherLogin = getTeacherByHash(req);
    const link = req.protocol + "://" + req.get('host') + `/${teacherLogin}/${lessonName}`;
    teachers[teacherLogin].lessons[lessonName] = { students: [], link };
    res.redirect(link);
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

app.get("/:teacherLogin/:lessonName", (req, res) => {
    const teacherLogin = req.params.teacherLogin;
    const lessonName = req.params.lessonName;
    if (teacherIsAuthorized(req)) {
        res.render("html/studentsResults.hbs", {
            layout: "default",
            students: teachers[teacherLogin].lessons[lessonName].students,
            link: teachers[teacherLogin].lessons[lessonName].link,
            lessonName
        });
    } else {

    }
});

app.listen(port, () => console.log(`App listening on port ${port}`));

function teacherIsAuthorized(req) {
    const hash = req.cookies.teacher;
    return hash && teacherWithHashExists(hash);
}

function teacherWithHashExists(hash)
{
    for (const teacher of Object.values(teachers)) {
        if (teacher.hash === hash)
            return true;
    }
    return false;
}

function getTeacherByHash(req) {
    const hash = req.cookies.teacher;
    for (const [login, teacher] of Object.entries(teachers)) {
        if (teacher.hash === hash)
            return login;
    }
    return false;
}
