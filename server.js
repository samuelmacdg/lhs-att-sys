/*jshint esversion: 11 */

//npm modules
const express = require('express');
const uuid = require('uuid').v4;
const session = require('express-session');

const url = require('url');
const fs = require('fs');
const FileStore = require('session-file-store')(session);
const LocalStrategy = require('passport-local').Strategy;
const sqlite = require("better-sqlite3");
const SqliteStore = require("better-sqlite3-session-store")(session);

const dbPath = "./.data/attendance.db";

const nodemailer = require('nodemailer');
const bodyParser = require('body-parser');
const passport = require('passport');
const sqlite3 = require("sqlite3").verbose();
const sessionDb = new sqlite("./.data/sessions.db", {});
const dataDb = new sqlite3.Database(dbPath);

passport.use(new LocalStrategy(
    { usernameField: 'email' },
    (email, password, done) => {
        let user;
        dataDb.get("select * from users where username = ?", [email], (err, row) => {
            user = row;
            if (err) {
                return done(null, false, { code: 3, message: err });
            }
            if (!user) {
                return done(null, false, { code: 2, message: 'User Not Found' });
            }
            if (password != user.password) {
                return done(null, false, { code: 1, message: 'Wrong Password.' });
            }
            return done(null, user);
        });
    }
));

passport.serializeUser((user, done) => {
    return done(null, user.id);
});

passport.deserializeUser((id, done) => {
    try {
        dataDb.get("select * from users where id = ?", [id], (err, row) => {
            if (err) { return done(error, false); }
            return done(null, row);
        });
    } catch (error) {
        return done(error, false);
    }
});

const app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(session({
    genid: (req) => {
        console.log('Inside the session middleware');
        console.log(req.sessionID);
        return uuid(); // use UUIDs for session IDs
    },
    store: new SqliteStore({
        client: sessionDb,
        expired: {
            clear: true,
            intervalMs: 604800000 //ms = 15min
        }
    }),//new FileStore(),//new SqliteStore({driver: sqlite3.Database, path : dbFile, ttl: 300, cleanupInterval: 86400000}),
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true
}));
app.use(express.static('src/pages'));
app.use(passport.initialize());
app.use(passport.session());

// create the homepage route at '/'
app.get('/', (req, res) => {
    //console.log(req);
    console.log(req.sessionID);
    //res.send(`Hit home page. Received the unique id: ${uniqueId}\n`);
    var q = url.parse(req.url, true);
    var filename = "./src/pages" + (q.pathname == "/" ? "/index.html" : q.pathname);
    console.log("info", filename);
    const uniqueId = uuid();
    fs.readFile(filename, function (err, data) {
        if (err) {
            //res.writeHead(404, { 'Content-Type': 'text/html' });
            return res.end("404 Not Found");
        }
        //res.writeHead(200, { 'Content-Type': 'text/html' });
        res.write(data);
        return res.end();
    });
});

app.get('/logout', (req, res) => {
    if (req.isAuthenticated()) {
        req.logout();
        return res.redirect('/');
    }
    else
        return res.redirect('/');
});

app.post('/login', (req, res, next) => {
    console.log(req.body);
    passport.authenticate('local', (err, user, info) => {
        console.log(err, user, info);
        if (info) { return res.send({ success: false, message: info.message }); }
        if (err) { return next(err); }
        if (!user) { return res.send({ success: false, message: 'User not found.' }); }
        req.login(user, (err) => {
            if (err) { return next(err); }
            return res.send({ success: true, message: 'Success.' });
        });
    })(req, res, next);
});

app.post('/signup', (req, res) => {
    const data = req.body;
    dataDb.run(`insert into users(firstname, lastname, type, username, password) values(?, ?, ?, ?, ?)`,
        [data.firstname, data.lastname, data.isteacher == "true" ? 1 : 2, data.email, data.password],
        (err) => {
            if (err) {
                return res.send({ success: false, message: err });
            }
            else {
                return res.send({ success: true, message: 'success' });
            }
        });
});

