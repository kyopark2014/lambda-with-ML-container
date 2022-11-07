# AWS CDK로 AWS Lambda에서 XGBoost를 이용한 머신러닝 추론 구현하기 

[XGBoost](https://github.com/kyopark2014/ML-Algorithms/blob/main/xgboost.md)는 빠르고 정확한 머신러닝 알고리즘일뿐 아니라, [분류(Classficiation)](https://github.com/kyopark2014/ML-Algorithms/blob/main/classification.md)와 [회귀(Regression)](https://github.com/kyopark2014/ML-Algorithms/blob/main/regression.md)문제에 모두 적용할 수 있어서 널리 활용되어 지고 있습니다. 또한, 대표적인 서버리스 서비스인 Lambda는 운영에 대한 부담을 줄여주고 사용한 만큼만 지불(Pay As You Go)할 수 있어서 다양한 어플리케이션에서 유용하게 활용되고 있습니다. 특히, 2020년 12월부터 [Lambda가 Container이미지를 지원](https://aws.amazon.com/ko/blogs/korea/new-for-aws-lambda-container-image-support/)함으로써, Lambda를 머신러닝(Machine Learning)에도 유용하게 사용할 수 있게 되었습니다. 

여기서는 [AWS CDK](https://github.com/kyopark2014/technical-summary/blob/main/cdk-introduction.md)를 이용하여, Lambda에서 머신러닝 추론(Inference)을 수행하고, 외부에서 접속할 수 있는 추론 API를 생성합니다. 또한, AWS IAM 인증을 이용한 클라이언트를 이용하여 안전하게 추론 API를 호출할 수 있습니다. 

## 머신러닝 알고리즘 

[Wine Quality을 예측](https://github.com/kyopark2014/ML-Algorithms/tree/main/kaggle/xgboost-wine-quality)하기 위해 [XGBoost 알고리즘](https://github.com/kyopark2014/ML-Algorithms/blob/main/xgboost.md)에 기반한 머신러닝을 이용합니다.

1) 데이터의 준비

[Wine Quality Data Set](https://archive.ics.uci.edu/ml/datasets/wine+quality)은 [XGBoost를 이용한 Wine Quality](https://github.com/kyopark2014/ML-Algorithms/tree/main/kaggle/xgboost-wine-quality)에서 [xgboost-wine-quality-EDA.ipynb](https://github.com/kyopark2014/ML-Algorithms/blob/main/kaggle/xgboost-wine-quality/xgboost-wine-quality-EDA.ipynb)을 통해 [특성공학(Feature Engineering)](https://github.com/kyopark2014/ML-Algorithms/blob/main/feature-enginnering.md)을 적용하여, [wine_concat.csv](https://github.com/kyopark2014/ML-Algorithms/blob/main/kaggle/xgboost-wine-quality/data/wine_concat.csv)로 변환됩니다.

2) XGBoost 알고리즘 최적화

[xgboost-wine-quality.ipynb](https://github.com/kyopark2014/ML-Algorithms/blob/main/kaggle/xgboost-wine-quality/xgboost-wine-quality.ipynb)은 [XGBoost](https://github.com/kyopark2014/ML-Algorithms/blob/main/xgboost.md)을 이용해 [회귀(Regression)](https://github.com/kyopark2014/ML-Algorithms/blob/main/regression.md)을 수행하는데, [HPO](https://github.com/kyopark2014/ML-Algorithms/blob/main/hyperparameter-optimization.md)을 통해 Hyperparamter를 최적화 합니다. 

3) Training

[Wine Quality (Regression)](https://github.com/kyopark2014/ML-Algorithms/blob/main/regression.md)에서는 jupyter notebook으로 작성된 XGBoost 알고리즘을 [xgboost-wine-quality.py](https://github.com/kyopark2014/ML-xgboost/blob/main/wine-quality/src/xgboost-wine-quality.py)와 같이 Python 코드로 변환한 후에, 학습(Training)을 수행합니다. 학습의 결과로 얻어진 모델은 [xgboost_wine_quality.json](https://github.com/kyopark2014/ML-xgboost/blob/main/wine-quality/src/xgboost_wine_quality.json)와 같이 저장됩니다. 

4) Inference

학습된 모델을 이용하여 [inference.py](https://github.com/kyopark2014/ML-xgboost/blob/main/wine-quality/src/inference.py)와 같이, 추론(Inference)을 수행할 수 있습니다.


## Lambda를 이용한 추론(Inference) 시스템 구성

[inference.py](https://github.com/kyopark2014/ML-xgboost/blob/main/wine-quality/src/inference.py)에서는 기학습된 XGBoost 모델인 [xgboost_wine_quality.json](https://github.com/kyopark2014/ML-xgboost/blob/main/wine-quality/src/xgboost_wine_quality.json)을 이용하여 추론을 수행할 수 있습니다. 이를 Docker를 이용해 Lambda에서 실행하기 위해서는 아래와 같이 Dockerfile을 생성하여야 합니다. 

#### Dockerfile

[Dockerfile](https://github.com/kyopark2014/lambda-with-ML-container/blob/main/src/Dockerfile)은 아래와 같이 AWS Lambda와 Python 3.8 위하여 AWS에서 제공하는 이미지를 활용합니다. 먼저 pip, joblib, scikit-learn등 필수 라이브러리를 설치하고, directory를 지정하고, 필요한 파일들을 복사합니다. 또한 [requirements.txt](https://github.com/kyopark2014/lambda-with-ML-container/blob/main/src/requirements.txt)에 따라 필요한 라이브러리를 버전에 맞추어 설치합니다. 여기서는 [inference.py](https://github.com/kyopark2014/lambda-with-ML-container/blob/main/src/inference.py)의 handler()를 이용해 추론(inference)를 수행합니다. 이때 사용하는 모델은 [Wine Quality (Regression)](https://github.com/kyopark2014/ML-xgboost/tree/main/wine-quality)에서 학습시킨 [xgboost_wine_quality.json](https://github.com/kyopark2014/lambda-with-ML-container/blob/main/src/xgboost_wine_quality.json)입니다. 

```java
FROM amazon/aws-lambda-python:3.8

RUN /var/lang/bin/python3.8 -m pip install --upgrade pip
RUN /var/lang/bin/python3.8 -m pip install joblib
RUN /var/lang/bin/python3.8 -m pip install scikit-learn

WORKDIR /var/task/lambda-with-ML-container

COPY inference.py /var/task/
COPY . .

RUN pip install -r requirements.txt

CMD ["inference.handler"]
```

Dockerfile로 Docker image를 생성한 후에 Lambda에서 해당 이미지를 로드하여 추론을 수행합니다. [AWS CDK](https://github.com/kyopark2014/technical-summary/blob/main/cdk-introduction.md)는 대표적인 IaC(Infrastructure as Code) 툴로서, Docker Image를 빌드하고 [Amazon ECR](https://aws.amazon.com/ko/ecr/)에 업로드한 후 Lambda에서 활용할 수 있습니다. 또한, Lambda를 생성된 추론용 API를 외부에서 접속할 수 있도록 [Lambda Functional URL](https://github.com/kyopark2014/lambda-function-url)을 활용합니다.

[AWS CDK로 머신러닝 추론을 위한 Lambda Functional URL 구현하기](https://github.com/kyopark2014/lambda-with-ML-container/tree/main/cdk-ml-lambda)에서는 CDK를 이용하여 인프라의 설치 및 삭제를 수행하는 과정을 설명하고 있습니다. 



## 클라이언트에서 추론 요청

아래와 같이 Node.JS를 이용한 클라이언트와 Postman에서 생성된 인프라의 추론 동작을 확인할 수 있습니다. [Endpoint 주소](https://github.com/kyopark2014/lambda-with-ML-container/tree/main/cdk-ml-lambda#endpoint-address)는 CDK로 인프라 생성할때 확인 할 수 있지만, Lambda Console 메뉴의 "Function URL"에서도 확인 가능합니다. 또한 테스트용 셈플은 [samples.json](https://github.com/kyopark2014/lambda-with-ML-container/blob/main/src/samples.json)을 이용합니다. 

### Node 사용시

아래와 같이 node.js를 이용해서 client에서 추론 API를 시험할 수 있습니다. 이 [클라이언트](https://github.com/kyopark2014/lambda-function-url/tree/main/client)는 AWS SDK에서 제공하는 [temporary Security Credential](https://github.com/kyopark2014/aws-security-token-service)을 이용하여 안전하게 IAM 인증을 하고 있습니다. 

```java
cd client
node client.js
```

[client.js](https://github.com/kyopark2014/lambda-with-ML-container/blob/main/client/client.js)에서 아래 값이 Lambda functional url의 [Endpoint](https://github.com/kyopark2014/lambda-with-ML-container/tree/main/cdk-ml-lambda#endpoint-address)와 Role ARN을 입력하여야 합니다. 

```java
const domain = 'samplet4zi2bqfx6k42fo26agi0kcght.lambda-url.ap-northeast-2.on.aws';
const roleArn = 'arn:aws:iam::1234567890:role/CdkMlLambdaStack-fnUrlRoleF3FB2EB9-1H0ZW8VRW5AM3';
```

### Postman 사용시 


아래와 같이 POST method로 [Endpoint 주소](https://github.com/kyopark2014/lambda-with-ML-container/tree/main/cdk-ml-lambda#endpoint-address)를 넣어주고, Body에 raw포맷으로 [samples.json](https://github.com/kyopark2014/lambda-with-ML-container/blob/main/src/samples.json)을 입력한후 [Send]를 선택합니다. 

![image](https://user-images.githubusercontent.com/52392004/200112042-6e2fd684-706d-4e72-8481-688355d6003e.png)

현재 Lambda Function URL이 IAM인증을 사용하고 있으므로, 아래와 같이 AccessKey, SecretKey와 Region 및 Service Name을 설정합니다. 

![image](https://user-images.githubusercontent.com/52392004/200112129-79827440-fa33-4278-83bb-f95cbfcca247.png)



## Image Debugging

Docker 이미지의 설치 라이브러리가 학습 환경과 다른 경우에 정상적으로 동작하지 않을수 있습니다. 이를 로그를 통해 확인할 수 있지만, 아래와 같이 docker 이미지로 직접 들어가서 동작을 확인할 수 있습니다. 

Docker 소스로 이동하여 이미지를 빌드합니다. 

```java
cd src
docker build -t inference:v1 .
```

빌드된 이미지를 확인합니다. 

```java
docker images
```

Docker를 실행합니다. 
```java
docker run -d -p 8080:8080 inference:v1
```


Docker의 실행된 container 정보를 확인합니다. 

```java
docker ps
```

아래와 같이 Container ID를 확인 할 수 있습니다. 

```java
CONTAINER ID   IMAGE          COMMAND                  CREATED         STATUS         PORTS                    NAMES
41e297948511   inference:v1   "/lambda-entrypoint.…"   6 seconds ago   Up 4 seconds   0.0.0.0:8080->8080/tcp   stupefied_carson
```

아래와 같이 Bash shell로 접속합니다. 

```java
docker exec -it  41e297948511 /bin/bash
```

아래와 같이 "python3 inference-test.py"를 입력하여 정상적으로 동작하는지 확인합니다. 

```java
bash-4.2# python3 inference-test.py
np version:  1.23.4
pandas version:  1.5.1
xgb version:  1.6.2
event:  {'body': '[{"fixed acidity":6.6,"volatile acidity":0.24,"citric acid":0.28,"residual sugar":1.8,"chlorides":0.028,"free sulfur dioxide":39,"total sulfur dioxide":132,"density":0.99182,"pH":3.34,"sulphates":0.46,"alcohol":11.4,"color_red":0,"color_white":1},{"fixed acidity":8.7,"volatile acidity":0.78,"citric acid":0.51,"residual sugar":1.7,"chlorides":0.415,"free sulfur dioxide":12,"total sulfur dioxide":66,"density":0.99623,"pH":3.0,"sulphates":1.17,"alcohol":9.2,"color_red":1,"color_white":0}]'}
body:  [{"fixed acidity":6.6,"volatile acidity":0.24,"citric acid":0.28,"residual sugar":1.8,"chlorides":0.028,"free sulfur dioxide":39,"total sulfur dioxide":132,"density":0.99182,"pH":3.34,"sulphates":0.46,"alcohol":11.4,"color_red":0,"color_white":1},{"fixed acidity":8.7,"volatile acidity":0.78,"citric acid":0.51,"residual sugar":1.7,"chlorides":0.415,"free sulfur dioxide":12,"total sulfur dioxide":66,"density":0.99623,"pH":3.0,"sulphates":1.17,"alcohol":9.2,"color_red":1,"color_white":0}]

values:     fixed acidity  volatile acidity  citric acid  residual sugar  chlorides  ...    pH  sulphates  alcohol  color_red  color_white
0            6.6              0.24         0.28             1.8      0.028  ...  3.34       0.46     11.4          0            1
1            8.7              0.78         0.51             1.7      0.415  ...  3.00       1.17      9.2          1            0

[2 rows x 13 columns]
result: [6.573914 4.869721]
200
[6.573914051055908, 4.869720935821533]
Elapsed time: 0.25s
```

## Reference 

[How do I use container images with Lambda?](https://aws.amazon.com/ko/premiumsupport/knowledge-center/lambda-container-images/)

[AWS Lambda의 새로운 기능 — 컨테이너 이미지 지원](https://aws.amazon.com/ko/blogs/korea/new-for-aws-lambda-container-image-support/)

[class DockerImageFunction (construct)](https://docs.aws.amazon.com/cdk/api/v1/docs/@aws-cdk_aws-lambda.DockerImageFunction.html)

[AWS CDK: Deploy Lambda with Docker](https://sbstjn.com/blog/aws-cdk-lambda-docker-container-example/)
