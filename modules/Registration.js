const bcrypt = require('bcryptjs');
const CONFIG = require("./SQL/config");
const mysql = require("mysql");
const SendQuery = require("./SQL/SendQuery");
const RegError = require("./Classes/Error");
const { v4: uuidv4 } = require('uuid');



async function IsEmailValid(email) {
    const reg = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,6}$/ ;
    const result = await SendQuery.CheckEmailQuery('users', email);
    if (result != 0) {
        throw new RegError(400, `Email ${email} уже существует!`);
    } 

    if(!reg.test(email)) {
        throw new RegError(400, `Неправильный формат Email. ${email}`);
    }
    return true;
}

function IsNameValid(name) {
    const reg = /^[A-ZА-Я][a-zа-яёЁ'-]{1,32}$/;
    if(!reg.test(name)) {
        throw new RegError(400, `Имя ${name} недопустимо.`);
    };

    return true;
}

function IsPassValid(pass, repass) {
    if (pass !== repass) {
        throw new RegError(400, "Пароли не совпадают.");
    }

    const reg = /^[A-Za-z0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]{6,16}$/;
    if(!reg.test(pass)) {
        throw new RegError(400, "Длина пароля от 6 до 16. Разрешены только латинские буквы, цифры и специальные символы.");
    };

    return true;
}

function IsAccountTypeValid(accountType) {
    const accountTypeDictionary = {
        0: "student",
        1: "teacher",
        2: "admin"
    }

    if (!accountTypeDictionary[accountType]) {
        throw new RegError(400, "Некорректное значение типа аккаунта.");
    }

    return true;
}

async function HashPass(pass) {
    const hashPassword = await bcrypt.hash(pass, 10);

    return hashPassword;
}


async function UserCheck(user) {
    try {
        await IsEmailValid(user.email);
        IsNameValid(user.name);
        IsNameValid(user.surname);
        IsPassValid(user.password, user.confirmPassword);
        IsAccountTypeValid(user.accountType);
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
    const error = await UserCheck(user);
    const accountTypeDictionary = {
        0: "student",
        1: "teacher",
        2: "admin"
    }
    
    if(error instanceof RegError) {
        return error;
    }

    user.password = await HashPass(user.password);
    const UUID = uuidv4();
    const values = [user.name, user.surname, user.email, user.password, accountTypeDictionary[user.accountType], UUID];
    try {
        SendQuery.RegistrationQuery(values);
        return {code: 200, user: {
            name : user.name,
            surname : user.surname,
            email : user.email,
            uuid : UUID,
            accountType : accountTypeDictionary[user.accountType]
        }};
    } catch (err) {
        return {code: 400, message: "некорректные значения"};
    }         
    
}




module.exports = {
    Register
}