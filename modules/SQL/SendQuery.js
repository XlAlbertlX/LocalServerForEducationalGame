const CONFIG = require("./config");
const COURSES_CONFIG = require("./CoursesConfig");
const mysql = require("mysql");
const RegError = require("../Classes/Error");


function RegistrationQuery(values) {
    const connection = mysql.createConnection(CONFIG);
    const query = 'INSERT INTO users (name, surname, email, password, accountType, UUID) VALUES (?,?,?,?,?,?)';
    return new Promise((resolve, reject) => {
        connection.connect();
        connection.query(query, values, (err, res) => {
            if (err) {
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
                
                throw new RegError(400, `некорректные значения`);
                // reject({code: 500, message: "Ошибка сервера."});
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
    
    if(codeFromDB == values[1]) {
        return true;
    }

    return false;
}

async function GetPassFromDB(email) {
    const connection = mysql.createConnection(CONFIG);
    const query = 'SELECT password FROM users WHERE email = ?';

    const values = [email];
    const passFromDB = await new Promise((resolve, reject) => {
        connection.connect();
        connection.query(query, values, (err, res) => {
            if (err) reject(err);

            resolve(res[0]?.password);
        });
        connection.end();
    });

    return passFromDB;
}
//создает в базе данных новый предмет
async function AddNewSubject(subjectData) {
    try {
        const connection = mysql.createConnection(COURSES_CONFIG);
        connection.connect();
        // Проверка на существование предмета
        const checkQuery = "SELECT EXISTS (SELECT 1 FROM `subjects` WHERE id = ?) AS `exists`";
        const isThereSubject = await new Promise((resolve, reject) => {
            connection.query(checkQuery, subjectData, (err, res) => {
                if (err) return reject(err);
                resolve(res[0].exists); // Извлекаем результат проверки
            });
        });
       
        if (isThereSubject) {
            throw new RegError(400, `Данный предмет уже есть в базе!`);
        }

        // Добавление нового предмета
        const insertQuery = "INSERT INTO `subjects` (id, name, description) VALUES (?, ?, ?)";
        await new Promise((resolve, reject) => {
            connection.query(insertQuery, subjectData, (err, res) => {
                if (err) return reject(err);
                resolve();
            });
        });
        connection.end();

        // Возврат успешного ответа
        return {
            code: 200,
            message: "Предмет успешно добавлен!",
        };
    } catch (err) {
        if (err instanceof RegError) {
            return err;
        }
            

        throw err; // Пробрасываем ошибку дальше
    }
}

//обновляем данные о предмете в БД
async function EditSubject(subjectData) {
    const CONNECTION = mysql.createConnection(COURSES_CONFIG);
    CONNECTION.connect();

    return await new Promise((resolve, reject) => {
        const QUERY = "UPDATE `subjects` SET name = ?, description = ? WHERE id = ?";

        CONNECTION.query(QUERY, subjectData, (err, res) => {
            if (err) return reject(err);
            const RESPONSE = {
                code: 200,
                subjects: res
            }
            resolve(RESPONSE);
        });
        CONNECTION.end();
    });
}

async function GetAllSubjects() {
    const CONNECTION = mysql.createConnection(COURSES_CONFIG);
    const QUERY = "SELECT * FROM `subjects`";

    return await new Promise((resolve, reject) => {
        CONNECTION.connect()
        CONNECTION.query(QUERY, (err, res) => {
            if (err) return reject(err);

            const RESPONSE = {
                code: 200,
                subjects: res
            }
            resolve(RESPONSE);
            CONNECTION.end();
        });
    });
}

async function GetSubjectById(id) {
    const CONNECTION = mysql.createConnection(COURSES_CONFIG);
    const QUERY = "SELECT * FROM `subjects` WHERE id = ?";

    return await new Promise((resolve, reject) => {
        CONNECTION.connect()
        CONNECTION.query(QUERY, id, (err, res) => {
            if (err) return reject(err);
            
            let RESPONSE;
            if (res.length === 0) {
                RESPONSE = {
                    code: 404,
                    subject: null,
                };
            } else {
                RESPONSE = {
                    code: 200,
                    subject: res[0], // Возвращаем первый найденный объект
                };
            }

            CONNECTION.end();
            resolve(RESPONSE);
        });
    });
}

//Добавление нового модуля
async function AddModule(VALUES) {
    try {
        const connection = mysql.createConnection(COURSES_CONFIG);
        connection.connect();

        // Проверка на существование модуля
        const checkQuery = "SELECT EXISTS (SELECT 1 FROM `modules` WHERE name = ?) AS `exists`";
        const isThereModule = await new Promise((resolve, reject) => {
            connection.query(checkQuery, [VALUES[1]], (err, res) => {
                if (err) return reject(err);
                resolve(res[0].exists); // Извлекаем результат проверки
            });
        });
       
        console.log(`isThereModule = ${isThereModule}`);
        if (isThereModule) {
            throw new RegError(400, `Данный модуль уже есть в базе!`);
        }

        // Добавление нового модуля
        const insertQuery = "INSERT INTO `modules` (subject_id, name) VALUES (?, ?)";
        return await new Promise((resolve, reject) => {
            connection.query(insertQuery, VALUES, (err, res) => {
                if (err) return reject(err);

                const RESPONSE = {
                    code: 200,
                    message: "Модуль успешно добавлен!" // Возвращаем первый найденный объект
                };
                resolve(RESPONSE);
            });
            connection.end();
        });
        
    } catch (err) {
        if (err instanceof RegError) {
            return err;
        }
            

        throw err; // Пробрасываем ошибку дальше
    } 
}

async function GetAllModulesById(value) {
    return await new Promise((resolve, reject) => {
        const CONNECTION = mysql.createConnection(COURSES_CONFIG);
        CONNECTION.connect();
        const QUERY = 'SELECT module_index, name FROM `modules` WHERE subject_id = ?';
        CONNECTION.query(QUERY, value, (err, res) => {
            if (err) reject(err);
            const RESPONSE = {
                code: 200,
                modules: res.sort((a, b) => a.module_index - b.module_index)
            }
            resolve(RESPONSE);
        });
    });
}




module.exports = {
    RegistrationQuery,
    CheckEmailQuery,
    SaveConfirmCode,
    CheckConfirmCode,
    GetPassFromDB,
    AddNewSubject,
    EditSubject,
    GetAllSubjects,
    GetSubjectById,
    AddModule,
    GetAllModulesById
}