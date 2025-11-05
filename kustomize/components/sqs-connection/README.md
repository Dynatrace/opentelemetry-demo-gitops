# Component: sqs-connection

> **NOTE:** for the purpose of this config, static aws credentials are assumed to be used, if you use a different form of authorization you will need to adjust this config

This component makes sure you provide the necessary data to establish connection to sqs queue from the **checkout service**. It will create a configmap and a secret which hold the data and link them into the service using env vars.

Provide this data:

- `data.env`
  - **SQS_QUEUE_URL:** the url of the sqs queue where checkout service is supposed to send data to
  - **AWS_REGION:** the region in AWS where the queue is deployed (this is important for sdk and has to be separate from URL)
- `secrets.env`
  - **AWS_ACCESS_KEY_ID**
  - **AWS_SECRET_ACCESS_KEY**
