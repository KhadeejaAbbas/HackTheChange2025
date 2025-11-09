#!/usr/bin/env python3
"""
Main application - Audio transcription and storage workflow with translation support
"""

import os
import sys
import argparse
from datetime import datetime
from transcription import TranscriptionService
from s3_storage import S3Storage
from translation import AWSTranslationService

def process_audio_file(audio_file_path, save_to_s3=True, translate_languages=None):
    """
    Complete workflow: transcribe audio, translate if requested, and optionally save to S3
    
    Args:
        audio_file_path (str): Path to audio file
        save_to_s3 (bool): Whether to save results to S3
        translate_languages (list): List of language codes to translate to
    
    Returns:
        dict: Results with transcript, translations, and metadata
    """
    
    print(f"Processing: {audio_file_path}")
    
    # Step 1: Transcribe audio using AWS
    service = TranscriptionService()
    transcript = service.transcribe(audio_file_path)
    
    # Step 2: Translate if requested
    translations = {}
    detected_language = None
    
    if translate_languages:
        try:
            translator = AWSTranslationService()
            
            # Detect source language
            detection_result = translator.detect_language(transcript)
            detected_language = {
                "code": detection_result["language_code"],
                "confidence": detection_result["confidence"]
            }
            print(f"Detected language: {detected_language['code']} (confidence: {detected_language['confidence']:.2f})")
            
            # Perform translations
            print(f"Translating to {len(translate_languages)} languages...")
            multi_translations = translator.translate_to_multiple_languages(transcript, translate_languages)
            
            for lang_code, translation_result in multi_translations.items():
                if 'error' not in translation_result:
                    translations[lang_code] = translation_result['translated_text']
                    print(f"Translated to {lang_code}: {translation_result['translated_text'][:100]}...")
                else:
                    print(f"Translation to {lang_code} failed: {translation_result['error']}")
                    
        except Exception as e:
            print(f"Translation error: {e}")
    
    # Step 3: Prepare results
    results = {
        "transcript": transcript,
        "translations": translations,
        "detected_language": detected_language,
        "metadata": {
            "original_file": audio_file_path,
            "transcription_method": "aws",
            "translation_languages": translate_languages or [],
            "timestamp": datetime.now().isoformat(),
            "word_count": len(transcript.split()),
            "character_count": len(transcript)
        }
    }
    
    # Step 4: Save to S3 if requested
    if save_to_s3:
        storage = S3Storage("hackthechange-transcripts")
        
        base_name = os.path.splitext(os.path.basename(audio_file_path))[0]
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        
        # Save transcript as text
        txt_key = f"transcripts/{base_name}_{timestamp}.txt"
        txt_url = storage.upload_text(transcript, txt_key)
        
        # Save translations as separate files
        translation_urls = {}
        for lang_code, translated_text in translations.items():
            trans_key = f"translations/{base_name}_{timestamp}_{lang_code}.txt"
            trans_url = storage.upload_text(translated_text, trans_key)
            translation_urls[lang_code] = trans_url
            print(f"Saved {lang_code} translation to S3: {trans_url}")
        
        # Save only text files (transcript + translations). Do not upload JSON.
        results["storage"] = {
            "text_url": txt_url,
            "translation_urls": translation_urls,
        }

        print(f"Saved transcript to S3 (txt): {txt_url}")
    
    print(f"Transcript: {transcript}")
    return results

def main():
    """Main entry point with argument parsing"""
    parser = argparse.ArgumentParser(description="Audio transcription and translation service")
    parser.add_argument("audio_file", help="Path to audio file")
    parser.add_argument("--no-s3", action="store_true", help="Skip saving to S3")
    parser.add_argument("--translate", nargs="+", metavar="LANG", 
                       help="Translate to specified languages (e.g., --translate es fr de)")
    parser.add_argument("--list-languages", action="store_true", 
                       help="List supported translation languages")
    
    args = parser.parse_args()
    
    # List supported languages
    if args.list_languages:
        try:
            translator = AWSTranslationService()
            supported = translator.get_supported_languages()
            print("Supported translation languages:")
            print(", ".join(supported['source_languages']))
            return
        except Exception as e:
            print(f"Error retrieving supported languages: {e}")
            return
    
    # Validate audio file
    if not os.path.exists(args.audio_file):
        print(f"File not found: {args.audio_file}")
        return
    
    try:
        results = process_audio_file(
            args.audio_file, 
            save_to_s3=not args.no_s3,
            translate_languages=args.translate
        )
        print("Processing complete")
        
        # Print summary
        if args.translate and results.get('translations'):
            print(f"\nTranslations completed for {len(results['translations'])} languages")
            
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    main()