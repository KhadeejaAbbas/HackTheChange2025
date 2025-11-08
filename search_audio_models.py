#!/usr/bin/env python3
"""
Search for speech/audio models in AWS Bedrock
"""
import boto3
import json
import os
from dotenv import load_dotenv
from botocore.exceptions import ClientError

# Load environment variables from backend/.env file
load_dotenv('backend/.env')

def search_audio_models():
    """Search for audio/speech related models in Bedrock"""
    
    print("🔍 Searching for Audio/Speech Models in AWS Bedrock...")
    print("=" * 60)
    
    try:
        bedrock = boto3.client('bedrock', region_name='us-east-1')
        response = bedrock.list_foundation_models()
        models = response.get('modelSummaries', [])
        
        print(f"📋 Total models found: {len(models)}")
        print("-" * 60)
        
        # Search for audio-related models
        audio_models = []
        speech_keywords = ['whisper', 'speech', 'audio', 'voice', 'transcribe', 'tts', 'sound']
        
        for model in models:
            model_name = model.get('modelName', '').lower()
            model_id = model.get('modelId', '').lower()
            provider = model.get('providerName', '').lower()
            input_modalities = [m.lower() for m in model.get('inputModalities', [])]
            output_modalities = [m.lower() for m in model.get('outputModalities', [])]
            
            # Check if any speech-related keywords match
            is_audio_related = any(keyword in model_name or keyword in model_id or keyword in provider 
                                 for keyword in speech_keywords)
            
            # Check if it handles audio modalities
            handles_audio = 'audio' in input_modalities or 'audio' in output_modalities
            
            if is_audio_related or handles_audio:
                audio_models.append(model)
        
        if audio_models:
            print(f"🎵 Found {len(audio_models)} potentially audio-related models:")
            print("-" * 60)
            
            for i, model in enumerate(audio_models, 1):
                print(f"{i}. {model['modelName']} ({model['modelId']})")
                print(f"   Provider: {model.get('providerName', 'Unknown')}")
                print(f"   Input: {model.get('inputModalities', [])}")
                print(f"   Output: {model.get('outputModalities', [])}")
                print(f"   Status: {model.get('modelLifecycle', {}).get('status', 'Unknown')}")
                print("-" * 40)
        else:
            print("❌ No audio-specific models found in Bedrock")
            
        # Check for models with specific modalities
        print("\n🔍 Models by Modality:")
        print("-" * 60)
        
        modality_counts = {}
        for model in models:
            for modality in model.get('inputModalities', []) + model.get('outputModalities', []):
                modality_counts[modality] = modality_counts.get(modality, 0) + 1
        
        for modality, count in sorted(modality_counts.items()):
            print(f"   {modality}: {count} models")
            
        print(f"\n📝 Summary:")
        print(f"   • Bedrock primarily focuses on text and image models")
        print(f"   • No dedicated speech-to-text (Whisper-like) models found")
        print(f"   • For speech-to-text, use AWS Transcribe service instead")
        print(f"   • For text-to-speech, use AWS Polly service instead")
        print(f"   • Bedrock is for generative AI (LLMs, image gen, embeddings)")
        
    except ClientError as e:
        print(f"❌ Error: {e}")
    except Exception as e:
        print(f"❌ Unexpected error: {e}")

if __name__ == "__main__":
    search_audio_models()