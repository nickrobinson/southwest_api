var cheerio = require('cheerio');
var request = require('request');
var AWS = require('aws-sdk');

var event = {};
event["origin"] = process.argv[3];
event["destination"] = process.argv[4];
event["date"] = process.argv[5];

exports.handler = function(event, context) {
    console.log(event);

    var dynamodb = new AWS.DynamoDB(options = {'region': 'us-east-1'});

    var params = {
	Key: {
	    id: {
		N: '1'
	    }
	},
	TableName: 'cookies'
    };

    var cookie = [];
    //Get the current cookie from dynamo
    dynamodb.getItem(params, function(err, data) {
	if(err) {
	    context.fail(err);
	} else {
	    cookie = data;
	    console.log(data);
	}
    });
    
    var options = {
	url: 'https://www.southwest.com/flight/search-flight.html',
	followAllRedirects: true,
	jar: true,
	form: {
	    'twoWayTrip': false,
	    'originAirport': event.origin,
	    'destinationAirport': event.destination,
	    'outboundDateString': event.date,
	    'fareType': 'DOLLARS',
	    'adultPassengerCount': 1,
	    'outboundTimeOfDay': 'ANYTIME',
	    'swaBizDiscountSearch': false,
	    'bugFareType': 'DOLLARS',
	    'awardCertificateToggleSelected': false,
	    'modifySearchSubmitButton': 'Search',
	    'promoCertSelected': false,
	    'transitionalAwardSelected': false,
	    'airTranRedirect': null,
	    'frequentTripName': null,
	    'promoCode': null,
	    'returnAirport': null,
	    'toggle_selfltnew': null
	},
	method: 'POST',
	headers: {
	    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.10; rv:39.0) Gecko/20100101 Firefox/39.0',
	    'Host': 'www.southwest.com',
	    'Referer': 'https://www.southwest.com/flight/?clk=GSUBNAV-AIR-BOOK',
	    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
	    'Connection': 'keep-alive'
	}
    };

    request(options, function(error, response, html) {
	var flights = [];

	//console.log('REQUEST RESULTS:', error, response.statusCode);

	if(!error && response.statusCode == 200){
	    
	    var $ = cheerio.load(html);

	    $('#faresOutbound tbody').children().each(function() {
		var data = $('.product_price', this);
		var json = {price: "", departureTime: "", arrivalTime: "", flightNum: "", layover: ""};
		
		json.price = data.last().text().trim();

		if(json.price.length === 0) {
		    return;
		}

		data = $('.time', this);
		json.departureTime = data.first().text().trim();
		json.arrivalTime = data.last().text().trim();

		data = $('.indicator', this);
		json.departureTime += data.first().text().trim();
		json.arrivalTime += data.eq(1).text().trim();

		data = $('.flight_column .bugLinkText', this);
		flight_re = /\d+/;
		json.flightNum = data.first().text().trim().match(flight_re)[0];

		data = $('.search-results--flight-stops', this);
		city_re = /[A-Z]{3}/;
		if (data.first().text().length !== 0) {
		    json.layover = data.first().text().match(city_re)[0];
		}

		if (data.eq(1).length !== 0) {
		    json.flightNum += "/";
		    json.flightNum += data.eq(1).text().match(flight_re);
		}

		flights.push(json);
	    });
	    
	    if (process.argv[2] !== "local") {
		context.done(null, flights);
	    } else {
		console.log(flights);
	    }
	    
	} else {
	    console.log("ERROR");
	}
    });
};

