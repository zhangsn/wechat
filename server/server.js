// server.js
// load the server resource and route GET method
const server = require('server');
const { get, post } = server.router;
const { render, json,header } = server.reply;

const htmlToText = require('html-to-text');

// get server port from environment or default to 3000
const port = process.env.PORT || 5000;
const cors = [
    ctx => header("Access-Control-Allow-Origin", "*"),
    ctx => header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept"),
    ctx => ctx.method.toLowerCase() === 'options' ? 200 : false
];
server({ port:port,security: { csrf: false } },cors, [
  get("/subscribe/render", async ctx => {
    var result = await query("SELECT name,biz from Subscribe");
    return render("index.pug",{subscribes:result});
  }),
  get("/subscribe/get", async ctx => {
    var result = await query("SELECT img,name,biz from Subscribe");
    return json({subscribes:result});
  }),
  get("/article/list", async ctx => {
    var result = await query('SELECT sn,title,url,content,likes,comments,time from Article where biz=? order by time desc',[ctx.query.biz]);
    // result = result.map(item=>{
    //   item.content = htmlToText.fromString(item.content, {
    //     ignoreHref: true,
    //     ignoreImage:true
    //   });
    //   return item;
    // })
    return json({articles:result});
  }),
  post("/article/add", async ctx => {
    try{
        await query('insert into Article SET ?',{...ctx.data});
        return json({errNo:0});
    }catch(error){
        return json({errNo:error});
    }
  })
]).then(() => console.log(`Server running at http://localhost:${port}`));

async function query(sql,args){
    var mysql = require("promise-mysql");
    var connection = await mysql.createConnection({
      host: "localhost",
      user: "root",
      password: "",
      database: "wechat"
    });
    var result = await connection.query(sql,args);
    connection.end();
    return result
}