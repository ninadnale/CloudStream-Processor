# AWS based File Processing Application

This project is a **full-stack file processing pipeline** built with AWS services, React, and Lambda functions to automate file uploads, processing, and tracking.

## Overview
The application allows users to upload files through a React frontend. Upon file upload, an automated AWS pipeline is triggered to:
1. Process the file in an EC2 instance.
2. Manipulate the file as per predefined rules.
3. Save and update processed files and statuses in AWS S3 and DynamoDB.

## Steps to Deploy

### 1. Setting up the React Application
1. **Navigate to the Frontend Directory**:
   - Locate the code in the `AWS-file-upload` folder and navigate to it.
     ```bash
     cd AWS-file-upload
     ```
2. **Configure Environment Variables**:
   - Add a `.env` file for AWS credentials:
     ```plaintext
     REACT_APP_accessKeyId=YOUR_ACCESS_KEY_ID
     REACT_APP_secretAccessKey=YOUR_SECRET_ACCESS_KEY
     ```
3. **Install Dependencies**:
   ```bash
   npm install


<br/><br/>
# Steps to Deploy:
## - Setting up the React application:
    - You can find the code for the frontend application in the 'AWS-file-upload' folder.
    - cd to 'AWS-file-upload'
    - Add an environment variables file here to setup your access key for the application. Add access key in variable named 'REACT_APP_accessKeyId' and secret key in 'REACT_APP_secretAccessKey'.
    - Run > npm install
      This makes sure that all the dependencies for the react application are installed.
    - Run > npm start
      To start the frontend application.


##

Everything in this project is implemented using the available AWS services within the restrictions mentioned in the problem statement. <br/><br/>
**The main caveat**: was creation and termination of EC2 instance with appropriate triggers. For this, I have implemented a single lambda function which detects the insert and modify events in the file records table in DynamoDB. The insert record event triggers the ec2 instance creation part and once the VM is created, it downloads the required script from S3 bucket. This script(modify_file.py) downloads from S3, the appropriate file that triggered this pipeline. This file is then manipulated to append the input text and the output file is again stored to the same S3 bucket. This script(modify_file.py) also updated the corresponding record in the DynamoDB with output file path, before it finishes execution. This update event triggers the lambda function again, it checks the status of the VM, grabs the instance ID from the 'instance-audit' table and terminates the VM.


##

# References
- https://dev.to/avinash8847/creating-aws-ec2-instance-with-javascript-934
- https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/client/ec2/command/RunInstancesCommand/
- https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/client/ec2/command/TerminateInstancesCommand/
- https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/client/dynamodb/command/GetItemCommand/
- https://www.npmjs.com/package/aws-sdk
- https://flowbite.com/docs/getting-started/introduction/
- https://docs.aws.amazon.com/amplify/latest/userguide/build-settings.html
