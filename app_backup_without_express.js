const http = require("http");
const url = require("url");
const mysql = require("mysql");
const bodyParser = require('body-parser');
const CONFIG = require("./modules/SQL/config");
const COURSES_CONFIG = require("./modules/SQL/CoursesConfig");
const GetPOSTData = require("./modules/GetPOSTData");
const registration = require("./modules/Registration");
const Authorization = require("./modules/Authorization");
const bcrypt = require('bcryptjs');
const SendQuery = require("./modules/SQL/SendQuery");
const path = require("path");
const GetFilesFromServer = require("./modules/GetFilesFromServer");

const express = require('express');
const app = express();

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
    'wasm': 'application/wasm'    
}

const PORT = 3500;
class User {
     email; name; surname; patronymic; password; confirmPassword; accountType;
}





// Создаем сервер с использованием body-parser для обработки данных формы
const server = http.createServer(async function (req, res) {
    let url = req.url;
    console.log(url)
    let user = new User();
    let data;
    switch (url) {
        
        case "/CursesManage/GetSubjects": {
            const subjectsList = await GetPOSTData.GetData(req);
            const RESULT = await SendQuery.GetAllSubjects();
            res.writeHead(RESULT.code, { 'Content-Type': 'text/plain; charset=UTF-8' });
            res.end(JSON.stringify(RESULT));
            break;
        }

        case "/CursesManage/GetSubjectById": {
            const SUBJECT_DATA = await GetPOSTData.GetData(req);
            const RESULT = await SendQuery.GetAllSubjects();
            res.writeHead(RESULT.code, { 'Content-Type': 'text/plain; charset=UTF-8' });
            res.end(JSON.stringify(RESULT));
            break;
        }

        case "/CursesManage/EditSubject": {
            const SUBJECT_DATA = await GetPOSTData.GetData(req);
            const VALUES = [ SUBJECT_DATA.name, SUBJECT_DATA.description, SUBJECT_DATA.id];
            const RESULT = await SendQuery.AddNewSubject(VALUES);

            res.writeHead(RESULT.code, { 'Content-Type': 'text/plain; charset=UTF-8' });
            res.end(JSON.stringify(RESULT));
        }

        case "/CursesManage/AddSubject": {
            let subjectData = await GetPOSTData.GetData(req);
            const values = [subjectData.id, subjectData.name, subjectData.description];
            const result = await SendQuery.AddNewSubject(values);
           
            res.writeHead(result.code, { 'Content-Type': 'text/plain; charset=UTF-8' });
            res.end(JSON.stringify(result));
            break;
        }
            
        case "/checkemail": {
            user = await GetPOSTData.GetData(req);
            const values = [user.email];
            const result = await SendQuery.CheckEmailQuery('users', values);
            if (result === 0) {
                res.writeHead(200, { 'Content-Type': 'text/plain; charset=UTF-8' });
                res.end("false");
            } else {
                res.writeHead(200, { 'Content-Type': 'text/plain; charset=UTF-8' });
                res.end("true");
            }
            res.end();
            break;
        }
            
        case "/saveConfirmCode": {
            data = await GetPOSTData.GetData(req);
            const ConfirmValues = [data.code, data.email];
            SendQuery.SaveConfirmCode(ConfirmValues);
            res.writeHead(200, { 'Content-Type': 'text/plain; charset=UTF-8' });
            res.end("true");
            break;
        }
            

        case "/checkConfirmCodes": {
            data = await GetPOSTData.GetData(req);
            const ConfirmValuesFromPOST = [data.email, data.code];
            const queryResult = await SendQuery.CheckConfirmCode(ConfirmValuesFromPOST);

            if(queryResult) {
                res.writeHead(200, { 'Content-Type': 'text/plain; charset=UTF-8' });
                res.end(JSON.stringify({ code: "200", message: "Коды совпадают" }));
            } else {
                res.writeHead(400, { 'Content-Type': 'text/plain; charset=UTF-8' });
                res.end(JSON.stringify({ code: "400", message: "Коды не совпадают" }));
            }
            
            break;
        }
            

        case "/registration": {
            try {
                user = await GetPOSTData.GetData(req);
                const registrationResult = await registration.Register(user);

                if (registrationResult.code !== 200) {
                    // Если код не 200, то возвращаем ошибку с соответствующим статусом
                    res.writeHead(400, { 'Content-Type': 'application/json; charset=UTF-8' });
                    res.end(JSON.stringify({ code: registrationResult.code, message: registrationResult.message }));
                } else {
                    // Если регистрация успешна
                    res.writeHead(200, { 'Content-Type': 'application/json; charset=UTF-8' });
                    res.end(JSON.stringify({ code: registrationResult.code, userData: registrationResult.user }));
                }
            } catch (err) {
                console.error('Ошибка при обработке данных:', err);
                res.writeHead(500, { 'Content-Type': 'application/json; charset=UTF-8' });
                res.end(JSON.stringify({ code: 500, message: 'Ошибка сервера' }));
            }
            break;

        }

            
        case "/login": {
            user = await GetPOSTData.GetData(req);
            const authorizeResult = await Authorization.Authorize(user);

            if (authorizeResult.code != 200) {
                res.writeHead(400, { 'Content-Type': 'application/json; charset=UTF-8' });
                res.end(JSON.stringify({ code: authorizeResult.code, message: authorizeResult.message }));
            } else {
                 // Если регистрация успешна
                 res.writeHead(200, { 'Content-Type': 'application/json; charset=UTF-8' });
                 res.end(JSON.stringify({ code: authorizeResult.code, userData: authorizeResult.user }));
            }
            break;
        }
            

        default: {
            const extname = String(path.extname(url)).toLocaleLowerCase();
            if (extname in mimeTypes) {
                GetFilesFromServer.staticFile(res, url, extname);
            } else {
                res.statusCode = 404;
                res.end();
            }
        }
            
    }
}).listen(PORT);
