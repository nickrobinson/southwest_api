var request = require('request');
var AWS = require('aws-sdk'); 

var options = {
    url: 'https://www.southwest.com/',
    followAllRedirects: true,
    jar: true,
    method: 'GET',
    headers: {
	'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.10; rv:39.0) Gecko/20100101 Firefox/39.0',
	'Host': 'www.southwest.com',
	'Referer': 'https://www.southwest.com/flight/?clk=GSUBNAV-AIR-BOOK',
	'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
	'Connection': 'keep-alive'
    }
};

request(options, function(error, response, body){
    console.log(response.headers['set-cookie']);

    var dynamodb = new AWS.DynamoDB(options = {'region': 'us-east-1'});

    var params = {
	Item: {
	    id: {
		N: '1'
	    },
	    cookie: {
		SS: response.headers['set-cookie'] 
	    }
	},
	TableName: 'cookies',
    };

    dynamodb.putItem(params, function(err, data) {
	if (err) console.log(err, err.stack);
	else console.log(data);
    });
});

