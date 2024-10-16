from fastapi import FastAPI, HTTPException
from pydub import AudioSegment
import speech_recognition as sr
import os

app = FastAPI()

# Rota base
@app.get("/")
async def read_root():
    return {"message": "Bem-vindo à API de Conversão e Transcrição de Áudio!"}

@app.post("/convert-and-transcribe/{file_path:path}")
async def convert_and_transcribe(file_path: str):
    
    if not os.path.isfile(file_path) or not file_path.endswith('.ogg'):
        raise HTTPException(status_code=400, detail="O arquivo deve existir e ser do tipo .ogg")

    
    wav_path = file_path.replace('.ogg', '.wav')

    try:
        audio = AudioSegment.from_ogg(file_path)
        audio.export(wav_path, format="wav")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro na conversão: {e}")

    recognizer = sr.Recognizer()
    try:
        with sr.AudioFile(wav_path) as source:
            audio_data = recognizer.record(source)
            text = recognizer.recognize_google(audio_data, language="pt-BR")
    except sr.UnknownValueError:
        raise HTTPException(status_code=400, detail="Não foi possível entender o áudio")
    except sr.RequestError as e:
        raise HTTPException(status_code=500, detail=f"Erro ao requisitar resultados da API: {e}")

    
    os.remove(wav_path)

    return {"transcription": text}

