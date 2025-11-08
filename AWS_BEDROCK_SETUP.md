# AWS Bedrock Setup Guide

## 🚀 What You're Missing & How to Fix It

You're trying to run AWS Bedrock examples but need to complete the setup first. Here's what you need:

## 1. 📋 Prerequisites Checklist

✅ **Python packages installed** (boto3, awscli)  
❌ **AWS credentials configured**  
❌ **Bedrock model access requested**  
❌ **AWS region configured**

## 2. 🔧 Setup Steps

### Step 1: Configure AWS Credentials

You need AWS credentials to access Bedrock. Choose one option:

**Option A: AWS Configure (Recommended)**

```bash
# Run this in terminal
aws configure
```

**Option B: Environment Variables**

```bash
export AWS_ACCESS_KEY_ID="your-access-key"
export AWS_SECRET_ACCESS_KEY="your-secret-key"
export AWS_DEFAULT_REGION="us-east-1"
```

**Option C: Create credentials file**

```bash
mkdir -p ~/.aws
cat > ~/.aws/credentials << EOF
[default]
aws_access_key_id = your-access-key
aws_secret_access_key = your-secret-key
EOF

cat > ~/.aws/config << EOF
[default]
region = us-east-1
output = json
EOF
```

### Step 2: Request Bedrock Model Access

⚠️ **IMPORTANT**: You must request access to models before using them!

1. Go to AWS Console → Bedrock → Model Access
2. Request access to models you want to use (e.g., Claude, Llama)
3. Wait for approval (usually instant for most models)

### Step 3: Set Correct Region

Bedrock is available in specific regions:

- `us-east-1` (N. Virginia) ✅
- `us-west-2` (Oregon) ✅
- `eu-west-1` (Ireland) ✅
- `ap-southeast-1` (Singapore) ✅

## 3. 🧪 Test Your Setup

Run the test script:

```bash
python bedrock_wrapper.py
```

## 4. 🔍 Common Errors & Solutions

### Error: "UnauthorizedOperation"

**Solution**: Configure AWS credentials (Step 1)

### Error: "AccessDenied" or "ValidationException"

**Solution**: Request model access in AWS Console (Step 2)

### Error: "InvalidRegion"

**Solution**: Use a Bedrock-supported region (Step 3)

### Error: "ModuleNotFoundError: boto3"

**Solution**: Install packages: `pip install boto3`

## 5. 🎯 What Each File Does

- `bedrock_wrapper.py` - Main Bedrock operations wrapper
- `python-test.py` - Lists available foundation models
- `requirements.txt` - Python dependencies

## 6. 📚 Next Steps

Once setup is complete:

1. List available models: `python bedrock_wrapper.py`
2. Test specific models: `python python-test.py`
3. Build your application using the Bedrock APIs

## 7. 🆘 Need AWS Account?

If you don't have AWS credentials:

1. Create AWS account at https://aws.amazon.com
2. Create IAM user with Bedrock permissions
3. Generate access keys
4. Follow setup steps above

---

**Ready to test?** Run `python bedrock_wrapper.py` after completing setup!
