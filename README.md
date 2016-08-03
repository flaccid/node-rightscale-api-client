# node-rightscale-api-client

A RightScale API client library written in NodeJS.

## Installation

    $ npm install rightscale-api-client

## Usage

Note: refresh token is only supported for authentication at this time.

### Module

When using as a module installed by npm. Other examples will use the client directly.

```javascript
var rightscale = require('rightscale-api-client');
var rsc = new RsApiClient();
```

### Basic Example

```javascript
var RsApiClient = require('./lib/rs_api_client');
var rsc = new RsApiClient();

rsc.login('us-4.rightscale.com', '103...921a').then(function(authToken){
  console.log('auth_token: '+authToken);
  return rsc.get("/api/clouds");
}).then(function(clouds){
  console.log(clouds);
}).catch(function(err){
  console.log("Error: "+err);
});
```

### Local Configuration

A local config file, `~/.rightscale/config.json` can be used and expects this structure:

```json
{
  "accounts":[
      {
        "id":"100524",
        "host":"us-4.rightscale.com",
        "refresh_token":"103...921a"
      },
      {
        "id":"100523",
        "host":"us-3.rightscale.com",
        "refresh_token":"103...921b"
      }
  ]
}
```

Example getting config only:

```javascript
var RsApiClient = require('./lib/rs_api_client');
var rsc = new RsApiClient();

rsc.getConfig().then(function(cfg){
  console.log(cfg);
}).catch(function(err){
  console.log("Error: "+err);
});
```

### Environment Configuration

It is also possible to simply use environment variables.

- `RS_ACCOUNT_ID` - the RightScale account ID
- `RS_REFRESH_TOKEN` - the RightScale user's API refresh token
- `RS_HOST` - the RightScale API endpoint e.g. us-4.rightscale.com

At this time, only one account is supported.

Getting the config from the environment only:

```javascript
var RsApiClient = require('./lib/rs_api_client');
var rsc = new RsApiClient();

rsc.getConfig('env').then(function(cfg){
  console.log(cfg);
}).catch(function(err){
  console.log("Error: "+err);
});
```

With subsequent `GET` calls:

```javascript
var RsApiClient = require('./lib/rs_api_client');
var rsc = new RsApiClient();

rsc.getConfig(env).then((cfg)=>{
  let account = JSON.parse(cfg).accounts[0];
  return rsc.login(account.host, account.refresh_token)
}).then((token)=>{
  return rsc.get('/api/clouds');
}).then((clouds)=>{
  console.log(clouds)
  return rsc.get("/api/identity_providers");
}).then(function(identityProviders){
  console.log(identityProviders);
}).catch(function(err){
  console.log("Error: "+err);
});
```

License and Authors
-------------------
- Author: Chris Fordham (<chris@fordham-nagy.id.au>)

```text
Copyright 2016, Chris Fordham

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
```
