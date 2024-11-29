const bcrypt = require('bcryptjs');
const CONFIG = require("./config");
const mysql = require("mysql");
const RegError = require("./Classes/Error");


function IsEmailValid(email) {
    const reg = /^[A-Z0-9._%+-]+@[A-Z0-9-]+.+.[A-Z]{2,4}$/i;

    if(!reg.test(email)) {
        throw new RegError(400, "Неправильный формат Email");
    }

    return true;
}

function IsNameValid(name) {
    const reg = /^[A-ZА-Я][a-zа-яёЁ'-]{1,32}$/;
    if(!reg.test(name)) {
        throw new RegError(400, `Имя "${name}" недопустимо`);
    };

    return true;
}

function IsPassValid(pass, repass) {
    if (pass !== repass) {
        throw new RegError(400, "Пароли не совпадают");
    }

    const reg = /^[A-Za-z0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]{6,16}$/;
    if(!reg.test(pass)) {
        throw new RegError(400, "Длина пароля от 6 до 16. Разрешены только латинские буквы, цифры и специальные символы.");
    };

    return true;
}

async function HashPass(pass) {
    const hashPassword = await bcrypt.hash(pass, 10);

    return hashPassword;
}


function UserCheck(user) {
    // let IsEmailValidValue = IsEmailValid(user.email);
    try {
        IsEmailValid(user.email);
        IsNameValid(user.name);
        IsNameValid(user.surname);
        IsNameValid(user.patronymic);
        IsPassValid(user.password, user.confirmPassword);
        return true;
    } 
    catch (err) {
        if (err instanceof RegError) {
            return err;
        }

        throw err;
    }

}

async function Register (user) {
    const error = UserCheck(user);
    if(error instanceof RegError) {
        return error;
    }

    user.password = await HashPass(user.password);
    const query =`INSERT INTO users (name, email, password, accountType, surname, patronymic) VALUES ('${user.name}', '${user.email}', '${user.password}', '${user.accountType}', '${user.surname}', '${user.patronymic}')`;
                
    const connection = mysql.createConnection(CONFIG);
    return new Promise((resolve, reject) => {
        connection.connect();
        connection.query(query, (err, res) => {
            if (err) {
                console.error("Ошибка в запросе: ", err);
                reject({ code: 500, message: "Ошибка сервера" }); // Возвращаем ошибку
            }
    
           resolve({ code: 200, message: "Пользователь успешно зарегистрирован!" }); // Возвращаем успешный ответ
        });
        connection.end();
    })
    

}




module.exports = {
    Register
}