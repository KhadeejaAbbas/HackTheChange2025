import boto3
import json

REGION = "us-east-1"   # or your region
MODEL_ID = "amazon.titan-text-lite-v1"   # make sure this is enabled in model access

def main():
    client = boto3.client("bedrock-runtime", region_name=REGION)

    prompt = "Say 'Hello from Amazon Bedrock and Python!' in one sentence."

    body = {
        "inputText": prompt,
        "textGenerationConfig": {
            "maxTokenCount": 100,
            "temperature": 0.2,
            "topP": 0.9
        }
    }

    response = client.invoke_model(
        modelId=MODEL_ID,
        body=json.dumps(body)
    )

    response_body = json.loads(response["body"].read())
    output = response_body["results"][0]["outputText"]

    print("✅ Model response:")
    print(output)

if __name__ == "__main__":
    main()
