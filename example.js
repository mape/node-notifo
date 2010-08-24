var Notifo = require('notifo');

// Send uncaught exceptions to your iPhone.
var notification = new Notifo({
	'username': 'yourNotifoUsername'
	, 'secret': 'yourNotifoApiSecret'
});

notification.send({
	'uri': 'http://github.com/mape/node-notifo/'
	, 'msg': 'With URI, no title.'
}, function(err, response) {
	if (err) {
		throw err
	} else {
		console.log(response);
	}
});

notification.send({
	'title': 'node-notifo test'
	, 'msg': 'Without URI.'
}, function(err, response) {
	if (err) {
		throw err
	} else {
		console.log(response);
	}
});

notification.send({
	'title': 'node-notifo test'
	, 'uri': 'http://github.com/mape/node-notifo/'
	, 'msg': 'With URI and title.'
}, function(err, response) {
	if (err) {
		throw err
	} else {
		console.log(response);
	}
});