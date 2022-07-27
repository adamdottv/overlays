#!/bin/sh

# kill chrome
killall -9 Google\ Chrome

# sleep so that chrome is completely gone
sleep 2

# open chrome with the rick-roll url
/Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome --kiosk --app="https://www.youtube.com/watch?v=dQw4w9WgXcQ&mode=theatre"

# full screen
osascript -e "tell application \"Google Chrome\"" -e "tell application \"System Events\"" -e "keystroke \"f\" using {control down, command down}" -e "end tell" -e "end tell"
