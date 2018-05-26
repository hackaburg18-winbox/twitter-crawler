const fs = require('fs');
const readline = require('readline');
const CryptoJS = require("crypto-js");


let twitterApiConfig = {
    "consumerKey": "3NRSoN36I4XAisdY2G1E9cppp",
    "consumerSecret": "cfLEFEKjJtPIWRs61izc9SO65LKH5RisBGJkkeFyvG8MG6cWyQ",
    "accessToken": "862420947609018368-inPAnj9oYz8nXk3TCKrmA7rhmPVAt7B",
    "accessTokenSecret": "BIAfaKpPeVK39KroLuGvBnbE9PQgs9qasDeBrrDSqwXBN",
    "callBackUrl": ""
};

var twitterJson = JSON.stringify(twitterApiConfig);
var cypher = CryptoJS.AES.encrypt(twitterJson, "hackadash2018");

console.log("Cypher:");
console.log(cypher.toString());

var decrypted = CryptoJS.AES.decrypt(cypher.toString(), "hackadash2018");

var parsed = JSON.parse(decrypted.toString(CryptoJS.enc.Utf8));
console.dir(parsed);
