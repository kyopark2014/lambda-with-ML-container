import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
// import * as sqs from 'aws-cdk-lib/aws-sqs';
import * as path from "path";
import * as lambda from "aws-cdk-lib/aws-lambda";

export class CdkMlLambdaStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);
    
    // Create AWS Lambda function from image code
    new lambda.DockerImageFunction(this, "ml-lambda", {
      description: 'lambda function url for ML',
      functionName: 'ML-XGBoost',
      code: lambda.DockerImageCode.fromImageAsset(path.join(__dirname, '../../src')),
      timeout: cdk.Duration.seconds(30),
    }); 
  }
}
