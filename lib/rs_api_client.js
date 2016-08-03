fetch = require('node-fetch');

rsApiClient = function (host, refreshToken){
  var self = this;
  var auth_token = false;
  var endpoint = false;
  var cfg = false;

  // we assume http_proxy accepts https requests
  if (process.env.http_proxy || process.env.https_proxy) {
    var HttpsProxyAgent = require('https-proxy-agent');
    var proxy = (process.env.http_proxy || process.env.https_proxy) || null;
    var agent = new HttpsProxyAgent(proxy) || null;
  }

  self.httpProxy = function(){
    return proxy
  }

  self.auth = function(){
    return auth_token
  }

  self.host = function(){
    return endpoint
  }

  self.printConfig = function(){
    return 'not implemented';
  };

  // login to rightscale (currently only oauth2)
  self.login = function (host, refreshToken){
    var promise = new Promise(function(resolve, reject){
      var fetch = require('node-fetch');
      var FormData = require('form-data');
      var form = new FormData();

      endpoint = host;

      form.append('refresh_token', refreshToken);
      form.append('grant_type', 'refresh_token');

      fetch('https://'+host+'/api/oauth2', {
        headers: { 'X-API-Version': '1.5' },
        method: 'POST',
        body: form,
        agent: agent
      }).then(function(response) {
        return response.text()
      }).then(function(body) {
        auth_token = JSON.parse(body)['access_token'];
        resolve(auth_token);
      }).catch(reject);
    });
    return promise;
  };

  // gets local or environment configuration
  self.getConfig = function(source = 'local'){
    switch(source) {
      case 'local':
        var promise = new Promise(function(resolve, reject){
          var fs = require('fs');
          var path = require('path');
          var homedir = require('homedir');

          // home directory of user
          var hd = homedir()
          console.log('user homedir: '+hd);

          var cfgFile = path.join(hd, '.rightscale', 'config.json');
          var cfgDir = path.dirname(cfgFile);

          // create config folder if not existing
          if (!fs.existsSync(cfgDir)){
            console.log('creating configdir, '.concat(cfgDir));
            fs.mkdirSync(cfgDir);
          }

          // create config file if not existing
          if (!fs.existsSync(cfgDir)){
            fs.writeFile(cfgDir, "{}", { flag: 'w' }, function (err) {
              if (err) throw err;
              console.log('created '.concat(cfgFile));
            });
          }

          // get config
          var cfg = fs.readFileSync(cfgFile).toString();
          resolve(cfg);
        });
        break;
      case 'env':
        // when using env, we should still use the same json structure for config
        var promise = new Promise(function(resolve, reject){
          id = process.env.RS_ACCOUNT_ID
          refresh = process.env.RS_REFRESH_TOKEN
          host = process.env.RS_HOST || 'us-4.rightscale.com'
          var cfg = '{' +
            '"accounts": [' +
              '{' +
                '"id": "' + id + '", ' +
                '"name": "default", ' +
                '"host": "' + host + '", ' +
                '"refresh_token": "' + refresh + '"' +
              '}' +
            ']' +
          '}'
          resolve(cfg);
        });
        break;
    }
    return promise;
  }

  // http get
  self.get = function (href){
    var promise = new Promise(function(resolve, reject){
      var url = 'https://' + self.host() + href;
      console.log('GET: '+url)
      bearer = 'Bearer '+auth_token;
      // console.log('Bearer: '+bearer)
      fetch(url, {
        headers: { 'X-API-Version': '1.5', 'Authorization': bearer },
        method: 'GET',
        agent: agent
      }).then(function(response) {
        return response.text()
      })
      .then(resolve)
      .catch(reject);
    });
    return promise;
  };
};

module.exports = rsApiClient;
