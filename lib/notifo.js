var qs = require('querystring');
var https = require('https');

var Notifo = function Notifo(username, secret) {
	this.username = username;
	this.secret = secret;
};

Notifo.prototype = {
  requestOptions: function(url) {
    return {
  		host: 'api.notifo.com',
  		port: 443,
  		path: '/v1/' + url,
  		method: 'POST',
  		headers: {
  			'Authorization': 'Basic ' + new Buffer(this.username + ':' + this.secret).toString('base64'),
  			'Content-Type': 'application/x-www-form-urlencoded'
  		}
  	};
  },

  callAPI: function(url, options, callback) {
    console.dir(this.username + ':' + this.secret);
    console.dir(this.requestOptions(url));
    var req = https.request(this.requestOptions(url), function(res) {
    	res.setEncoding('utf8');
  	  res.on('data', function(body) {
  			try {
  				var response = JSON.parse(body.match(/{"status.*/)[0].trim());
  				if (response['response_code'] !== 2201) {
  				  callback(new Error('notifo code ' + response['response_code'] + ': ' + response['response_message']), response);
  				} else {
  				  callback(null, response);
  				}
  			} catch(e) {
  			  callback(e, null);
  			}
  		});
  	});
  	req.write(qs.stringify(options));
  	req.end();

  	req.on('error', function(e) {
      callback(e, null);
  	});
  },
  
  subscribeUser: function(username, subscribeUserCallback) {
    this.callAPI('subscribe_user', {username: username}, subscribeUserCallback);
  },
  
  send: function(options, sendCallback) {
  	// Setup default values and light validation.
  	if (!options.title && !options.uri && !options.msg) {
  		sendCallback(new Error('Tried to send notification without any information.'), null);
  		return false;
  	}

  	// Make sure the messages don't exceed the APIs max length.
  	Object.keys(options).forEach(function (key) {
  		options[key] = options[key].substr(0,1024)+'';
  	});

  	if (!options.msg) {
  		sendCallback(new Error('Must supply a msg.'), null);
  		return false;
  	}

  	// Send the request containing notification data.
  	this.callAPI('send_notification', options, sendCallback);	
  }
};

module.exports = Notifo;