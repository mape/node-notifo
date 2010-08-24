var sys = require('sys');
var net = require('net');
var qs = require('querystring');

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
	this.secret = args.secret || '';
	this.username = args.username || '';
};

Notifo.prototype.send = function (options, callback) {
	var self = this;
	// Setup default values and light validation.
	
	if (!options.title && !options.uri && !options.msg) {
		throw new Error('Tried to send notification without any information.');
		return false;
	}

	// Make sure the messages don't exceed the APIs max length.
	Object.keys(options).forEach(function (key) {
		options[key] = options[key].substr(0,1024);
	});

	if (!options.msg) {
		throw new Error('Must supply a msg.');
		return false;
	}
	
	var client = net.createConnection (443, 'api.notifo.com');

	client.setEncoding('UTF8');
	client.addListener('connect', function () {
		// Make sure we are able to TLS
		try {
			client.setSecure();
		} catch (e) {
			throw new Error('SSL is not supported in your version of node JS. This is needed for this module to function.');
		}
	});

	// Send the request containing notification data.
	var auth = new Buffer(this.username+':'+this.secret).toString('base64');
	var postData = qs.stringify(options);

	client.addListener('secure', function () {
		client.write('POST /v1/send_notification HTTP/1.1\r\n');
		client.write('Host: api.notifo.com\r\n');
		client.write('User-Agent: node-notifo\r\n');
		client.write('Authorization: Basic '+auth+'\r\n');
		client.write('Content-Type: application/x-www-form-urlencoded\r\n');
		client.write('Content-Length:'+ postData.length+'\r\n');
		client.write('\r\n');
		client.write(postData+'\r\n');
		client.write('\r\n');
	});

	var body = '';
	client.on('data', function (chunk) {
		body += chunk;
	});
	client.on('end', function (chunk) {
		try {
			var responce = JSON.parse(body.match(/{"status.*/)[0].trim());
			if (responce['response_code'] !== 2201) {
				callback(new Error(responce['response_code']+': '+responce['response_message']), null);
			} else {
				callback(null, responce);
			}
		} catch(e) {
			callback(e, null);
		}
	});
};