#!/usr/bin/env python3
"""
Test OpenAI Whisper transcription with backend/samplevoice.mp3
"""
import os
import sys
from dotenv import load_dotenv
from openai import OpenAI

def test_transcription():
    """Test transcription with the samplevoice.mp3 file"""
    
    print("🎤 OpenAI Whisper Transcription Test")
    print("=" * 50)
    
    # Load environment variables from backend/.env
    load_dotenv('backend/.env')
    
    # Check if OpenAI API key is loaded
    api_key = os.getenv('OPENAI_API_KEY')
    if not api_key:
        print("❌ Error: OPENAI_API_KEY not found in backend/.env")
        print("💡 Please add your OpenAI API key to backend/.env file:")
        print("   OPENAI_API_KEY=your-key-here")
        return False
    
    print(f"✅ OpenAI API Key loaded: {api_key[:10]}...{api_key[-4:]}")
    
    # Check if audio file exists
    audio_file_path = "backend/samplevoice.mp3"
    if not os.path.exists(audio_file_path):
        print(f"❌ Error: Audio file '{audio_file_path}' not found!")
        
        # Check what files are in backend/
        backend_files = []
        if os.path.exists('backend/'):
            backend_files = [f for f in os.listdir('backend/') if f.endswith(('.mp3', '.wav', '.m4a', '.ogg'))]
        
        if backend_files:
            print("📁 Audio files found in backend/:")
            for file in backend_files:
                print(f"   - backend/{file}")
        else:
            print("📁 No audio files found in backend/ directory")
        return False
    
    print(f"✅ Audio file found: {audio_file_path}")
    
    try:
        # Initialize OpenAI client
        client = OpenAI()
        
        print("🔄 Starting transcription...")
        
        # Transcribe the audio
        with open(audio_file_path, "rb") as audio_file:
            transcription = client.audio.transcriptions.create(
                model="whisper-1",
                file=audio_file,
                response_format="text"
            )
        
        print("\n🎯 TRANSCRIPTION RESULT:")
        print("-" * 50)
        print(transcription)
        print("-" * 50)
        print("✅ Transcription completed successfully!")
        
        return True
        
    except Exception as e:
        print(f"❌ Error during transcription: {e}")
        
        if "api_key" in str(e).lower():
            print("💡 API key issue - check your OpenAI API key")
        elif "quota" in str(e).lower():
            print("💡 API quota exceeded - check your OpenAI billing")
        elif "file" in str(e).lower():
            print("💡 File format issue - ensure it's a valid audio file")
        
        return False

if __name__ == "__main__":
    success = test_transcription()
    
    if success:
        print("\n🎉 Test completed successfully!")
        print("💡 Your transcription setup is working!")
    else:
        print("\n❌ Test failed. Please fix the issues above.")
        print("🔧 Common solutions:")
        print("   1. Add OPENAI_API_KEY to backend/.env")
        print("   2. Ensure samplevoice.mp3 is in backend/ directory")
        print("   3. Check your OpenAI API quota/billing")