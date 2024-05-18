### Please find the deployed app here:  https://main.d3or6sk41cokek.amplifyapp.com/
#

### Please go through the **demo** of the working application here: https://youtu.be/TB20O_CPnfE

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

## - Setting up the AWS stack:
1. Set up an S3 bucket with appropriate access roles, name it 'file-upload-aws-s3-bucket'.

2. Set up a POST request in API Gateway service, provide the url of the POST api in react application in the 'App.js' file

3. Create a lambda function with the latest npm environment to support the javascript SDK v3. Copy the 'upload_file_lambda.js' file from 'aws_lambda_scripts' folder.
    - The lambda function needs to be setup with IAM role with permissions -> ['AmazonDynamoDBFullAccess'].
    - Then set up the trigger of this lambda function as the API Gateway and for this provide the ARN of the POST api that we created in step 2.

4. Create two tables in dynamoDB with names 'file-record-table' and 'instance-audit'. Enable the event stream for first table. 
    [This will help us trigger another lambda function to create an EC2 instance upon entry of a new record in the 'file-record-table']
    [The 'instance-audit' table will help us track the instance ID of the instances that we have created to run the file manipulation script and track their status, so that they can be terminated after the execution is done.]

5. Create another lambda function with latest npm environment so as to support the latest SDK. Copy the 'create_ec2.js' file from 'aws_lambda_scripts' folder.
    - This lambda needs to be setup with IAM role having permissions -> ['AmazonDynamoDBFullAccess', 'AmazonEC2FullAccess', 'IAMFullAccess']
    - In order for this lambda to create a new ec2 VM, we also need a separate access role that needs to set up the new VM.
        - For this, create an IAM role named 'demo_ec2' and provide permissions -> ['AmazonDynamoDBFullAccess', 'AmazonEC2FullAccess', 'AmazonS3FullAccess', 'IAMReadOnlyAccess'].
          These access permissions are required in order for us to run a script inside VM which downloads files from our S3 bucket and updates records in DynamoDB.
    - Then set up the trigger of this lambda function as DynamoDB and for this provide ARN of 'file-record-table' that we created in step 4.

6. Copy the 'modify_file.py' script which is located in 'ec2_file_manipulation', upload it to the S3 bucket we created earlier in step 1.

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
