#!/bin/bash
set -x

osascript -e "tell application \"System Events\" to key code $1 using {command down, shift down, control down}"
