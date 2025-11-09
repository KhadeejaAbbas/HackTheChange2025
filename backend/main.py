#!/usr/bin/env python3
"""
Main application - Audio transcription and storage workflow
"""

import os
import sys
from datetime import datetime
from transcription import TranscriptionService
from s3_storage import S3Storage

def process_audio_file(audio_file_path, save_to_s3=True):
    """
    Complete workflow: transcribe audio and optionally save to S3
    
    Args:
        audio_file_path (str): Path to audio file
        save_to_s3 (bool): Whether to save results to S3
    
    Returns:
        dict: Results with transcript and metadata
    """
    
    print(f"Processing: {audio_file_path}")
    
    # Step 1: Transcribe audio using AWS
    service = TranscriptionService()
    transcript = service.transcribe(audio_file_path)
    
    # Step 2: Prepare results
    results = {
        "transcript": transcript,
        "metadata": {
            "original_file": audio_file_path,
            "transcription_method": "aws",
            "timestamp": datetime.now().isoformat(),
            "word_count": len(transcript.split()),
            "character_count": len(transcript)
        }
    }
    
    # Step 3: Save to S3 if requested
    if save_to_s3:
        storage = S3Storage("hackthechange-transcripts")
        
        base_name = os.path.splitext(os.path.basename(audio_file_path))[0]
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        
        # Save transcript as text
        txt_key = f"transcripts/{base_name}_{timestamp}.txt"
        txt_url = storage.upload_text(transcript, txt_key)
        
        # Save full results as JSON
        json_key = f"transcripts/{base_name}_{timestamp}.json"
        json_url = storage.upload_json(results, json_key)
        
        results["storage"] = {
            "text_url": txt_url,
            "json_url": json_url
        }
        
        print(f"Saved to S3: {txt_url}")
    
    print(f"Transcript: {transcript}")
    return results

def main():
    """Main entry point"""
    if len(sys.argv) < 2:
        print("Usage: python main.py <audio_file_path>")
        return
    
    audio_file = sys.argv[1]
    
    if not os.path.exists(audio_file):
        print(f"File not found: {audio_file}")
        return
    
    try:
        results = process_audio_file(audio_file, save_to_s3=True)
        print("Processing complete")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    main()