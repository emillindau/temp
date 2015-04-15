var url = 'http://www.systembolaget.se/Assortment.aspx?Format=Xml';
var http = require('http');
var fs = require('fs');
var parser = require('xml2json');
var elasticsearch = require('elasticsearch');
// ElasticSearch start
var client = new elasticsearch.Client({  // default is fine for me, change as you see fit
    host: 'localhost:9200',
    log: 'trace'
});
var file = fs.createWriteStream('temp.xml');
var request = http.get(url, function(response) {
    var r = response.pipe(file);
    r.on('finish', function() {
        var xml = fs.readFileSync(__dirname + '/temp.xml');
        var json = parser.toJson(xml);
        var bolaget = JSON.parse(json);
        var artiklar = bolaget.artiklar.artikel;
        console.log(artiklar.length);

        index(artiklar);
    });
});

function index(bolaget) {
    for (var i = 0; i < bolaget.length; i++ ) {
        client.create({
            index: "bolaget", // name your index
            type: "sortiment", // describe the data thats getting created
            id: i, // increment ID every iteration - I already sorted mine but not a requirement
            body: bolaget[i] // *** THIS ASSUMES YOUR DATA FILE IS FORMATTED LIKE SO: [{prop: val, prop2: val2}, {prop:...}, {prop:...}] - I converted mine from a CSV so pubs  [i] is the current object {prop:..., prop2:...}
        },
        function(error, response) {
            if (error) {
                console.error(error);
                return;
            } else {
                console.log(response);  //  I don't recommend this but I like having my console flooded with stuff.  It looks cool.  Like I'm compiling a kernel really fast.
            }
        });
    }
}

/*var elasticsearch = require('elasticsearch');
var fs = require('fs');
var bolaget = JSON.parse(fs.readFileSync(__dirname + '/bolaget_array.json')); // name of my first file to parse
//var forms = JSON.parse(fs.readFileSync(__dirname + '/forms.json')); // and the second set

var client = new elasticsearch.Client({  // default is fine for me, change as you see fit
    host: 'localhost:9200',
    log: 'trace'
});

for (var i = 0; i < bolaget.length; i++ ) {
    client.create({
        index: "bolaget", // name your index
        type: "sortiment", // describe the data thats getting created
        id: i, // increment ID every iteration - I already sorted mine but not a requirement
        body: bolaget[i] // *** THIS ASSUMES YOUR DATA FILE IS FORMATTED LIKE SO: [{prop: val, prop2: val2}, {prop:...}, {prop:...}] - I converted mine from a CSV so pubs  [i] is the current object {prop:..., prop2:...}
    },
    function(error, response) {
        if (error) {
            console.error(error);
            return;
        } else {
            console.log(response);  //  I don't recommend this but I like having my console flooded with stuff.  It looks cool.  Like I'm compiling a kernel really fast.
        }
    });
}*/