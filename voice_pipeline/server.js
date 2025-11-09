import express from 'express';
import cors from 'cors';
import multer from 'multer';
import dotenv from 'dotenv';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { SFNClient, StartExecutionCommand, DescribeExecutionCommand, StopExecutionCommand } from '@aws-sdk/client-sfn';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

const envPath = path.resolve('./backend/.env');
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
} else {
  dotenv.config();
}

const {
  AWS_REGION = 'ca-central-1',
  TRANSCRIBE_MEDIA_BUCKET,
  STEP_FUNCTION_ARN,
  RESULT_AUDIO_BUCKET = 'output-translated-tts',
  RESULT_AUDIO_PREFIX = 'output/',
} = process.env;

if (!TRANSCRIBE_MEDIA_BUCKET) {
  throw new Error('TRANSCRIBE_MEDIA_BUCKET must be set.');
}
if (!STEP_FUNCTION_ARN) {
  throw new Error('STEP_FUNCTION_ARN must be set.');
}

const s3Client = new S3Client({ region: AWS_REGION });
const sfnClient = new SFNClient({ region: AWS_REGION });

const upload = multer({ storage: multer.memoryStorage() });
const app = express();
app.use(cors());
app.use(express.json());

app.get('/health', (_, res) => {
  res.json({ status: 'ok' });
});

async function uploadAudioBuffer(buffer, suffix = '.mp3') {
  const key = `audio/${crypto.randomUUID()}${suffix.startsWith('.') ? suffix : `.${suffix}`}`;
  await s3Client.send(new PutObjectCommand({
    Bucket: TRANSCRIBE_MEDIA_BUCKET,
    Key: key,
    Body: buffer,
  }));
  return key;
}

async function startPipeline(payload, timeoutSeconds = 180) {
  const startRes = await sfnClient.send(
    new StartExecutionCommand({
      stateMachineArn: STEP_FUNCTION_ARN,
      input: JSON.stringify(payload),
    })
  );

  const executionArn = startRes.executionArn;
  const deadline = Date.now() + timeoutSeconds * 1000;

  while (Date.now() < deadline) {
    const describe = await sfnClient.send(new DescribeExecutionCommand({ executionArn }));
    if (describe.status === 'RUNNING') {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      continue;
    }
    if (describe.status === 'SUCCEEDED') {
      return JSON.parse(describe.output || '{}');
    }
    throw new Error(`State machine ended with ${describe.status}: ${describe.cause || ''}`);
  }

  await sfnClient.send(
    new StopExecutionCommand({ executionArn, error: 'Timeout', cause: 'Client timeout' })
  );
  throw new Error('State machine execution timed out.');
}

function parsePipelineOutput(data) {
  const speech = data?.speechResult?.speech || {};
  const translation = data?.translationResult?.translation || {};
  const audio = data?.speechAudioResult?.speechAudio || {};
  return { speech, translation, audio };
}

async function storeAudioResult(audioBase64) {
  if (!RESULT_AUDIO_BUCKET || !audioBase64) return null;
  const key = `${RESULT_AUDIO_PREFIX.replace(/\/$/, '')}/${crypto.randomUUID()}.mp3`;
  const buffer = Buffer.from(audioBase64, 'base64');
  await s3Client.send(new PutObjectCommand({
    Bucket: RESULT_AUDIO_BUCKET,
    Key: key,
    Body: buffer,
    ContentType: 'audio/mpeg',
  }));
  return `s3://${RESULT_AUDIO_BUCKET}/${key}`;
}

app.post('/translate-audio', upload.single('file'), async (req, res) => {
  try {
    if (!req.file || !req.file.buffer.length) {
      return res.status(400).json({ detail: 'Audio file is required.' });
    }

    const targetLanguage = req.body.target_language || req.body.targetLanguage || 'fr';
    const suffix = (req.file.originalname || '.mp3').split('.').pop();
    const key = await uploadAudioBuffer(req.file.buffer, `.${suffix}`);

    const pipelineOutput = await startPipeline({
      s3Bucket: TRANSCRIBE_MEDIA_BUCKET,
      s3Key: key,
      targetLanguage,
    });

    const { speech, translation, audio } = parsePipelineOutput(pipelineOutput);
    const audioBase64 = audio?.audioBase64;
    if (!audioBase64) {
      return res.status(500).json({ detail: 'Pipeline returned no audio.' });
    }

    await storeAudioResult(audioBase64);

    const buffer = Buffer.from(audioBase64, 'base64');
    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Content-Disposition', `attachment; filename="translated_${targetLanguage}.mp3"`);
    res.send(buffer);
  } catch (error) {
    console.error(error);
    res.status(500).json({ detail: error.message || 'Translation failed' });
  }
});

app.post('/translate-audio/json', upload.single('file'), async (req, res) => {
  try {
    if (!req.file || !req.file.buffer.length) {
      return res.status(400).json({ detail: 'Audio file is required.' });
    }

    const targetLanguage = req.body.target_language || req.body.targetLanguage || 'fr';
    const suffix = (req.file.originalname || '.mp3').split('.').pop();
    const key = await uploadAudioBuffer(req.file.buffer, `.${suffix}`);

    const pipelineOutput = await startPipeline({
      s3Bucket: TRANSCRIBE_MEDIA_BUCKET,
      s3Key: key,
      targetLanguage,
    });

    const { speech, translation, audio } = parsePipelineOutput(pipelineOutput);
    const audioBase64 = audio?.audioBase64;
    const s3Uri = await storeAudioResult(audioBase64);
    if (s3Uri) {
      audio.audioS3Uri = s3Uri;
    }

    res.json({ speech, translation, audio });
  } catch (error) {
    console.error(error);
    res.status(500).json({ detail: error.message || 'Translation failed' });
  }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Voice pipeline server listening on port ${PORT}`);
});
