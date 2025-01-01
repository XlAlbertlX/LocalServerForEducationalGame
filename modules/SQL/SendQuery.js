const CONFIG = require("./config");
const mysql = require("mysql");


function RegistrationQuery(values) {
    const connection = mysql.createConnection(CONFIG);
    const query = 'INSERT INTO users (name, surname, email, password, accountType) VALUES (?,?,?,?,?)';
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

function CheckEmailQuery(table_name, values) {
    const connection = mysql.createConnection(CONFIG);
    const query = `SELECT EXISTS(SELECT 1 FROM ${table_name} WHERE email = ?)`;
    return new Promise((resolve, reject) => {
        connection.connect();
        connection.query(query, values, (err, res) => {
            if (err) {
                console.error("Ошибка в запросе: ", err);
                reject({code: 500, message: "Ошибка сервера."});
            }
            const exists = Object.values(res[0])[0]; // Извлекаем значение (0 или 1)

            resolve(exists);
        });
        connection.end();
    });
}

async function SaveConfirmCode(values) {
    const connection = mysql.createConnection(CONFIG);
    let query;
    const result = await CheckEmailQuery('confirm_codes', values[1]);
    if (result === 0) {
        query = 'INSERT INTO confirm_codes (code, email) VALUES (?, ?)';
    } else {
        query = 'UPDATE confirm_codes SET code = ? WHERE email = ?';
    }
    return new Promise((resolve, reject) => {
        connection.connect();
        connection.query(query, values, (err, res) => {
            if (err) reject(err);

            resolve(0);
        });
        connection.end();
    });
}

async function CheckConfirmCode(values) {
    const connection = mysql.createConnection(CONFIG);
    const query = 'SELECT code FROM confirm_codes WHERE email = ?';

    const codeFromDB = await new Promise((resolve, reject) => {
        connection.connect();
        connection.query(query, values, (err, res) => {
            if (err) reject(err);

            resolve(res[0]?.code);
        });
        connection.end();
    });
    
    console.log(`codeFromDB = ${codeFromDB}`);
    console.log(`code = ${values[1]}`);
    if(codeFromDB == values[1]) {
        return true;
    }

    return false;
}

module.exports = {
    RegistrationQuery,
    CheckEmailQuery,
    SaveConfirmCode,
    CheckConfirmCode
}