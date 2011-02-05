var qs = require('querystring');
var https = require('https');

module.exports = function (args) {
	return new Notifo(args);
};

function Notifo(args) {
	if (!args.secret) {
		throw new Error('Must supply a valid Notifo API secret');
		return false;
	}
	if (!args.username) {
		throw new Error('Must supply a username');
		return false;
	}
	this.secret = args.secret;
	this.username = args.username;
};

Notifo.prototype.send = function (options, callback) {
	// Setup default values and light validation.
	if (!options.title && !options.uri && !options.msg) {
		callback(new Error('Tried to send notification without any information.'), null);
		return false;
	}

	// Make sure the messages don't exceed the APIs max length.
	Object.keys(options).forEach(function (key) {
		options[key] = options[key].substr(0,1024)+'';
	});

	if (!options.msg) {
		callback(new Error('Must supply a msg.'), null);
		return false;
	}

	// Send the request containing notification data.
	var req = https.request({
		'host': 'api.notifo.com'
		, 'port': 443
		, 'path': '/v1/send_notification'
		, 'method': 'POST'
		, 'headers': {
			'Authorization': 'Basic '+new Buffer(this.username+':'+this.secret).toString('base64')
			, 'Content-Type': 'application/x-www-form-urlencoded'
		}
	}, function(res) {
    	res.setEncoding('utf8');
		res.on('data', function(body) {
			try {
				var responce = JSON.parse(body.match(/{"status.*/)[0].trim());
				if (responce['response_code'] !== 2201) {
					callback(new Error('notifo code '+responce['response_code']+': '+responce['response_message']), responce);
				} else {
					callback(null, responce);
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
};