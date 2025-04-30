#!bin/bash

brew install npm

npm install ./BetterChatGPT

pip install -r requirements.txt

npm run dev ./BetterChatGPT
chroma run --path ./db
