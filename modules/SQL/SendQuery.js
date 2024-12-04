const CONFIG = require("./config");
const mysql = require("mysql");


function RegistrationQuery(values) {
    const connection = mysql.createConnection(CONFIG);
    const query = 'INSERT INTO users (name, surname, email, password, accountType) VALUES ($1, $2, $3, $4, $5)';
    return new Promise((resolve, reject) => {
        connection.connect();
        connection.query(query, values, (err, res) => {
            if (err) {
                console.error("Ошибка в запросе: ", err);
                reject({ code: 500, message: "Ошибка сервера" }); // Возвращаем ошибку
            }
    
           resolve({ code: 200, message: "Запрос выполнен успешно!" }); // Возвращаем успешный ответ
        });
        connection.end();
    })
}

function CheckEmailQuery(values) {
    const connection = mysql.createConnection(CONFIG);
    query = 'SELECT EXISTS(SELECT 1 FROM users WHERE email = ?)';
    return new Promise((resolve, reject) => {
        connection.connect();
        connection.query(query, values, (err, res) => {
            if (err) {
                console.error("Ошибка в запросе: ", err);
                reject({code: 500, message: "Ошибка сервера."});
            }
            const exists = Object.values(res[0])[0]; // Извлекаем значение (0 или 1)
            console.log("Результат EXISTS:", exists); 
            resolve(exists);
        });
    });
}

module.exports = {
    RegistrationQuery,
    CheckEmailQuery
}