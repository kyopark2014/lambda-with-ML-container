# lambda base image (python)
FROM amazon/aws-lambda-python:3.8

RUN /var/lang/bin/python3.8 -m pip install --upgrade pip

WORKDIR /var/task/lambda-with-ML-container

COPY ml-xgboost.py /var/task/

COPY . .

RUN pip install -r requirements.txt

CMD ["ml-xgboost.handler"]