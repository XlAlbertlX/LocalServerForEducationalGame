class RegError extends Error {
    constructor(code, message) {
        super(message); // Передаем текст ошибки в базовый класс Error
        this.name = this.constructor.name; // Устанавливаем имя ошибки (например, AppError)
        this.code = code; // Код ошибки
        Error.captureStackTrace(this, this.constructor); // Захватываем стек для отладки
    }

    toJSON() {
        return {
            code: this.code,
            message: this.message,
            // stack: this.stack,
        };
    }
}

module.exports = RegError;
