const AnyProxy = require("anyproxy");
const PROXY_PORT = 8001;
const WEB_PORT = 8002;
const options = {
  port: PROXY_PORT,
  rule: require("./rule"),
  webInterface: {
    enable: true,
    webPort: WEB_PORT
  },
  throttle: 10000,
  forceProxyHttps: true,
  silent: false
};
const proxyServer = new AnyProxy.ProxyServer(options);

proxyServer.on("ready", () => {
  console.log(`Proxy run on Port ${PROXY_PORT}`);
  console.log(`Web interface run on Port ${WEB_PORT}`);
});
proxyServer.on("error", e => {
  /* */
});
proxyServer.start();
