const jwt = require('jsonwebtoken');
const jwkToPem = require('jwk-to-pem');
const axios = require('axios');
const env = require('../config/env');

let cognitoPublicKeys = null;

async function getCognitoPublicKeys() {
  if (cognitoPublicKeys) {
    return cognitoPublicKeys;
  }
  const keysUrl = `https://cognito-idp.${env.awsRegion}.amazonaws.com/${env.cognito.userPoolId}/.well-known/jwks.json`;
  try {
    const response = await axios.get(keysUrl);
    cognitoPublicKeys = response.data.keys;
    return cognitoPublicKeys;
  } catch (error) {
    throw new Error('Failed to fetch Cognito public keys');
  }
}

async function authenticateToken(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Missing or invalid authorization header' });
    }
    const token = authHeader.split(' ')[1];
    const decodedHeader = jwt.decode(token, { complete: true });
    if (!decodedHeader) {
      return res.status(401).json({ error: 'Invalid token format' });
    }
    const kid = decodedHeader.header.kid;
    const keys = await getCognitoPublicKeys();
    const key = keys.find(k => k.kid === kid);
    if (!key) {
      return res.status(401).json({ error: 'Invalid token key' });
    }
    const pem = jwkToPem(key);
    const decoded = jwt.verify(token, pem, {
      algorithms: ['RS256'],
      issuer: `https://cognito-idp.${env.awsRegion}.amazonaws.com/${env.cognito.userPoolId}`,
    });
    req.user = decoded;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired' });
    }
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid token' });
    }
    return res.status(500).json({ error: 'Authentication failed' });
  }
}

module.exports = authenticateToken;
