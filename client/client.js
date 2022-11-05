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

const domain = 'j5qx4waffduqrenxplzd7zdbne0coxgp.lambda-url.ap-northeast-2.on.aws';
const roleArn = 'arn:aws:iam::677146750822:role/CdkLambdaStack-fnUrlRoleF3FB2EB9-1DUX7O5K3EOQ3';
const region = 'ap-northeast-2';
const myMethod = 'POST';
const myPath = '/';

let input = [
    {
        "user-id":"a0001",
        "name":"John"
    },
    {
        "user-id":"a0002",
        "name":"David"
    }
];
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