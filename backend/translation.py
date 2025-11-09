import boto3
import logging
from typing import List, Dict, Any, Optional
from botocore.exceptions import ClientError

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class AWSTranslationService:
    """
    A service class for AWS Translate and Comprehend operations.
    Provides automatic language detection and multi-language translation.
    """
    
    def __init__(self, region_name: str = 'us-east-1'):
        """
        Initialize AWS clients for Translate and Comprehend services.
        
        Args:
            region_name (str): AWS region name
        """
        self.region_name = region_name
        
        try:
            # Initialize AWS clients
            self.translate_client = boto3.client('translate', region_name=region_name)
            self.comprehend_client = boto3.client('comprehend', region_name=region_name)
            logger.info(f"AWS Translation Service initialized in region: {region_name}")
            
        except Exception as e:
            logger.error(f"Failed to initialize AWS clients: {str(e)}")
            raise
    
    def detect_language(self, text: str) -> Dict[str, Any]:
        """
        Detect the language of the input text using AWS Comprehend.
        
        Args:
            text (str): Input text for language detection
            
        Returns:
            Dict containing detected language code and confidence score
        """
        try:
            response = self.comprehend_client.detect_dominant_language(Text=text)
            
            if response['Languages']:
                detected_lang = response['Languages'][0]
                result = {
                    'language_code': detected_lang['LanguageCode'],
                    'confidence': detected_lang['Score'],
                    'all_languages': response['Languages']
                }
                
                logger.info(f"Detected language: {result['language_code']} "
                          f"(confidence: {result['confidence']:.2f})")
                return result
            else:
                logger.warning("No language detected")
                return {'language_code': 'und', 'confidence': 0.0, 'all_languages': []}
                
        except ClientError as e:
            logger.error(f"AWS Comprehend error: {str(e)}")
            raise
        except Exception as e:
            logger.error(f"Language detection failed: {str(e)}")
            raise
    
    def translate_text(self, text: str, target_language: str, source_language: str = None) -> Dict[str, Any]:
        """
        Translate text to target language using AWS Translate.
        
        Args:
            text (str): Text to translate
            target_language (str): Target language code (e.g., 'es', 'fr', 'de')
            source_language (str, optional): Source language code. If None, auto-detected.
            
        Returns:
            Dict containing translated text and metadata
        """
        try:
            # Auto-detect source language if not provided
            if source_language is None:
                detection_result = self.detect_language(text)
                source_language = detection_result['language_code']
                
                # Handle case where language detection fails
                if source_language == 'und':
                    logger.warning("Language detection failed, defaulting to English")
                    source_language = 'en'
            
            # Skip translation if source and target are the same
            if source_language == target_language:
                logger.info(f"Source and target languages are the same ({source_language}), skipping translation")
                return {
                    'translated_text': text,
                    'source_language': source_language,
                    'target_language': target_language,
                    'skipped': True
                }
            
            # Perform translation
            response = self.translate_client.translate_text(
                Text=text,
                SourceLanguageCode=source_language,
                TargetLanguageCode=target_language
            )
            
            result = {
                'translated_text': response['TranslatedText'],
                'source_language': response['SourceLanguageCode'],
                'target_language': response['TargetLanguageCode'],
                'skipped': False
            }
            
            logger.info(f"Translation completed: {source_language} -> {target_language}")
            return result
            
        except ClientError as e:
            error_code = e.response['Error']['Code']
            if error_code == 'UnsupportedLanguagePairException':
                logger.error(f"Unsupported language pair: {source_language} -> {target_language}")
            else:
                logger.error(f"AWS Translate error ({error_code}): {str(e)}")
            raise
        except Exception as e:
            logger.error(f"Translation failed: {str(e)}")
            raise
    
    def translate_to_multiple_languages(self, text: str, target_languages: List[str], 
                                      source_language: str = None) -> Dict[str, Dict[str, Any]]:
        """
        Translate text to multiple target languages.
        
        Args:
            text (str): Text to translate
            target_languages (List[str]): List of target language codes
            source_language (str, optional): Source language code. If None, auto-detected.
            
        Returns:
            Dict mapping target language codes to translation results
        """
        translations = {}
        
        # Detect source language once if not provided
        if source_language is None:
            detection_result = self.detect_language(text)
            source_language = detection_result['language_code']
            
            if source_language == 'und':
                logger.warning("Language detection failed, defaulting to English")
                source_language = 'en'
        
        logger.info(f"Starting multi-language translation from {source_language} to {len(target_languages)} languages")
        
        for target_lang in target_languages:
            try:
                translation_result = self.translate_text(text, target_lang, source_language)
                translations[target_lang] = translation_result
                
            except Exception as e:
                logger.error(f"Failed to translate to {target_lang}: {str(e)}")
                translations[target_lang] = {
                    'error': str(e),
                    'source_language': source_language,
                    'target_language': target_lang,
                    'skipped': False
                }
        
        return translations
    
    def get_supported_languages(self) -> Dict[str, List[str]]:
        """
        Get list of supported languages for translation.
        Note: This is a static list of commonly supported languages.
        AWS Translate supports 75+ languages.
        
        Returns:
            Dict containing lists of supported source and target languages
        """
        # Common AWS Translate supported languages
        supported_languages = [
            'af', 'sq', 'am', 'ar', 'hy', 'az', 'bn', 'bs', 'bg', 'ca', 'zh', 'zh-TW',
            'hr', 'cs', 'da', 'prs', 'nl', 'en', 'et', 'fa', 'tl', 'fi', 'fr', 'fr-CA',
            'ka', 'de', 'el', 'gu', 'ht', 'ha', 'he', 'hi', 'hu', 'is', 'id', 'ga',
            'it', 'ja', 'kn', 'kk', 'ko', 'lv', 'lt', 'mk', 'ms', 'ml', 'mt', 'mr',
            'mn', 'no', 'ps', 'pl', 'pt', 'pt-PT', 'pa', 'ro', 'ru', 'sr', 'si',
            'sk', 'sl', 'so', 'es', 'es-MX', 'sw', 'sv', 'ta', 'te', 'th', 'tr',
            'uk', 'ur', 'uz', 'vi', 'cy'
        ]
        
        return {
            'source_languages': supported_languages,
            'target_languages': supported_languages
        }

def main():
    """
    Example usage and testing of the AWS Translation Service.
    """
    try:
        # Initialize the service
        translator = AWSTranslationService()
        
        # Example text
        text = "Hello, my name is Erin. This is recording."
        
        # Test language detection
        print("=== Language Detection ===")
        detection_result = translator.detect_language(text)
        print(f"Detected: {detection_result}")
        
        # Test single translation
        print("\n=== Single Translation ===")
        spanish_translation = translator.translate_text(text, 'es')
        print(f"Spanish: {spanish_translation}")
        
        # Test multi-language translation
        print("\n=== Multi-Language Translation ===")
        target_languages = ['es', 'fr', 'de']
        multi_translations = translator.translate_to_multiple_languages(text, target_languages)
        
        for lang, result in multi_translations.items():
            if 'error' not in result:
                print(f"{lang}: {result['translated_text']}")
            else:
                print(f"{lang}: ERROR - {result['error']}")
        
        # Show supported languages
        print("\n=== Supported Languages ===")
        supported = translator.get_supported_languages()
        print(f"Total supported languages: {len(supported['source_languages'])}")
        
    except Exception as e:
        logger.error(f"Example failed: {str(e)}")

if __name__ == "__main__":
    main()