app.post('/addclass', (req, res) => {
    if (req.isAuthenticated()) {
        const classCode = req.body.code;
        const command = `insert into class_assignment values(?, (select id from classes where code = ?), strftime('%Y-%m-%dT%H:%M:%f', 'now'));`;

        dataDb.run(command, [req.user.id, classCode], (err) => {
            if (err) {
                return res.send({ success: false, errcode: 2, message: err });
            }
            if (this.changes > 0) {
                return res.send({ success: true, errcode: 0, message: 'success' });
            }
            else {
                return res.send({ success: true, errcode: 1, message: 'not found' });
            }
        });
    }
    else {
        res.redirect('login.html');
    }
});

app.post('/removeclass', (req, res) => {
    if (req.isAuthenticated()) {
        const classId = req.body.classId;
        const command = `delete from class_assignment where class = ? and student = ?;`;

        dataDb.run(command, [classId, req.user.id], (err) => {
            if (err) {
                return res.send({ success: false, errcode: 2, message: err });
            }
            if (this.changes > 0) {
                return res.send({ success: true, errcode: 0, message: 'success' });
            }
            else {
                return res.send({ success: true, errcode: 1, message: 'not found' });
            }
        });
    }
    else {
        res.redirect('login.html');
    }
});

app.get('/profile-json', (req, res) => {
    const user = req.user;
    const data = req.body;
    console.log(user, req.isAuthenticated());
    return res.send(user);
});

app.get('/profile-json', (req, res) => {
    const user = req.user;
    const data = req.body;
    console.log(user, req.isAuthenticated());
    return res.send(user);
});

app.post('/profile-update', (req, res) => {
    const user = req.user;
    const data = req.body;
    dataDb.run(`update users set firstname = ?, lastname = ?, username = ?, password = ? where id = ?`,
        [data.firstname, data.lastname, data.email, data.password, user.id],
        (err) => {
            if (err) {
                return res.send('An error occured during update');
            }
            else {
                if (user.type == 1)
                    return res.redirect('/teacher-dashboard.html');
                else
                    return res.redirect('/student-dashboard.html');
            }
        });
});

app.post('/profile-delete', (req, res) => {
    const user = req.user;
    dataDb.run(`delete from users where id = ?`,
        [user.id],
        (err) => {
            if (err) {
                return res.send('An error occured during delete');
            }
            else {
                return res.redirect('/index.html');
            }
        });
});

app.post('/newclass', (req, res) => {
    if (req.isAuthenticated()) {
        const user = req.user;
        const reqBody = req.body;
        if (user.type == 1) {
            const command = 'insert into classes(teacher, grade, section, subject, code) values(?, ?, ?, ?, ?);';
            dataDb.run(command, [user.id, reqBody.grade, reqBody.section, reqBody.subject, reqBody.code], err => {
                if (err) {
                    return res.send({ success: false, message: err });
                }
                else {
                    return res.send({ success: true, message: 'success' });
                }
            });
        }
        else {
            return res.send({ success: false, message: 'invalid user' });
        }
    }
    else {
        return res.redirect('login.html');
    }
});

app.get('/dashboard', (req, res) => {
    console.log(`User authenticated? ${req.isAuthenticated()} ${req.session.user}`);
    if (req.isAuthenticated()) {
        if (req.user.type == 2)
            return res.redirect('/student-dashboard.html');
        else
            return res.redirect('/teacher-dashboard.html');
    } else {
        return res.redirect('/login.html');
    }
});

app.post('/checkemail', (req, res) => {
    const command = "select * from users where username = ?";
    dataDb.all(command, [req.body.email], (err, rows) => {
        res.send({ result: rows.length });
    });
});

app.post('/newpost', (req, res) => {
    const requestBody = req.body;
    const user = req.user;
    if (req.isAuthenticated()) {
        const command = "insert into posts(dateposted, expiry, class, message) values(?, ?, ?, ?);";
        dataDb.run(command, [requestBody.posted, requestBody.expiry, requestBody.classId == 0 ? null : requestBody.classId, requestBody.message], err => {
            if (err) {
                return res.send({ success: false, message: err });
            }
            else {
                return res.send({ success: true, message: 'success' });
            }
        });
    }
    else {
        return res.redirect('/login');
    }
});

