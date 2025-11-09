#!/usr/bin/env python3
"""
Audio transcription service supporting both OpenAI Whisper and AWS Transcribe
"""

import os
import json
import time
import uuid
import ssl
import urllib.request
import boto3
from datetime import datetime
from dotenv import load_dotenv
from botocore.exceptions import ClientError

# Disable SSL warnings for AWS Transcribe downloads
ssl._create_default_https_context = ssl._create_unverified_context

load_dotenv('.env')

class TranscriptionService:
    def __init__(self):
        self.s3_client = boto3.client('s3')
        self.transcribe_client = boto3.client('transcribe')
        self.bucket_name = f"transcribe-temp-{uuid.uuid4().hex[:8]}"

    def transcribe_aws(self, audio_file_path):
        """Transcribe using AWS Transcribe"""
        # Upload to S3
        audio_key = f"audio/{os.path.basename(audio_file_path)}"
        try:
            self.s3_client.create_bucket(Bucket=self.bucket_name)
        except ClientError:
            pass
        
        self.s3_client.upload_file(audio_file_path, self.bucket_name, audio_key)
        s3_uri = f"s3://{self.bucket_name}/{audio_key}"
        
        # Start transcription job
        job_name = f"transcription-{int(datetime.now().timestamp())}"
        
        self.transcribe_client.start_transcription_job(
            TranscriptionJobName=job_name,
            Media={'MediaFileUri': s3_uri},
            MediaFormat='mp3',
            LanguageCode='en-US'
        )
        
        # Wait for completion
        while True:
            status = self.transcribe_client.get_transcription_job(
                TranscriptionJobName=job_name
            )
            
            job_status = status['TranscriptionJob']['TranscriptionJobStatus']
            
            if job_status == 'COMPLETED':
                result_uri = status['TranscriptionJob']['Transcript']['TranscriptFileUri']
                
                # Download results with SSL handling
                try:
                    with urllib.request.urlopen(result_uri) as response:
                        transcript_data = json.loads(response.read().decode())
                except ssl.SSLError:
                    ssl_context = ssl.create_default_context()
                    ssl_context.check_hostname = False
                    ssl_context.verify_mode = ssl.CERT_NONE
                    
                    with urllib.request.urlopen(result_uri, context=ssl_context) as response:
                        transcript_data = json.loads(response.read().decode())
                
                self._cleanup_s3()
                return transcript_data['results']['transcripts'][0]['transcript']
                
            elif job_status == 'FAILED':
                self._cleanup_s3()
                raise Exception("Transcription job failed")
            
            time.sleep(5)

    def transcribe(self, audio_file_path):
        """Main transcription method using AWS Transcribe"""
        if not os.path.exists(audio_file_path):
            raise FileNotFoundError(f"Audio file not found: {audio_file_path}")
        
        return self.transcribe_aws(audio_file_path)

    def _cleanup_s3(self):
        """Clean up temporary S3 resources"""
        try:
            # List and delete all objects in bucket
            response = self.s3_client.list_objects_v2(Bucket=self.bucket_name)
            if 'Contents' in response:
                for obj in response['Contents']:
                    self.s3_client.delete_object(Bucket=self.bucket_name, Key=obj['Key'])
            
            # Delete bucket
            self.s3_client.delete_bucket(Bucket=self.bucket_name)
        except Exception:
            pass  # Ignore cleanup errors

def main():
    """Test the transcription service"""
    service = TranscriptionService()
    
    audio_file = "samplevoice.mp3"
    if not os.path.exists(audio_file):
        print(f"Audio file not found: {audio_file}")
        return
    
    try:
        transcript = service.transcribe(audio_file)
        print("Transcript:", transcript)
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    main()