const fetch = require('node-fetch');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const { text } = JSON.parse(event.body);

  if (!text) {
    return { statusCode: 400, body: 'Bad Request: text is required' };
  }

  const apiKey = process.env.GOOGLE_API_KEY;
  if (!apiKey) {
    return { statusCode: 500, body: 'API key not configured' };
  }

  const url = `https://texttospeech.googleapis.com/v1/text:synthesize?key=${apiKey}`;

  const payload = {
    input: { text },
    voice: { languageCode: 'en-US', ssmlGender: 'NEUTRAL' },
    audioConfig: { audioEncoding: 'MP3' },
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error('Text-to-Speech API error:', errorBody);
      return { statusCode: response.status, body: `Failed to generate audio: ${errorBody}` };
    }

    const data = await response.json();
    const audioContent = data.audioContent;

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'audio/mpeg' },
      body: audioContent,
      isBase64Encoded: true,
    };
  } catch (error) {
    console.error('Error calling Text-to-Speech API:', error);
    return { statusCode: 500, body: 'Internal Server Error' };
  }
};
