import boto3
import sys

def download_file_from_s3(bucket_name, key):
    s3 = boto3.client('s3')
    try:
        s3.download_file(bucket_name, key, key)
    except Exception as e:
        print(f"Error downloading file: {e}")

def append_to_file(input_file_path, text) -> str:
    output_file_name = ""
    try:
        # Read the content of the input file
        with open(input_file_path, 'r') as file:
            file_content = file.read()
        
        # Append the given text
        updated_content = f"{file_content} : {text}"
        
        # Generate the output file name
        output_file_name = input_file_path.split('.')[0] + '_' + text[:3] + '.txt'
        
        # Write the updated content to the output file
        with open(output_file_name, 'w') as file:
            file.write(updated_content)
        
        print(f"Text appended to '{input_file_path}'. Output saved as '{output_file_name}'.")
    except Exception as e:
        print(f"Error: {e}")
    
    return output_file_name

def upload_file_to_s3(bucket_name, file_path, object_key):
    # Create an S3 client
    s3 = boto3.client('s3')
    
    try:
        # Upload the file to S3 bucket
        s3.upload_file(file_path, bucket_name, object_key)
        
        print("File uploaded successfully to S3 bucket")
    except Exception as e:
        print("Error uploading file to S3 bucket:", e)

def update_record(id_value, output_file_path):
    dynamodb = boto3.client('dynamodb', region_name='us-west-1')
    table_name = 'file-record-table'
    
    update_expression = "SET output_file_path = :val"
    expression_attribute_values = {":val": {"S": output_file_path}}
    
    try:
        # Update the item in DynamoDB
        response = dynamodb.update_item(
            TableName=table_name,
            Key={'id': {'S': id_value}},
            UpdateExpression=update_expression,
            ExpressionAttributeValues=expression_attribute_values
        )
        
        print("Record updated successfully.")
        return response
    except Exception as e:
        print(f"Error: {e}")
        return None

def instance_audit_update(id_value, output_file_path):
    dynamodb = boto3.client('dynamodb', region_name='us-west-1')
    table_name = 'file-record-table'
    
    update_expression = "SET output_file_path = :val"
    expression_attribute_values = {":val": {"S": output_file_path}}
    
    try:
        # Update the item in DynamoDB
        response = dynamodb.update_item(
            TableName=table_name,
            Key={'id': {'S': id_value}},
            UpdateExpression=update_expression,
            ExpressionAttributeValues=expression_attribute_values
        )
        
        print("Record updated successfully.")
        return response
    except Exception as e:
        print(f"Error: {e}")
        return None

#Extract arguments from command line
id = sys.argv[1]
text_to_append = sys.argv[2]
file_path = sys.argv[3]

#S3 Bucket details
bucket_name, key = file_path.split('/')
print(bucket_name, key)

#Download files from S3 bucket
download_file_from_s3(bucket_name, key)

#Perform the file operation to generate output file
output_file_name = append_to_file(key, text_to_append)
output_file_path = bucket_name + '/' + output_file_name

#upload file to S3 bucket
upload_file_to_s3(bucket_name, output_file_name, output_file_name)

#update the record in dynamo DB
update_record(id, output_file_path)