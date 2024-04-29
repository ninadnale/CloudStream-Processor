import { EC2Client, RunInstancesCommand, TerminateInstancesCommand } from "@aws-sdk/client-ec2"; // ES Modules import
import { DynamoDBClient, GetItemCommand, PutItemCommand } from "@aws-sdk/client-dynamodb"; // ES Modules import


export const handler = async (event) => {
  
const client = new EC2Client({region : "us-west-1"});

const params = {
  ImageId: 'ami-0320e07e7e29448d5',
  InstanceType: 't2.micro',
  KeyName: 'lambda-instace-key',
  MinCount: 1,
  MaxCount: 1,
  IamInstanceProfile: { // IamInstanceProfileSpecification
    Name: "demo_ec2",
  },
  SecurityGroups: [ // SecurityGroupStringList
    "Fovus-Security-Group",
  ],
};

let dbclient;
let response;
let command;
const instanceInfoParams = {
  TableName: "instance-audit"
};
let auditRecordType;
let inputRecord;

// console.log(event);
console.log(event);
let element = event.Records[0];
console.log(element);

if(element.eventName.toLowerCase() == 'insert'){
            //code to spin up instance
            dbclient = new DynamoDBClient({region : "us-west-1"});
            auditRecordType = "Running";
            inputRecord = element.dynamodb.NewImage;
            
            var userData= `#!/bin/bash
            pip install boto3
            aws s3 cp s3://fovus-april/modify_file.py ./
            python3 modify_file.py ${inputRecord.id.S} ${inputRecord.input_text.S} ${inputRecord.input_file_path.S}
            `
            console.log(userData);
            var UserData = new Buffer(userData).toString('base64');
            
            command = new RunInstancesCommand(
            {...params,UserData});
            console.log({...params,UserData});
            
            
        } else if(element.eventName.toLowerCase() == 'modify'){
            console.log("Got Modify Request!!!")
            dbclient = new DynamoDBClient({region : "us-west-1"});
            auditRecordType = "Terminated";
            let getCmdParams = instanceInfoParams;
            
            inputRecord = element.dynamodb.NewImage;
            
            console.log(inputRecord);
            
            /// get row from dynamo and create instance_id variable
            getCmdParams.Key = {
                id : {
                  "S" : inputRecord.id.S
                }
              };
              
            console.log(getCmdParams);
            
            response = await dbclient.send(new GetItemCommand(getCmdParams));
            
            let deleteInstanceParams = {
                  InstanceIds: [ 
                  response.Item.instance_id.S
                ]
            };

            command = new TerminateInstancesCommand(deleteInstanceParams);
        }
        
// if(command)
response = await client.send(command);
console.log(response);
let putCmdParams = instanceInfoParams;
if(auditRecordType === "Running"){
  putCmdParams.Item = {
  id : {
    "S" : inputRecord.id.S
  },
  instance_id: {
    "S" : response.Instances[0].InstanceId
  },
  status: {
    "S" : auditRecordType
  }
};
}
else {
  putCmdParams.Item = {
  id : {
    "S" : inputRecord.id.S
  },
  instance_id: {
    "S" : response.TerminatingInstances[0].InstanceId
  },
  status: {
    "S" : auditRecordType
  }
};

}

console.log(await dbclient.send(new PutItemCommand(putCmdParams)));

return response;


};
