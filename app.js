const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const CONFIG = require("./modules/SQL/config");
const COURSES_CONFIG = require("./modules/SQL/CoursesConfig");
const GetPOSTData = require("./modules/GetPOSTData");
const registration = require("./modules/Registration");
const Authorization = require("./modules/Authorization");
const bcrypt = require('bcryptjs');
const SendQuery = require("./modules/SQL/SendQuery");
const GetFilesFromServer = require("./modules/GetFilesFromServer");

const app = express();
const PORT = 3500;

const mimeTypes = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'text/javascript',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
    '.json': 'application/json',
    '.mp3': 'audio/mpeg',
    '.mp4': 'video/mp4',
    '.txt': 'text/plain',
    '.pdf': 'application/pdf',
    '.doc': 'application/msword',
    '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    '.xls': 'application/vnd.ms-excel',
    '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'woff': 'application/font-woff',
    'woff2': 'application/font-woff2',
    'ttf': 'application/font-ttf',
    'eot': 'application/vnd.ms-fontobject',
    'otf': 'application/font-otf',
    'swf': 'application/x-shockwave-flash',
    'wasm': 'application/wasm',
};

// Middleware
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));

// Классы
class User {
    email; name; surname; patronymic; password; confirmPassword; accountType;
}

app.get('/CoursesManage/GetAllModules', async(req, res) => {
    const VALUE = [req.query.SubjectId];
    const RESULT = await SendQuery.GetAllModulesById(VALUE);
    res.status(RESULT.code).json(RESULT);
})

app.post('/CoursesManage/AddModule', async (req, res) => {
    const VALUES = [req.body.subjectId, req.body.moduleName];
    const RESULT = await SendQuery.AddModule(VALUES);
    res.status(RESULT.code).json(RESULT);
});

app.get('/CoursesManage/GetSubjects', async (req, res) => {

    const RESULT = await SendQuery.GetAllSubjects();
    console.log(`${JSON.stringify(RESULT)}`)
    res.status(RESULT.code).json(RESULT);
});

app.get('/CoursesManage/GetSubjectById', async (req, res) => {
    const VALUES = [req.query.id];
    const RESULT = await SendQuery.GetSubjectById(VALUES);
    res.status(RESULT.code).json(RESULT.subject);
});

app.put('/CoursesManage/EditSubject', async (req, res) => {
    const VALUES = [req.body.name, req.body.description, req.body.id];
    const RESULT = await SendQuery.EditSubject(VALUES);
    res.status(RESULT.code).json(RESULT);
});

app.post('/CoursesManage/AddSubject', async (req, res) => {
    const { id, name, description } = req.body;
    const values = [id, name, description];
    const result = await SendQuery.AddNewSubject(values);
    res.status(result.code).json(result);
});

app.post('/checkemail', async (req, res) => {
    const user = req.body;
    const values = [user.email];
    const result = await SendQuery.CheckEmailQuery('users', values);
    res.status(200).send(result === 0 ? "false" : "true");
});

app.post('/saveConfirmCode', async (req, res) => {
    const { code, email } = req.body;
    await SendQuery.SaveConfirmCode([code, email]);
    res.status(200).send("true");
});

app.post('/checkConfirmCodes', async (req, res) => {
    const { email, code } = req.body;
    const queryResult = await SendQuery.CheckConfirmCode([email, code]);

    if (queryResult) {
        res.status(200).json({ code: "200", message: "Коды совпадают" });
    } else {
        res.status(400).json({ code: "400", message: "Коды не совпадают" });
    }
});

app.post('/registration', async (req, res) => {
    try {
        const user = req.body;
        const registrationResult = await registration.Register(user);

        if (registrationResult.code !== 200) {
            res.status(400).json({ code: registrationResult.code, message: registrationResult.message });
        } else {
            res.status(200).json({ code: registrationResult.code, userData: registrationResult.user });
        }
    } catch (err) {
        console.error('Ошибка при обработке данных:', err);
        res.status(500).json({ code: 500, message: 'Ошибка сервера' });
    }
});

app.post('/login', async (req, res) => {
    const user = req.body;
    const authorizeResult = await Authorization.Authorize(user);

    if (authorizeResult.code !== 200) {
        res.status(400).json({ code: authorizeResult.code, message: authorizeResult.message });
    } else {
        res.status(200).json({ code: authorizeResult.code, userData: authorizeResult.user });
    }
});

// Обработка статических файлов
app.use((req, res, next) => {
    const extname = String(path.extname(req.url)).toLocaleLowerCase();
    if (extname in mimeTypes) {
        GetFilesFromServer.staticFile(res, req.url, extname);
    } else {
        res.status(404).send("Файл не найден");
    }
});

// Запуск сервера
app.listen(PORT, () => {
    console.log(`Сервер запущен на http://localhost:${PORT}`);
});
