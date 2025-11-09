#!/usr/bin/env python3
"""
S3 file storage utility
"""

import boto3
import json
import os
from datetime import datetime
from dotenv import load_dotenv
from botocore.exceptions import ClientError

load_dotenv('.env')


class S3Storage:
    def __init__(self, bucket_name=None):
        self.s3_client = boto3.client('s3')
        self.bucket_name = bucket_name or f"storage-{int(datetime.now().timestamp())}"

    def create_bucket(self):
        """Create S3 bucket if it doesn't exist"""
        try:
            self.s3_client.head_bucket(Bucket=self.bucket_name)
        except ClientError:
            try:
                self.s3_client.create_bucket(Bucket=self.bucket_name)
            except ClientError:
                # If bucket name taken, use timestamped version
                timestamp = int(datetime.now().timestamp())
                self.bucket_name = f"storage-{timestamp}"
                self.s3_client.create_bucket(Bucket=self.bucket_name)

    def upload_file(self, local_file_path, s3_key=None):
        """Upload a file to S3"""
        if not os.path.exists(local_file_path):
            raise FileNotFoundError(f"Local file not found: {local_file_path}")

        if not s3_key:
            s3_key = os.path.basename(local_file_path)

        self.create_bucket()

        try:
            self.s3_client.upload_file(
                local_file_path, self.bucket_name, s3_key)
            return f"https://{self.bucket_name}.s3.amazonaws.com/{s3_key}"
        except ClientError as e:
            raise Exception(f"Upload failed: {e}")

    def upload_text(self, text_content, s3_key):
        """Upload text content to S3"""
        self.create_bucket()

        self.s3_client.put_object(
            Bucket=self.bucket_name,
            Key=s3_key,
            Body=text_content.encode('utf-8'),
            ContentType='text/plain'
        )

        return f"https://{self.bucket_name}.s3.amazonaws.com/{s3_key}"

    def upload_json(self, data, s3_key):
        """Upload JSON data to S3"""
        self.create_bucket()

        json_content = json.dumps(data, indent=2)

        self.s3_client.put_object(
            Bucket=self.bucket_name,
            Key=s3_key,
            Body=json_content.encode('utf-8'),
            ContentType='application/json'
        )

        return f"https://{self.bucket_name}.s3.amazonaws.com/{s3_key}"

    def get_object(self, s3_key):
        """Retrieve content from S3"""
        try:
            response = self.s3_client.get_object(
                Bucket=self.bucket_name, Key=s3_key)
            return response['Body'].read().decode('utf-8')
        except ClientError:
            return None

    def list_objects(self):
        """List all objects in the bucket"""
        try:
            response = self.s3_client.list_objects_v2(Bucket=self.bucket_name)
            return response.get('Contents', [])
        except Exception:
            return []

    def delete_object(self, s3_key):
        """Delete an object from S3"""
        self.s3_client.delete_object(Bucket=self.bucket_name, Key=s3_key)

    def delete_bucket(self):
        """Delete the entire bucket and all its contents"""
        # Delete all objects first
        objects = self.list_objects()
        for obj in objects:
            self.delete_object(obj['Key'])

        # Delete bucket
        self.s3_client.delete_bucket(Bucket=self.bucket_name)


def main():
    """Test S3 storage"""
    storage = S3Storage()

    # Test text upload
    url = storage.upload_text("Test content", "test.txt")
    print(f"Uploaded text: {url}")

    # Clean up
    storage.delete_bucket()


if __name__ == "__main__":
    main()
