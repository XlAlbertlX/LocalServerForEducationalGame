const http = require("http");
const url = require("url");
const mysql = require("mysql");
const bodyParser = require('body-parser');
const CONFIG = require("./modules/config");
const GetPOSTData = require("./modules/GetPOSTData");
const registration = require("./modules/Registration");
const bcrypt = require('bcryptjs');

const PORT = 3500;
class User {
     email; name; surname; patronymic; password; confirmPassword; accountType;
} 



// Создаем сервер с использованием body-parser для обработки данных формы
const server = http.createServer(async function (req, res) {
    let url = req.url;
    console.log(url);
    let user = new User();
    switch (url) {
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
