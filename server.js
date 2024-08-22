require("./settings");
const http = require("http");
const app = require("./index");
const PORTHOST = port;

http.createServer(app).listen(PORTHOST, () => {
console.log(`
Ｚｅｒｏ-Ａｐｉ
@ＢＡＷＯＲＢＡＷＯＲＩＤ
Server running on http://localhost:` + PORTHOST)
console.log(`Hello ${creator}`)
})
