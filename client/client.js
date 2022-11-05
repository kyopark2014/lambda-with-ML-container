const { HttpRequest} = require("@aws-sdk/protocol-http");
const { defaultProvider } = require("@aws-sdk/credential-provider-node");
const { SignatureV4 } = require("@aws-sdk/signature-v4");
const { Sha256 } = require("@aws-crypto/sha256-browser");
const {STSClient, AssumeRoleCommand}  = require('@aws-sdk/client-sts');
const sTS = new STSClient({region: 'ap-northeast-2'});
const https = require('https');
const xml = require('xml2js');

const aws = require("aws-sdk");
aws.config.getCredentials(function(err) {
    if (err) console.log(err.stack);
    else {
        console.log("Access key:", aws.config.credentials.accessKeyId);
    }
});
console.log("current credentials: %j", aws.config.credentials);

const domain = 'samplet4zi2bqfx6k42fo26agi0kcght.lambda-url.ap-northeast-2.on.aws';
const roleArn = 'arn:aws:iam::1234567890:role/CdkMlLambdaStack-fnUrlRoleF3FB2EB9-1H0ZW8VRW5AM3';
const region = 'ap-northeast-2';
const myMethod = 'POST';
const myPath = '/';

let input = [{"fixed acidity":6.6,"volatile acidity":0.24,"citric acid":0.28,"residual sugar":1.8,"chlorides":0.028,"free sulfur dioxide":39.0,"total sulfur dioxide":132.0,"density":0.99182,"pH":3.34,"sulphates":0.46,"alcohol":11.4,"color_red":0,"color_white":1},{"fixed acidity":8.7,"volatile acidity":0.78,"citric acid":0.51,"residual sugar":1.7,"chlorides":0.415,"free sulfur dioxide":12.0,"total sulfur dioxide":66.0,"density":0.99623,"pH":3.0,"sulphates":1.17,"alcohol":9.2,"color_red":1,"color_white":0}];

const body = JSON.stringify(input);

const run = async () => {
    const params = {
        RoleArn: roleArn,
        RoleSessionName: 'session',
    };
    const assumeRoleCommand = new AssumeRoleCommand(params);
    
    let data;
    try {
        data = await sTS.send(assumeRoleCommand);
    
        console.log('data: %j',data);
    } catch (error) {
          console.log(error);
    }

    aws.config.credentials.accessKeyId = data.Credentials.AccessKeyId;
    aws.config.credentials.secretAccessKey = data.Credentials.SecretAccessKey;
    aws.config.credentials.sessionToken = data.Credentials.SessionToken;
    console.log("modified credentials: %j", aws.config.credentials);

    console.log('domain: '+domain);

    var myService = 'lambda';

    // Create the HTTP request
    var request = new HttpRequest({
        headers: {
            'host': domain
        },
        hostname: domain,
        method: myMethod,
        path: myPath,
        body: body,
    });
    console.log('request: %j', request);

    // Sign the request
    var signer = new SignatureV4({
        // credentials: defaultProvider(),
        credentials: aws.config.credentials,   // temparary security credential
        region: region,
        service: myService,
        sha256: Sha256
    });
    console.log('signer: %j', signer);

    var signedRequest;
    try {
        signedRequest = await signer.sign(request);
        console.log('signedRequest: %j', signedRequest);

    } catch(err) {
        console.log(err);
    }

    // request
    performRequest(domain, signedRequest.headers, signedRequest.body, myPath, myMethod, function(response) {    
        console.log('response: %j', response);
    });
};
run();

// the REST API call using the Node.js 'https' module
function performRequest(endpoint, headers, data, path, method, success) {
    var dataString = data;
  
    var options = {
      host: endpoint,
      port: 443,
      path: path,
      method: method,
      headers: headers
    };

    var req = https.request(options, function(res) {
        res.setEncoding('utf-8');
    
        var responseString = '';
    
        res.on('data', function(data) {
            responseString += data;
        });
    
        res.on('end', function() {
            console.log(responseString);            
            success(responseString);
        });
    });

    req.write(dataString);
    req.end();
} 