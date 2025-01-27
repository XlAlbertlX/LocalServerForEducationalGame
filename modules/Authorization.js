const bcrypt = require('bcryptjs');
const CONFIG = require("./SQL/config");
const mysql = require("mysql");
const SendQuery = require("./SQL/SendQuery");
const RegError = require("./Classes/Error");

async function IsEmailValid(email) {
    const reg = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,6}$/ ;

    const result = await SendQuery.CheckEmailQuery('users', email);
    if (result == 0) {
        throw new RegError(400, `Аккаунт с указанным Email не существует!`);
    } 

    if(!reg.test(email)) {
        throw new RegError(400, `Неправильный формат Email.`);
    }
    return true;
}

const userFromDB = (email) => {
    return new Promise((resolve, reject) => {
        const connection = mysql.createConnection(CONFIG);
        const query = 'SELECT * FROM users WHERE email = ?';

        connection.connect();
        connection.query(query, [email], (err, res) => {
            if (err) return reject(err);

            resolve(res[0]); // Возвращаем только первую строку (если есть)
        });
        connection.end();
    });
};

async function Authorize(user) {
    try {
        const accountTypeDictionary = {
            0: "student",
            1: "teacher",
            2: "admin"
        };

        const email = user.email;
        await IsEmailValid(email);
        const passFromDB = await SendQuery.GetPassFromDB(email);

        const isMatch = await bcrypt.compare(user.password, passFromDB);
        if (!isMatch) {
            throw new RegError(400, `Введен неверный пароль.`);
        }

        const dbUser = await userFromDB(email);


        return {
            code: 200,
            user: {
                name: dbUser.name,
                surname: dbUser.surname,
                email: dbUser.email,
                uuid: dbUser.UUID,
                accountType: dbUser.accountType,
            }
        };
    } catch (err) {
        if (err instanceof RegError) {
            return err;
        }

        throw err;
    }
}


module.exports = {
    Authorize
}