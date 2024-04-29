import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, ScanCommand, PutCommand, GetCommand,} from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({});
const dynamo = DynamoDBDocumentClient.from(client);

const tableName = "fovus-file-table";

export const handler = async (event) => {
  
  let statusCode = 200;
  let body = JSON.stringify('Request received by file-upload lambda!');
  
  // TODO implement
  // console.log("hello");
  // const data = JSON.parse(event);
  const id = event.id;
  const inputText = event.input_text;
  const inputFilePath = event.input_file_path;
//   console.log(inputText);
//   console.log(inputFilePath)
  
  try{
      body = body.Items;
      await dynamo.send(
          new PutCommand({
            TableName: tableName,
            Item: {
              'id': id,
              'input_text': inputText,
              'input_file_path': inputFilePath,
            },
          })
        );
  }catch (err) {
      const statusCode = 400;
      const body = err.message;
  }
  
  const response = {
    statusCode: statusCode,
    body: body,
  };
  return response;
  
};
