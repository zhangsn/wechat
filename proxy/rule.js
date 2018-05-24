const HOME_SCRIPT = `
(function(){
    var hrefs = [];
    if(location.href.indexOf('&initlink') !== -1){
        document.querySelectorAll(".weui_media_box").forEach(function(item){
            hrefs.push(item.getAttribute('hrefs'));
        });
        hrefs.reverse();
        sessionStorage.setItem("hrefs",JSON.stringify(hrefs));
        location.replace(location.href.replace('&initlink',''));
    }else{
        hrefs = JSON.parse(sessionStorage.getItem("hrefs"));
        if(hrefs.length>0){
            var href = hrefs.pop();
            sessionStorage.setItem("hrefs",JSON.stringify(hrefs));
            location.href = href+"?&_dc_="+Math.random();
        }else{
            history.back();
        }
    }
})();
`;

const DETAIL_SCRIPT = `
(function(){
    alert(document.body.textContent);
})();
`;
const { exec } = require('child_process');
const BODY_CACHE = new Map();
var querystring = require('querystring');
var http = require('http');
module.exports = {
    summary: 'a rule to hack response',
    *beforeSendRequest(requestDetail) {
        var newOption = Object.assign({}, requestDetail.requestOptions);
        delete newOption.headers['If-Modified-Since'];
        return {
            requestOptions: newOption
        };
    },
    *beforeSendResponse(requestDetail, responseDetail) {
    //文章详情
    if(requestDetail.url.indexOf('https://mp.weixin.qq.com/s?__biz=')=== 0){
        const newResponse = responseDetail.response;
        const body = String(newResponse.body);
        BODY_CACHE.set(requestDetail.url,{
            content:body,
            title:/var msg_title = "([^"]+)"/.exec(body)[1].replace(/&nbsp;/g,''),
            sn:/sn=(\w+)/.exec(requestDetail.url)[1],
            biz:/__biz=([^&]+)/.exec(requestDetail.url)[1],
            time:new Date(/var publish_time = "([^"]+)"/.exec(body)[1]).getTime()
        });
        console.log("############Set Cache");
        console.log(requestDetail.url);
    }
    //点赞数
    else if(requestDetail.url.indexOf('https://mp.weixin.qq.com/mp/getappmsgext?f=json') === 0){
        console.log("############Cache key");
        console.log(requestDetail.requestOptions.headers.Referer);
        var cache = BODY_CACHE.get(requestDetail.requestOptions.headers.Referer);
        BODY_CACHE.delete(requestDetail.requestOptions.headers.Referer);
        cache.likes = JSON.parse(responseDetail.response.body).appmsgstat.like_num;
        cache.comments = JSON.parse(responseDetail.response.body).comment_count;
        cache.url=requestDetail.requestOptions.headers.Referer;
        console.log(cache);
        console.log("############Saving Data");
        saveData(cache);
        exec('adb shell input keyevent 4', (err, stdout, stderr) => {
            if (err) {
                console.log("ERROR");
            }
        });
        return null;

    }else if(requestDetail.url.indexOf('https://mp.weixin.qq.com/mp/profile_ext?action=home') === 0){
        const newResponse = responseDetail.response;
        const INJECT_POINT = 'if (!!onBridgeReady) {';
        injectBefore(newResponse,INJECT_POINT,HOME_SCRIPT);
        return {
            response:newResponse
        }
      }
    }
};
function injectBefore(response,injectPoint,script){
    response.body = String(response.body).replace(injectPoint,script+injectPoint);
}
function saveData(data){
    query('replace into Article SET ?',{...data});
}
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
/*
function postData(data){
    // Build the post string from an object
    var post_data = querystring.stringify(data);
    
    // An object of options to indicate where to post to
    var post_options = {
        host: '172.20.132.192',
        port: '5000',
        path: '/article/add',
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Content-Length': Buffer.byteLength(post_data)
        }
    };
    // Set up the request
    var post_req = http.request(post_options, function(res) {
        res.setEncoding('utf8');
        res.on('data', function (chunk) {
            console.log('Response: ' + chunk);
        });
    });
    post_req.on('error', (err) => {
        console.log("############Post Data Error"+err);
    });
    // post the data
    post_req.write(post_data);
    post_req.end();
}
*/
/* getappmsgext
{  
   "advertisement_num":0,
   "advertisement_info":[  

   ],
   "appmsgstat":{  
      "show":true,
      "is_login":true,
      "liked":false,
      "read_num":189,
      "like_num":1,
      "ret":0,
      "real_read_num":0
   },
   "comment_enabled":1,
   "reward_head_imgs":[  

   ],
   "only_fans_can_comment":false,
   "comment_count":0,
   "is_fans":1,
   "nick_name":"ZSN💯",
   "logo_url":"http:\/\/wx.qlogo.cn\/mmopen\/ajNVdqHZLLAmRITQ3icmgiaFXEPhjibnC7hOsz4g4GZUIjMH2IhcF16MClFypNxamKWibibBc67ErleMibtt2DyXcIZQ\/132",
   "friend_comment_enabled":1,
   "base_resp":{  
      "wxtoken":777
   }
}
*/