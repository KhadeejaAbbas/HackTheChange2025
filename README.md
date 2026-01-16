# InclusiveHealth

A multilingual healthcare communication platform enabling real-time speech translation, transcription, and summaries to improve patient–provider interactions.


## Table of Contents

* [Inspiration](#inspiration)
* [What It Does](#what-it-does)
* [Features](#features)
* [Architecture](#architecture)
* [How We Built It](#how-we-built-it)
* [Challenges](#challenges-we-ran-into)
* [Accomplishments](#accomplishments-were-proud-of)
* [What We Learned](#what-we-learned)
* [Roadmap](#whats-next-for-4m13--git-pushers--inclusivehealth)
* [Built With](#built-with)
* [How to Access the Code](#how-to-access-the-code)

## Inspiration

The inspiration for this project came from personal stories of our teammates and their experiences through the healthcare system. Many were exposed to the challenges their loved ones faced when trying to communicate with healthcare providers. Some always went to the clinic with someone who could translate or went through the struggle of trying to call someone to translate remotely for them.

This led to the inspiration of creating **InclusiveHealth**, an easy-to-use tool to preserve the dignity of patients through their interactions with doctors.

## What It Does

InclusiveHealth is designed for healthcare settings where language barriers can impact care quality and patient dignity.
We developed a multilingual web application that:

* Automatically detects the language being spoken
* Provides real-time translation
* Produces transcripts and summaries of conversations

This application is designed for use in healthcare settings between patients and providers.

The application is login-protected with an email confirmation code sent upon sign up, adding an extra layer of security to protect patient data and maintain confidentiality. Once signed in, users can utilize the **record** feature for live-action translation in **5+ languages**. The transcript is stored for future review and summarization for the patient.


## Architecture

```
User (Doctor / Patient)
        │
        ▼
 Next.js Frontend (Auth + Recording)
        │
        ▼
 AWS S3 (Audio Storage)
        │
        ▼
 AWS Transcribe → Translate → Polly
        │
        ▼
 Processed Audio + Text → S3 → Frontend
```

## How We Built It

Our pipeline begins by collecting user input through the website.

### Frontend

* Built using **Next.js** and **Tailwind CSS**
* File-based routing with Next.js
* React used for UI components
* Login and sign-up authentication implemented for security

Authentication is handled using **AWS Cognito**, while **Amazon DynamoDB** is used as the database.

### Backend & AWS Services

After signing in:

* Doctors can create sessions and invite patients via email
* Patients can accept session invitations
* Both doctors and patients can click the **record** button to speak

The recorded audio:

1. Is saved as an `.mp3` file
2. Uploaded to an **AWS S3 bucket**
3. Processed using:

   * **AWS Transcribe** (speech-to-text)
   * **AWS Translate** (language translation)
   * **AWS Polly** (text-to-speech)

These services are accessed via the **AWS SDK (boto3)**. The generated audio output is stored in another S3 bucket and accessed by the frontend for users to listen to and read.

## Challenges We Ran Into

### Ideation

We initially struggled to narrow down our ideas and connect them to the given prompt. Seeking guidance from mentors helped us gain clarity and direction.

### API & Cost Constraints

We originally planned to use **OpenAI’s API** for transcription and translation but discovered it required payment. This led us to explore **AWS Transcribe, Translate, and Polly**, significantly expanding our understanding of AWS services.

### Authentication Issues

Integrating **AWS Cognito** with frontend login and backend authentication presented major challenges. Valid login attempts consistently resulted in **HTTP 502 and 503 errors**, indicating backend service issues.

After extensive debugging, we discovered the root cause: the Cognito user pool was misconfigured, and the **email attribute was not enabled as a login alias**. Once corrected, the login flow worked as expected.

## Accomplishments We're Proud Of

* Real-time live translation with automatic language detection
* Fully functional login authentication system after extensive debugging
* A deployed web application with a clean UI and strong user experience

## What We Learned

* Hands-on experience with **AWS Cognito** and **DynamoDB**
* Practical usage of **AWS Transcribe, Translate, and Polly**
* Implementing and integrating a **text-to-speech pipeline**

This project significantly expanded our understanding of cloud services and real-world system integration.

## What's Next for 4M13 – Git Pushers – InclusiveHealth

Future plans include:

* Implementing an **AI chat assistant** for patients to ask follow-up questions after doctor sessions
* Allowing patients to access past records, making InclusiveHealth a centralized health information platform
* Adding a **portable hardware component** for clinics, especially in regions with language barriers

## Built With

* amazon-dynamodb
* amazon-web-services
* aws-transcribe
* aws-translate
* cognito
* next.js
* polly
* tailwind

## How to Access the Code

* **Link 1:** Cleaned and updated frontend version of this GitHub repos <br>
     *GitHub Repo (Frontend):* https://github.com/Sodeeqalli/hackTheChange-Frontend
* **Link 2:** Vercel link to the deployed version of the website<br>
     *Deployed App:* hack-the-change-frontend-git-main-sodeeqallis-projects.vercel.app 
* **Link 3:** Youtube link to a live demo <br>
    *Youtube:* [https://youtu.be/0JklKL3GicE ](https://youtu.be/0JklKL3GicE)
