const express = require("express");
const cors = require("cors");
const whois = require('whois-json');
const Sequelize = require('sequelize');

const app = express();

const port = process.env.PORT || 5000;

const sequelize = new Sequelize('domain_lookup', 'root', '', {
    host: 'localhost',
    dialect: 'mysql',
});

const Domain = sequelize.define('domain', {
    url: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
    },
    domain: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
        primaryKey: true,
    },
    createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
    },
    updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
    },
    expirationDate: {
        type: Sequelize.DATE,
        allowNull: false,
    },
    registrar: {
        type: Sequelize.STRING,
        allowNull: false,
    },
    reg_country: {
        type: Sequelize.STRING,
        allowNull: false,
    }
});

const frontendUrl = "http://127.0.0.1:5500";

app.use(cors({ credentials: true, origin: frontendUrl }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// Add headers
app.use(function (req, res, next) {

    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', frontendUrl);

    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', true);

    // Pass to next layer of middleware
    next();
});

app.get("/", (req, res) => {
    res.send("Hello World");
});

app.post('/api/search', async (req, res) => {
    let url = req.body.url;
    console.log(url);
    let domain = url.split('//')[1].split('/')[0];
    if (domain.includes('www.')) {
        domain = domain.split('www.')[1];
    }
    console.log(domain);
    url = `https://www.${domain}`;
    try {
        const searchData = await Domain.findOne({
            where: {
                domain: domain,
            },
        });
        if (searchData) {
            res.send(searchData);
        }
        else {
            const result = await whois(domain);
            console.log(result);
            const resultData = await Domain.create({
                url: url,
                domain: domain,
                createdAt: result.created,
                updatedAt: result.updated,
                expirationDate: result.registrarRegistrationExpirationDate,
                registrar: result.registrar,
                reg_country: result.registrantCountry,
            });
            res.send(resultData);
        }
    } catch (error) {
        res.status(500).send(error);
    }
});

Domain.sync().then(() => {
    app.listen(port, () => console.log(`Listening on port ${port}`));
}).catch(err => {
    console.log(err);
});
