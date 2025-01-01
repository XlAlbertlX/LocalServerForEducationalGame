const http = require("http");
const url = require("url");
const mysql = require("mysql");
const bodyParser = require('body-parser');
const CONFIG = require("./modules/SQL/config");
const GetPOSTData = require("./modules/GetPOSTData");
const registration = require("./modules/Registration");
const bcrypt = require('bcryptjs');
const SendQuery = require("./modules/SQL/SendQuery");

const PORT = 3500;
class User {
     email; name; surname; patronymic; password; confirmPassword; accountType;
} 



// Создаем сервер с использованием body-parser для обработки данных формы
const server = http.createServer(async function (req, res) {
    let url = req.url;
    console.log(url);
    let user = new User();
    let data;
    switch (url) {
        case "/checkemail":
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

        case "/saveConfirmCode":
            data = await GetPOSTData.GetData(req);
            const ConfirmValues = [data.code, data.email];
            SendQuery.SaveConfirmCode(ConfirmValues);
            res.writeHead(200, { 'Content-Type': 'text/plain; charset=UTF-8' });
            res.end("true");
            break;

        case "/checkConfirmCodes":
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

        case "/registration":

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
                    res.end(JSON.stringify({ code: registrationResult.code, message: "Пользователь успешно зарегистрирован!" }));
                }
            } catch (err) {
                console.error('Ошибка при обработке данных:', err);
                res.writeHead(500, { 'Content-Type': 'application/json; charset=UTF-8' });
                res.end(JSON.stringify({ code: 500, message: 'Ошибка сервера' }));
            }
            break;
        
        default:
            res.writeHead(404, { 'Content-Type': 'text/html; charset=UTF-8' });
            res.end('<h1>404<h1>');
    }
}).listen(PORT);
