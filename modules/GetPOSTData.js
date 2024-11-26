module.exports.GetData = (req) => {
    return new Promise((resolve, reject) => {
        let body = '';

        req.on('data', chunk => {
            body += chunk;
        });

        req.on('end', () => {
            const parsedData = new URLSearchParams(body);
            const user = Object.fromEntries(parsedData.entries());
            resolve(user);
        });

        req.on('error', (err) => {
            reject(err);
        });
    });
}