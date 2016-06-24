fetch = require('node-fetch');

rsApiClient = function (host, refreshToken){
  var self = this;
  var auth_token = false;
  var endpoint = false;
  var cfg = false;

  self.auth = function(){
    return auth_token
  }

  self.host = function(){
    return endpoint
  }

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
        body: form
      }).then(function(response) {
        return response.text()
      }).then(function(body) {
        auth_token = JSON.parse(body)['access_token'];
        resolve(auth_token);
      }).catch(reject);
    });
    return promise;
  };

  // gets local configuration
  self.getConfig = function(){
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
        method: 'GET'
      }).then(function(response) {
        return response.text()
      })
      .then(resolve)
      .catch(reject);
    });
    return promise;
  };

  self.printcfg = function(){
    console.log(default_config)
  };
};

module.exports = rsApiClient;
