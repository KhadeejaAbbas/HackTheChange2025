#!/usr/bin/env python3
"""
AWS Transcribe Example - Speech to Text
"""
import boto3
import json
import time
import os
from dotenv import load_dotenv
from botocore.exceptions import ClientError

# Load environment variables from backend/.env file
load_dotenv('backend/.env')


def transcribe_audio_file(audio_file_path, job_name=None):
    """
    Transcribe an audio file using AWS Transcribe
    """

    if not job_name:
        job_name = f"transcribe-job-{int(time.time())}"

    print("🎤 AWS Transcribe - Speech to Text")
    print("=" * 50)
    print(f"Audio file: {audio_file_path}")
    print(f"Job name: {job_name}")
    print("-" * 50)

    try:
        # Create Transcribe client
        transcribe = boto3.client('transcribe', region_name='us-east-1')
        s3 = boto3.client('s3', region_name='us-east-1')

        # Create S3 bucket name (must be globally unique)
        bucket_name = f"transcribe-bucket-{int(time.time())}"
        s3_key = f"audio/{os.path.basename(audio_file_path)}"

        print("📤 Step 1: Uploading audio to S3...")

        # Create S3 bucket
        try:
            s3.create_bucket(Bucket=bucket_name)
            print(f"   ✅ Created S3 bucket: {bucket_name}")
        except ClientError as e:
            if e.response['Error']['Code'] == 'BucketAlreadyExists':
                print(f"   ℹ️  Bucket {bucket_name} already exists")
            else:
                raise

        # Upload audio file to S3
        s3.upload_file(audio_file_path, bucket_name, s3_key)
        s3_uri = f"s3://{bucket_name}/{s3_key}"
        print(f"   ✅ Uploaded to: {s3_uri}")

        print("\n🔄 Step 2: Starting transcription job...")

        # Start transcription job
        response = transcribe.start_transcription_job(
            TranscriptionJobName=job_name,
            Media={'MediaFileUri': s3_uri},
            # mp3, wav, etc.
            MediaFormat=audio_file_path.split('.')[-1].lower(),
            LanguageCode='en-US'  # or auto-detect with IdentifyLanguage=True
        )

        print(f"   ✅ Job started: {job_name}")
        print("   ⏳ Waiting for completion...")

        # Wait for job completion
        while True:
            status = transcribe.get_transcription_job(
                TranscriptionJobName=job_name)
            job_status = status['TranscriptionJob']['TranscriptionJobStatus']

            if job_status == 'COMPLETED':
                print("   ✅ Transcription completed!")

                # Get the results
                transcript_uri = status['TranscriptionJob']['Transcript']['TranscriptFileUri']
                print(f"\n📝 Step 3: Retrieving results from: {transcript_uri}")

                # Download and parse results
                import urllib.request
                with urllib.request.urlopen(transcript_uri) as response:
                    result = json.loads(response.read().decode())

                transcript = result['results']['transcripts'][0]['transcript']
                confidence = result['results']['items'][0].get('alternatives', [{}])[
                    0].get('confidence', 'N/A')

                print("\n🎯 TRANSCRIPTION RESULT:")
                print("-" * 50)
                print(f"Text: {transcript}")
                print(f"Confidence: {confidence}")

                # Clean up S3 resources
                print(f"\n🧹 Cleaning up...")
                try:
                    s3.delete_object(Bucket=bucket_name, Key=s3_key)
                    s3.delete_bucket(Bucket=bucket_name)
                    print("   ✅ Cleaned up S3 resources")
                except Exception as e:
                    print(f"   ⚠️  Cleanup warning: {e}")

                return transcript

            elif job_status == 'FAILED':
                failure_reason = status['TranscriptionJob'].get(
                    'FailureReason', 'Unknown')
                print(f"   ❌ Transcription failed: {failure_reason}")
                return None

            else:
                print(f"   ⏳ Status: {job_status}")
                time.sleep(5)

    except ClientError as e:
        error_code = e.response['Error']['Code']
        error_message = e.response['Error']['Message']
        print(f"❌ AWS Error ({error_code}): {error_message}")

        if error_code == 'AccessDenied':
            print("💡 Solution: Add Transcribe permissions to your IAM user")
        elif error_code == 'InvalidParameterValue':
            print("💡 Solution: Check audio file format and S3 URI")

        return None

    except Exception as e:
        print(f"❌ Error: {e}")
        return None


def transcribe_realtime_demo():
    """
    Show how to do real-time transcription (streaming)
    """
    print("\n🔴 Real-time Transcription (Advanced)")
    print("=" * 50)
    print("For real-time transcription, you would use:")
    print("• AWS Transcribe Streaming")
    print("• WebSocket connection")
    print("• Requires more complex setup")
    print("\nExample use case:")
    print("• Live audio from microphone")
    print("• Phone call transcription")
    print("• Real-time subtitles")


def compare_transcription_services():
    """
    Compare different transcription options
    """
    print("\n📊 Transcription Service Comparison")
    print("=" * 50)

    services = [
        {
            "Service": "OpenAI Whisper",
            "Pros": ["Very accurate", "Multiple languages", "Simple API", "Works with your current setup"],
            "Cons": ["Costs per minute", "Requires internet", "API rate limits"],
            "Best for": "Your current backend/.env setup ✅"
        },
        {
            "Service": "AWS Transcribe",
            "Pros": ["AWS integrated", "Real-time option", "Custom vocabulary", "Speaker identification"],
            "Cons": ["Requires S3 upload", "More setup", "AWS-specific"],
            "Best for": "Large scale, AWS-native apps"
        },
        {
            "Service": "Local Whisper",
            "Pros": ["No internet needed", "Free", "Private", "Fast"],
            "Cons": ["Requires local setup", "GPU recommended", "Model downloads"],
            "Best for": "Privacy-critical apps"
        }
    ]

    for service in services:
        print(f"\n🔧 {service['Service']}:")
        print(f"   ✅ Pros: {', '.join(service['Pros'])}")
        print(f"   ❌ Cons: {', '.join(service['Cons'])}")
        print(f"   🎯 Best for: {service['Best for']}")


if __name__ == "__main__":
    print("🎤 AWS Transcription Guide")
    print("=" * 60)

    # Check for audio files
    audio_files = []
    for file in os.listdir('.'):
        if file.lower().endswith(('.mp3', '.wav', '.m4a', '.ogg')):
            audio_files.append(file)

    if audio_files:
        print(f"📁 Found audio files: {', '.join(audio_files)}")
        print("\n💡 To transcribe, uncomment the line below and run:")
        print(f"# transcribe_audio_file('{audio_files[0]}')")
        print(
            "\n⚠️  Note: AWS Transcribe requires S3 upload and additional IAM permissions")
    else:
        print("📁 No audio files found in current directory")
        print("💡 Add an audio file (.mp3, .wav, .m4a, .ogg) to test transcription")

    # Show comparison
    compare_transcription_services()

    print(f"\n🎯 RECOMMENDATION FOR YOUR PROJECT:")
    print("=" * 60)
    print("✅ Keep using OpenAI Whisper in your backend/text_to_speech.py")
    print("✅ It's already working with your .env setup")
    print("✅ Simpler than AWS Transcribe for your use case")
    print("✅ Just ensure your audio file is in the backend/ directory")

    transcribe_realtime_demo()
