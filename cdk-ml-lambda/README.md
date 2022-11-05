# AWS CDK로 머신러닝 추론을 위한 Lambda Functional URL 구현하기

Lambda를 이용한 ML inference 인프라를 [AWS CDK](https://github.com/kyopark2014/technical-summary/blob/main/cdk-introduction.md)를 이용해 구성합니다.

## 기본 설정

"cdk-ml-lambda"와 같이 폴더를 하나 생성하고 아래와 같이 CDK 초기화를 수행합니다. 

```java
cdk init app --language typescript
```

아래와 같이 bootstrap을 수행합니다. 1회만 수행하면 됩니다. 

```java
cdk bootstrap aws://123456789012/ap-northeast-2
```

"123456789012"은 AWS account number입니다. AWS Console에서 확인할 수 있고, 아래와 같이 확인할 수도 있습니다. 

```java
aws sts get-caller-identity --query Account --output text
```

## 인프라 설정

[lib/cdk-ml-lambda-stack.ts](https://github.com/kyopark2014/lambda-with-ML-container/blob/main/cdk-ml-lambda/lib/cdk-ml-lambda-stack.ts)를 열어서 아래와 같이 설정합니다. 

### Lambda 생성

[lambda.DockerImageFunction()](https://docs.aws.amazon.com/cdk/api/v1/docs/@aws-cdk_aws-lambda.DockerImageFunction.html)를 이용하여 lambda에서 docker image를 로드하여 사용하도록 설정합니다. 여기서는 lambda의 이름을 편의상 'ML-XGBoost'로 지정하였는데, 중복되지 않도록 설정하여야 합니다. 

아래와 같이 [DockerImageCode.fromImageAsset](https://docs.aws.amazon.com/cdk/api/v1/docs/@aws-cdk_aws-lambda.DockerImageCode.html)을 설정을 하면, 해당 소스 디렉토리에서 docker image를 빌드하여 [AWS ECR](https://ap-northeast-2.console.aws.amazon.com/ecr/repositories?region=ap-northeast-2)에 자동으로 이미지를 업로드 한 후에, lambda에서 로드하여 사용합니다.  

```java
    const mlLambda = new lambda.DockerImageFunction(this, "ml-lambda", {
      description: 'lambda function url for ML',
      functionName: 'ML-XGBoost',
      code: lambda.DockerImageCode.fromImageAsset(path.join(__dirname, '../../src')),
      timeout: cdk.Duration.seconds(30),
    }); 
```    

### Lambda Function URL 생성

Lambda를 외부에서 접속할 수 있도록 Endpoint로 지정합니다. 이때 Role을 아래와 같이 설정하고 Role 이름도 확인합니다. Role 이름은 client에서 사용합니다.  

```java
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
```    

이때 얻어진 Role ARN은 아래와 같습니다.

```java
Outputs:
CdkMlLambdaStack.fnUrlRoleArn = arn:aws:iam::123456789012:role/CdkMlLambdaStack-fnUrlRoleF3FB2EB9-1H0ZW8VRW5AM3
```

### Endpoint Address

외부에서 접속시 사용할 Endpoint 주소를 아래와 같이 확인합니다. 

```java
    new cdk.CfnOutput(this, 'EndpointUrl', {
      value: fnUrl.url,
      description: 'The endpoint of Lambda Function URL',
    });
```    

이때의 결과는 아래와 같습니다. client에서 접속하는 주소는 "samplet4zi2bqfx6k42fo26agi0kcght.lambda-url.ap-northeast-2.on.aws" 입니다.

```java
Outputs:
CdkMlLambdaStack.EndpointUrl = https://samplet4zi2bqfx6k42fo26agi0kcght.lambda-url.ap-northeast-2.on.aws/
```

## 인프라 설치 및 삭제

인프라 설치는 CDK 폴더에서 아래 명령어를 이용해 수행합니다. 

```java
cdk deploy
```

인프라 삭제는 아래 명령어를 이용합니다. 

```java
cdk destroy
```
