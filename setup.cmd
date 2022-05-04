@echo off
cd "Bundler"
start cmd /c npm i
start cmd dart pub get
exit