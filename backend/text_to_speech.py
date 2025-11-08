from openai import OpenAI

client = OpenAI()
input_audio_file = "/path/to/file/audio.mp3"
audio_file= open(input_audio_file, "rb")

transcription = client.audio.transcriptions.create(
    model="gpt-4o-transcribe", 
    file=audio_file,
    response_format="text"
)

print(transcription.text)