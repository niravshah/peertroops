var express = require('express');
var router = express.Router();

var http = require('http');
var OAuth = require('oauth');
var nodeUrl = require('url');
var clientID = 'tp2TPIubCZVw09CZDO7fNom7a';
var clientSecret = '6QmwHDR6FRZky1FpUWPLB1hCOcPHyNLs5cjVDophXPsPuEsNc2';
var callbackURL = 'http://localhost:3000/callback';

oa = new OAuth.OAuth(
    'https://api.twitter.com/oauth/request_token',
    'https://api.twitter.com/oauth/access_token',
    clientID,
    clientSecret,
    '1.0',
    callbackURL,
    'HMAC-SHA1'
);

var oAuthAccessToken;
var oAuthAccessTokenSecret;

router.get('/', function (request, response) {

    oa.getOAuthRequestToken(function (error, oAuthToken, oAuthTokenSecret, results) {
        
        if (error) {
            console.log(error);
            response.end(JSON.stringify({
                message: 'Error occured while getting access token',
                error: error
            }));
            return;
        }


        oAuthAccessToken = oAuthToken;
        oAuthAccessTokenSecret = oAuthTokenSecret;
        var authURL = 'https://twitter.com/' +
            'oauth/authenticate?oauth_token=' + oAuthToken;

        var body = '<a href="' + authURL + '"> Get Code </a>';
        response.writeHead(200, {
            'Content-Length': body.length,
            'Content-Type': 'text/html'
        });
        response.end(body);
    });
});

router.get('/callback', function (request, response) {

    console.log('Calback: ', oAuthAccessToken,oAuthAccessTokenSecret);
    var getOAuthRequestTokenCallback = function (error, oAuthAccessToken,
                                                 oAuthAccessTokenSecret, results) {
        if (error) {
            console.log(error);
            response.end(JSON.stringify({
                message: 'Error occured while getting access token',
                error: error
            }));
            return;
        }

        oa.get('https://api.twitter.com/1.1/account/verify_credentials.json',
            oAuthAccessToken,
            oAuthAccessTokenSecret,
            function (error, twitterResponseData, result) {
                if (error) {
                    console.log(error)
                    res.end(JSON.stringify(error));
                    return;
                }
                try {
                    console.log(JSON.parse(twitterResponseData));
                } catch (parseError) {
                    console.log(parseError);
                }
                console.log(twitterResponseData);
                response.end(twitterResponseData);
            });
    };

    oa.getOAuthAccessToken(request.query.oauth_token, oAuthAccessTokenSecret,
        request.query.oauth_verifier,
        getOAuthRequestTokenCallback);

});

module.exports = router;
