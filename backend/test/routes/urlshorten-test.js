'use strict';

const assert = require('assert');
const request = require('supertest');
const mongoose = require('../../db/db');
const UrlShorten = require('../../db/models/UrlShorten');
const sinon = require('sinon');

// eslint-disable-next-line no-unused-vars
const should = require('should');

const app = require('../../app');

describe('#urlshorten function test. File path is server/routes/urlshorten.js', () => {

    let server = app.listen(9900);
    let sandBox;
    
    describe('/short/item API test', () => {

        before(async function() {
            sandBox = sinon.createSandbox();
        });

        after(function () {
            sandBox.restore();
        });

        beforeEach(async () => {
            Object.keys(mongoose.models).forEach(async name => {
            await mongoose.model(name).remove();
            });
        });
        
        it('/short/item API should return 201 correct result when Original URL'
             + 'and Short URL are valid and there is no record in DB', async () => {

            let requestPayload = {
                "originalUrl": "http://originalurl.com/test",
                "shortBaseUrl": "http://shorturl.com"
            };
            
            let res = await request(server)
                .post('/short/item')
                .send(requestPayload)
                .expect(201);

            assert.ok(res.body !== undefined);
        });

        it('/short/item API should return 200 correct result when Original URL'
             + 'and Short URL are valid and there is a record exist in DB', async () => {

            let requestPayload = {
                "originalUrl": "http://originalurl-exsit.com/test",
                "shortBaseUrl": "http://shorturl-exsit.com"
            };
            
            let res = await request(server)
                .post('/short/item')
                .send(requestPayload)
                .expect(201);
    
            assert.ok(res.body !== undefined);

            requestPayload = {
                "originalUrl": "http://originalurl-exsit.com/test",
                "shortBaseUrl": "http://shorturl-exsit.com"
            };
            
            res = await request(server)
                .post('/short/item')
                .send(requestPayload)
                .expect(200);

            assert.ok(res.body !== undefined);
        });

        it('/short/item API should return 400 when Short URL is invalid', async () => {
            let requestPayload = {
                "originalUrl": "http://originalurl.com/test",
                "shortBaseUrl": "httshortur"
            };
            
            let res = await request(server)
                .post('/short/item')
                .send(requestPayload)
                .expect(400);

            assert.ok(true);
        });

        it('/short/item API should return 400 when Original URL is invalid', async () => {
            let requestPayload = {
                "originalUrl": "htoriginalurl.comtest",
                "shortBaseUrl": "http://shorturl.com"
            };
            
            let res = await request(server)
                .post('/short/item')
                .send(requestPayload)
                .expect(400);

            assert.ok(true);
        });

        it('/short/item API should return 500 when DataBase search error happened', async () => {
            // Mock Mongoose model findOne exception
            let urlShortenStub = sandBox.stub(UrlShorten, "findOne");
            urlShortenStub.throws("findOne throw exception");

            let requestPayload = {
                "originalUrl": "http://originalurl.com/test",
                "shortBaseUrl": "http://shorturl.com"
            };

            let res = await request(server)
                .post('/short/item')
                .send(requestPayload)
                .expect(500);

            assert.ok(true);
        });

        it('/short/item API should return 500 when DataBase save error happened', async () => {
            // Mock Mongoose model save exception
            let urlShortenStub = sandBox.stub(UrlShorten, "constructor");
            urlShortenStub.returns({
                save: function() {
                    throw "save exception";
                }
            });

            let requestPayload = {
                "originalUrl": "http://originalurl.com/test",
                "shortBaseUrl": "http://shorturl.com"
            };

            let res = await request(server)
                .post('/short/item')
                .send(requestPayload)
                .expect(500);
            
            assert.ok(true);
        });
    });

    describe('/direct/:code API test', () => {

        let shortUrlCode;
        before(async function() {
            sandBox = sinon.createSandbox();
        });

        after(function () {
            sandBox.restore();
        });

        beforeEach(async () => {
            Object.keys(mongoose.models).forEach(async name => {
                await mongoose.model(name).remove();
            });

            let requestPayload = {
                "originalUrl": "http://originalurl.com/test",
                "shortBaseUrl": "http://shorturl.com"
            };
            
            let response = await request(server)
                .post('/short/item')
                .send(requestPayload)
                .expect(201);
            
            shortUrlCode = response.body.urlCode;
        });

        it('/direct/:code API should redirect to original URL when URL short code are valid and there is record exist in DB', async () => {
            let res = await request(server)
                .get('/direct/' + shortUrlCode)
                .expect(301);

            assert.ok(res.text.indexOf("http://originalurl.com/test"));
        });
        
        it('/direct/:code API should redirect to error URL when URL short code are valid but there is no record exist in DB', async () => {
            let unExistCode = "xxx-xxx";
            let res = await request(server)
                .get('/direct/' + unExistCode)
                .expect(302);

            assert.ok(res.text.indexOf("http://localhost/error"));
        });

        it('/direct/:code API should return 500 when DataBase search error happened', async () => {
            // Mock Mongoose findOne exception
            let urlShortenStub = sandBox.stub(UrlShorten, "findOne");
            urlShortenStub.throws("findOne throw exception");
            
            let res = await request(server)
                .get('/direct/' + shortUrlCode)
                .expect(500);
        });
    });

    after(function () {
        mongoose.disconnect();    
    });

});