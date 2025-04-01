#!bin/bash

brew install npm

npm install /BetterChatGPT

pip install -r requirments.txt

npm run dev ./BetterChatGPT
chroma run --path ./db
