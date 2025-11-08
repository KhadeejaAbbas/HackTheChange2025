from openai import OpenAI

client = OpenAI()

input_audio_file = "/Users/khadeejaabbas/git/HackTheChange2025/samplevoice.mp3"
audio_file= open(input_audio_file, "rb")

transcription = client.audio.transcriptions.create(
    model="gpt-4o-transcribe", 
    file=audio_file,
    response_format="text",
    stream=True # allows it to be a stream

)

for event in stream:
  print(event)