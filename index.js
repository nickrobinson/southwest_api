var cheerio = require('cheerio');
var request = require('request');

exports.handler = function(event, context) {
    console.log(event);
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
	    var json = {price: "", departureTime: "", arrivalTime: "", flightNum: ""};
	    
	    var $ = cheerio.load(html);

	    $('#faresOutbound tbody').children().each(function() {
		var data = $('.product_price', this);
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

		data = $('.flight_column .bugText', this);
		flight_re = /\d+/;
		json.flightNum = data.first().text().trim().match(flight_re);

		if (data.eq(1).length !== 0) {
		    json.flightNum += "/";
		    json.flightNum += data.eq(1).text().trim().match(flight_re);
		}

		console.log(flights);
		flights.push(json);
	    });

	    context.done(null, flights);
	    
	} else {
	    console.log("ERROR");
	}
    });
};
