const validUrl = require("valid-url");
const shortid = require("shortid");
const errorUrl='http://localhost/error';
const UrlShorten = require('../db/models/UrlShorten');

module.exports = app => {
    //GET API for redirecting to Original URL 
    app.get("/direct/:code", async (req, res) => {
        const urlCode = req.params.code;
        try {
            const item = await UrlShorten.findOne({ urlCode: urlCode });
            if (item) {
                return res.redirect(301, item.originalUrl);
            } else {
                return res.redirect(errorUrl);
            }
        } catch (err) {
            res.status(500).json("Internal Server Error: query URL exist failed or redirect error");
        }
    });

    //POST API for creating short url from Original URL 
    app.post("/short/item", async (req, res) => {
        const { originalUrl, shortBaseUrl } = req.body;
        if (!validUrl.isUri(shortBaseUrl) || !validUrl.isUri(originalUrl)) {
            return res
              .status(400)
              .json(
                "Bad Request: invalid Original Url or Short base Url"
                ); 
        } 

        const urlCode = shortid.generate();

        try {
            const item = await UrlShorten.findOne({ originalUrl: originalUrl });
            if (item) {
                res.status(200).json(item);
            } else {
                shortUrl = shortBaseUrl + "/direct/" + urlCode;
                updatedAt = new Date();
                const item = new UrlShorten({
                    originalUrl,
                    shortUrl,
                    urlCode,
                    updatedAt
                  });
                  await item.save();
                  res.status(201).json(item);
            }
        } catch (err) {
            res.status(500).json("Internal Server Error: query URL exist failed or shorten URL failed");
        }
    }); 
};