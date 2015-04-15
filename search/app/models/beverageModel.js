var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var BeverageSchema = new Schema({
    name: String,
    name2: String,
    alcohol: String,
    price: String,
    type: String,
    articleId: String
});

module.exports = mongoose.model('BeverageModel', BeverageSchema);