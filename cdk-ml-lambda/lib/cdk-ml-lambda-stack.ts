import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as path from "path";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as iam from "aws-cdk-lib/aws-iam";

export class CdkMlLambdaStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);
    
    // Create ML Lambda
    const mlLambda = new lambda.DockerImageFunction(this, "ml-lambda", {
      description: 'lambda function url for ML',
      functionName: 'ML-XGBoost',
      code: lambda.DockerImageCode.fromImageAsset(path.join(__dirname, '../../src')),
      timeout: cdk.Duration.seconds(30),
    }); 

    // Lambda function url for simple endpoint
    const fnUrl = mlLambda.addFunctionUrl({
      authType: lambda.FunctionUrlAuthType.AWS_IAM // NONE,
    });

    // define the role of function url
    const fnUrlRole = new iam.Role(this, 'fnUrlRole', {
      assumedBy: new iam.AccountPrincipal(cdk.Stack.of(this).account),
      description: 'Role for lambda function url',
    });    

    // apply the defined role
    fnUrl.grantInvokeUrl(fnUrlRole);

    // check the arn of funtion url role
    new cdk.CfnOutput(this, 'fnUrlRoleArn', {
      value: fnUrlRole.roleArn,
      description: 'The arn of funtion url role',
    });    

    // check the address of lambda funtion url
    new cdk.CfnOutput(this, 'EndpointUrl', {
      value: fnUrl.url,
      description: 'The endpoint of Lambda Function URL',
    });
  }
}
