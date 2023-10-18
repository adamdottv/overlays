#!/bin/bash
set -x

osascript <<END
  tell application "Spotify"
    set curSoundVolume to sound volume
    if curSoundVolume is 100 then
      set sound volume to 99
    end if
    if curSoundVolume is 0 then
      set sound volume to 1
    end if
    repeat while sound volume > 0
      set curSoundVolume to sound volume
      --Handle poorly coded Implementation by Spotify
      if curSoundVolume is in {80, 60, 40} then
        set sound volume to curSoundVolume - 2
      else
        set sound volume to curSoundVolume - 1
      end if
      delay 0.2
    end repeat

    playpause
  end tell
END
