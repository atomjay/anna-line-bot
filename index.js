require("dotenv").config();

const line = require("@line/bot-sdk");
const express = require("express");
const { OpenAIApi } = require("openai");
const request = require("request");

// create LINE SDK config from env variables
const config = {
  channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN,
  channelSecret: process.env.CHANNEL_SECRET,
};

// create LINE SDK client
const client = new line.Client(config);

// create Express app
// about Express itself: https://expressjs.com/
const app = express();

// register a webhook handler with middleware
// about the middleware, please refer to doc
app.post("/callback", line.middleware(config), (req, res) => {
  Promise.all(req.body.events.map(handleEvent))
    .then((result) => res.json(result))
    .catch((err) => {
      console.error(err);
      res.status(500).end();
    });
});

// event handler
function handleEvent(event) {
  if (event.type !== "message" || event.message.type !== "text") {
    // ignore non-text-message event
    return Promise.resolve(null);
  }

  //   // create a echoing text message
  //   const echo = { type: "text", text: event.message.text };

  //   // use reply API
  //   return client.replyMessage(event.replyToken, echo);
  // 將用戶傳送文字使用OpenAI 的 API 處理
  return new Promise((resolve, reject) => {
    request.post(
      {
        url: "https://api.openai.com/v1/completions",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        },
        json: {
          model: "text-davinci-003",
          prompt: event.message.text,
          temperature: 0.7,
          max_tokens: 1000,
          top_p: 1,
          frequency_penalty: 0,
          presence_penalty: 0,
        },
      },
      (error, response, body) => {
        if (error) {
          reject(error);
        } else {
          resolve(
            bot,
            replyMessage(event.replyToken, {
              type: "text",
              text: body.choices[0].text,
            })
          );
        }
      }
    );
  });
}

// listen on port
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`listening on ${port}`);
});
