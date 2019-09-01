const mongoose = require('../db');
const Schema = mongoose.Schema;

const urlShortenSchema = new Schema({
    originalUrl: String,
    urlCode: String,
    shortUrl: String,
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("UrlShorten", urlShortenSchema);
