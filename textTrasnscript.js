const axios = require('axios');



async function transcribeAudio(audioFilePath) {
  try {
    // const audioFilePath = 'audios/60713BEC72FED13486CC76D03663E889.ogg';
    const apiUrl = `http://localhost:8000/convert-and-transcribe/${encodeURIComponent(audioFilePath)}`;
    const response = await axios.post(apiUrl);
    console.log('Transcrição:', response.data);
    console.log(typeof response.data);
    return response.data;
  } catch (error) {
    console.error('Erro:', error.response ? error.response.data : error.message);
  }
}

// transcribeAudio('audios/60713BEC72FED13486CC76D03663E889.ogg').then(r => {
//     console.log(r.transcription);
// })

module.exports = transcribeAudio;
