var request = require('request');

airports = {
    "BHM":{
	"routesServed":["ABQ","ALB","AMA","AUA","AUS","BDL","BOI","BOS","BUF","BUR","BWI","CAK","CHS","CLE","CLT","CMH","CRP","CUN","DAL","DAY","DCA","DEN","DSM","DTW","ELP","EWR","FLL","FNT","GEG","GRR","GSP","HOU","HRL","IAD","ICT","IND","ISP","JAX","LAS","LAX","LBB","LGA","LIT","MAF","MBJ","MCI","MCO","MDW","MHT","MKE","MSP","MSY","NAS","OAK","OKC","OMA","ONT","ORF","PBI","PDX","PHL","PHX","PIT","PUJ","PVD","PWM","RDU","RIC","RNO","ROC","SAN","SAT","SDF","SEA","SFO","SJC","SJD","SJU","SLC","SMF","SNA","STL","TPA","TUL","TUS"]
    }
}

for (var i = 0; i < airports["BHM"]["routesServed"].length; i++) {
    
    var options = {
	url: "https://bqkfahgo2a.execute-api.us-east-1.amazonaws.com/prod/flight",
	method: 'POST',
	body: {
	    "origin": "BHM",
	    "destination": airports["BHM"]["routesServed"][i],
	    "date": "09/04/2015"
	},
	json: true
    };
    
    request(options, function (error, response, body) {
	console.log(body);
    });
}