app.get('/studentclassdata', (req, res) => {
    if (req.isAuthenticated()) {
        const user = req.user;
        const classId = req.query.classId;

        let responseObject = {};
        responseObject.student = user;

        if (user.type == 2) {
            dataDb.serialize(() => {
                dataDb
                    .get(
                        `select classes.id as classid, firstname || ' ' || lastname as teacher, grade, section, subject from classes join users on users.id = classes.teacher where classes.id = ?;`,
                        [classId],
                        (err, row) => {
                            responseObject.class = row;
                        }
                    )
                    .all(
                        `select fordate, case when time is null then 'Absent' else 'Present' end as attendance, time from attendances left join (select * from attendance_entries where student = ?) as attendance_entries on attendance_entries.attendance = attendances.id where class = ? order by fordate;`,
                        [user.id, classId],
                        (err, rows) => {
                            responseObject.attendances = rows;
                            return res.send(responseObject);
                        }
                    );
            });
        }
        else {
            return res.redirect("/login.html"); //This is temporary; Replace logic for teachers
        }
    }
    else {
        return res.redirect("/login.html");
    }
});

app.get('/posts', (req, res) => {
    if (req.isAuthenticated()) {
        const user = req.user;
        if (user) {
            const sCommand =
                `select
                posts.id as post_id,
                classes.grade as grade,
                classes.section as section,
                (select firstname || ' ' || lastname from users where id = classes.teacher) as teacher,
                posts.message as message,
                posts.dateposted as dateposted
                from posts
                left join classes on posts.class = classes.id
                left join class_assignment on class_assignment.class = posts.class
                left join users on users.id = class_assignment.student
                where users.id = ?
                and datetime(posts.expiry) > date('now', 'localtime');`;
            const tCommand =
                `select
                posts.id as post_id,
                classes.grade as grade,
                classes.section as section,
                (select firstname || ' ' || lastname from users where id = classes.teacher) as teacher,
                posts.message as message,
                posts.dateposted as dateposted
                from posts
                left join classes on posts.class = classes.id
                where classes.teacher = ?
                and datetime(posts.expiry) > date('now', 'localtime');`;
            dataDb.all(user.type == 1 ? tCommand : sCommand, [user.id], (err, rows) => {
                console.log(rows);
                if (err) {
                    return res.send({ succes: false, result: [], message: err });
                }
                return res.send({ succes: true, result: rows, message: 'success' });
            });
        }
        else {
            return res.send({ success: false, result: [], message: 'invalid user' });
        }
    }
    else {
        return res.send('not logged in');
    }
});

app.get('/attendances', (req, res) => {
    console.log(req.isAuthenticated(), req.user);
    if (req.isAuthenticated()) {
        const user = req.user;
        if (user) {
            const sCommand =
                `select
                classes.id as class_id,
                classes.grade as grade,
                classes.section as section,
                classes.subject as subject,
                attendances.fordate as attdate,
                attendances.expiry as expiry
                from classes 
                left join users on classes.teacher = users.id 
                left join (select * from attendances where date(fordate) = date('now', 'localtime')) as attendances on attendances.class = classes.id
                left join attendance_entries on attendances.id = attendance_entries.attendance
                where classes.teacher = ?;`;

            const tCommand =
                `select
                classes.id as class_id,
                classes.grade as grade,
                classes.section as section,
                classes.subject as subject,
                classes.code as code,
                attendances.fordate as attdate,
                attendances.expiry as expiry
                from classes 
                left join users on classes.teacher = users.id 
                left join (select * from attendances where date(fordate) = date('now', 'localtime')) as attendances on attendances.class = classes.id
                left join attendance_entries on attendances.id = attendance_entries.attendance
                where classes.teacher = ?;`;
            dataDb.all(user.type == 1 ? tCommand : sCommand, [user.id], (err, rows) => {
                console.log(rows);
                return res.send({ success: true, result: rows, message: 'success' });
            });
        }
        else {
            return res.send({ success: false, result: [], message: 'invalid user' });
        }
    }
    else {
        return res.redirect('/login.html');
    }
});

// tell the server what port to listen on
app.listen(process.env.PORT || 3000, () => {
    console.log('Listening...');
});