const qrcode = require("qrcode-terminal");
const { Client, LocalAuth } = require("whatsapp-web.js");
const AI = require("./AI.js");
const express = require("express"); // Importa o Express
// const fs = require('fs');
const fs = require('fs/promises');
const path = require('path');
const textTranscript = require('./textTrasnscript');
const app = express(); // Cria uma instância do Express
const port = 3000 || process.env.PORT; // Define a porta

class Message {
    constructor(userID,PreviousUserMessage, PreviousBotMessage) {
        this.userID = userID;
        this.PreviousUserMessage = PreviousUserMessage;
        this.PreviousBotMessage = PreviousBotMessage;
    }
}

class Main {
  
  constructor() {
    this.start();
    this.listenPort();
    this.usersMessages = {};
  }

  async saveAudio(media, msg) {
    const audioPath = path.join(__dirname, 'audios', `${msg.id.id}.ogg`);

    // Certifique-se de que media.data é uma string válida
    if (!media.data) {                                               
        console.error('Dados de mídia não estão disponíveis.');
        return;
    }
    try {
      await fs.writeFile(audioPath, media.data, { encoding: 'base64' });
      console.log('Áudio guardado com sucesso em:', audioPath);
    } catch (err) {
      console.error('Falha no carregamento do áudio:', err);
    }
  }

  async start() {
    const base = '';
    let contextualPrompt = '';
    const messages = [];
    const whatsapp = new Client({
      authStrategy: new LocalAuth(),
    });

    // whatsapp
    whatsapp.on("qr", (qr) => {
      qrcode.generate(qr, { small: true });
      console.log(qr);
    });

    whatsapp.on("ready", () => {
      console.log("Client is ready!");
    });

    whatsapp.on("message", async (message) => {
      try {
      
      if(message.hasMedia) {
        let audio = await message.downloadMedia();
        await this.saveAudio(audio, message);

          const text = await textTranscript(`audios/${message.id.id}.ogg`)
          // console.log(text)

          let userID = message.from;
          
          if(!this.usersMessages[userID]) {
              this.usersMessages[userID] = [];
              contextualPrompt = '';    
          } 
          
          if (this.usersMessages[userID].length) {
              const historico = this.historicoConversas(this.usersMessages[userID]);
              contextualPrompt = `Aqui esta o historico da minha conversa contigo:\n ${historico}\n Agora a minha nova questao é: `;
              // console.log(historico);
              // console.log(contextualPrompt);
              // console.log(this.usersMessages[userID]);
  
          }
  
          // whatsapp.on('media_uploaded', ()
          console.log(text);
          contextualPrompt += (text?.transcription) + base;
          console.log(contextualPrompt);
          const response = await AI(contextualPrompt);
          message.reply(response);
          let msg = new Message(userID,message.body, response);
          this.usersMessages[userID].push(msg);
      }

      if (message.body) {
        console.log(message.body);
        
        let userID = message.from;

        console.log(message.type);
        
        if(!this.usersMessages[userID]) {
            this.usersMessages[userID] = [];
            contextualPrompt = '';    
        } 
        
        if (this.usersMessages[userID].length) {
            const historico = this.historicoConversas(this.usersMessages[userID]);
            contextualPrompt = `Aqui esta o historico da minha conversa contigo\n ${historico}\n Agora a minha nova questao é: `;
            // console.log(historico);
            // console.log(contextualPrompt);
            // console.log(this.usersMessages[userID]);

        }

        // whatsapp.on('media_uploaded', ()
        
        contextualPrompt += message.body + base;


        const response = await AI(contextualPrompt);
        message.reply(response);
        let msg = new Message(userID,message.body, response);
        this.usersMessages[userID].push(msg);
       }
      } catch(error) {
        console.log(error.message)
      }
    });
    // end whatsapp
    whatsapp.initialize();
    
  }

  listenPort() {
    app.get("/", (req, res) => {
      res.status(200).send("Hello, World!\n");
    });

    app.listen(port, () => {
      console.log(`Servidor rodando em http://localhost:${port}/`);
    });
  }

  historicoConversas(msgs) {
    return msgs.map(mgs => {
        return `usuario: ${mgs.PreviousUserMessage}\n bot: ${mgs.PreviousBotMessage}\n`
    }).join('\n\n');
  }

  context (message) {
    let userID = message.from;

        console.log(message.type);
        
        if(!this.usersMessages[userID]) {
            this.usersMessages[userID] = [];
            contextualPrompt = '';    
        } 
        
        if (this.usersMessages[userID].length) {
            const historico = this.historicoConversas(this.usersMessages[userID]);
            contextualPrompt = `Aqui esta o historico da conversa do usuario:\n ${historico}\n Agora a nova questao do usuario é: `;
            // console.log(historico);
            // console.log(contextualPrompt);
            // console.log(this.usersMessages[userID]);

        }

        // whatsapp.on('media_uploaded', ()
        
        contextualPrompt += message.body + base;

  }
}

new Main();