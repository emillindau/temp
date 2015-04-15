// http://localhost:5601/
/** This is the other part **/
var express = require('express');
var expressValidator = require('express-validator');
var app = express();
var bodyParser = require('body-parser');
var methodOverride = require('method-override');
var http = require('http').Server(app);
var mongoose = require('mongoose');
var BeverageModel = require('./app/models/beverageModel');
var elasticsearch = require('elasticsearch');
var io = require('socket.io')(http);

// Configure
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(bodyParser.json({type: 'application/vnd.api+json'}));
app.use(methodOverride('X-HTTP-Method-Override'));
app.use(express.static(__dirname + '/public/'));
app.use(expressValidator());

// Mongoose
mongoose.connect('mongodb://localhost/bolaget');

// ElasticSearch
var client = new elasticsearch.Client({
    host: 'localhost:9200',
    //log: 'trace'
});

var port = process.env.PORT || 8080;
var router = express.Router();

router.route('/search').post(function(req, res) {
    req.checkBody('query', 'Is empty').notEmpty();
    req.checkBody('query', 'Is not between 1-200 chars').len(1, 200);
    req.sanitize('query').toString();

    var errors = req.validationErrors();
    if(errors) {
        console.log('Validation errors!');
        console.log(errors);
        res.status(400).send(errors);
    }

    // Search
    client.search({
        index: 'bolaget',
        type: 'sortiment',
        q: req.body.query
    }).then(function (resp) {
        var hits = resp.hits.hits;
        res.json(resp.hits.hits);
        /*for(var i = 0; i < hits.length; i++) {
            var curr = hits[i];
            console.log(curr._source.Namn + ' ' + curr._source.Namn2);
        }*/
    }, function (err) {
        console.trace(err.message);
    });
});

router.route('/beverages/:beverage_id').delete(function(req, res) {
    console.log('deleting');
    BeverageModel.remove({
        _id: req.params.beverage_id
    }, function(err, model) {
        if(err) {
            res.send(err);
        }

        BeverageModel.find(function(err, models) {
            if(err) {
                res.send(err);
            }
            res.json(models);
        });
    });
});

router.route('/beverages').post(function(req, res) {
    var bev = req.body._source;
    BeverageModel.findOne({'articleId': bev.Artikelid}, function(err, beverageModel) {
        if(err) {
            console.log(err);
            return err;
        }
        if(!beverageModel) {
            // We dont have a beverage with specified id..
            var bModel = new BeverageModel();
            bModel.name = bev.Namn;
            bModel.name2 = bev.Namn2;
            bModel.alcohol = bev.Alkoholhalt;
            bModel.price = bev.Prisinklmoms;
            bModel.type = bev.Varugrupp;
            bModel.articleId = bev.Artikelid;

            // .. thus create one
            bModel.save(function(err) {
                if(err) {
                    return err;
                } else {
                    console.log('New beverage with name '+ bModel.name + ' ' + bModel.name2 + ' created!');
                    res.json(bModel);
                }
            });
        } else {
            // The beverage aldready exists in database
            console.log('Beverage already exists');
        }
    });
}).get(function(req, res) {
    BeverageModel.find(function(err, bModels) {
        if(err) {
            res.send(err);
        }
        res.json(bModels);
    })
});

router.route('*').get(function(req, res) {
    res.sendFile('.public/index.html');
});

io.on('connection', function(socket) {
    console.log('a user connected');
    socket.on('query', function(data) {
        console.log(data);

        // Search
        client.search({
            index: 'bolaget',
            type: 'sortiment',
            q: data.query
        }).then(function (resp) {
            var hits = resp.hits.hits;
            console.log("Results: " + hits.length);
            // console.log(hits[0]);
            io.emit('results', hits);
        }, function (err) {
            console.trace(err.message);
        });
    });
})

app.use('/api', router);

http.listen(port, function() {
    console.log('Server started on port: '+port);
});
/*var server = http.createServer(app).listen(port, function() {
    console.log('Server started on port: ' + port);
});*/

// var io = require('socket.io').listen(server);



function search(query) {

}