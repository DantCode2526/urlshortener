require("dotenv").config();
const express = require("express");
const cors = require("cors");
const app = express();
const bodyParser = require("body-parser");
const dns = require("dns");
// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

app.use("/public", express.static(`${process.cwd()}/public`));
app.use(bodyParser.urlencoded({ extended: false }));

app.get("/", function (req, res) {
    res.sendFile(process.cwd() + "/views/index.html");
});

// Your first API endpoint
app.get("/api/hello", function (req, res) {
    res.json({ greeting: "hello API" });
});

const urlDatabase = {};
let urlCounter = 1;

// Middleware para validar la URL
const validateUrl = (urlString, callback) => {
    try {
        const parsedUrl = new URL(urlString);
        const hostname = parsedUrl.hostname;
        dns.lookup(hostname, (err) => {
            callback(!err);
        });
    } catch (e) {
        console.log(e);
        callback(false);
    }
};

// Ruta POST para acortar URLs
app.post("/api/shorturl", (req, res) => {
    const { url: urlString } = req.body;

    // Valida la URL
    validateUrl(urlString, (isValid) => {
        console.log(isValid);
        if (!isValid) {
            return res.json({ error: "invalid url" });
        }

        // Genera una URL corta
        const shortUrl = urlCounter++;
        urlDatabase[shortUrl] = urlString;

        // Envía la respuesta con la URL original y la URL corta
        res.json({
            original_url: urlString,
            short_url: shortUrl,
        });
    });
});

// Ruta GET para redirigir a la URL original
app.get("/api/shorturl/:short_url", (req, res) => {
    const { short_url } = req.params;
    const originalUrl = urlDatabase[parseInt(short_url)];

    // Verifica si la URL corta existe
    if (originalUrl) {
        res.redirect(originalUrl);
    } else {
        res.status(404).json({ error: "No short URL found for this code" });
    }
});

app.listen(port, function () {
    console.log(`Listening on port ${port}`);
});
