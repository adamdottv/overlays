#!/bin/bash
set -x

osascript <<END
  tell application "Spotify"
    launch
    play

    set curSoundVolume to sound volume
    if curSoundVolume is 100 then
      set sound volume to 99
    end if
    if curSoundVolume is 0 then
      set sound volume to 1
    end if
    if curSoundVolume is less than 45 then
      repeat while sound volume < 45
        set curSoundVolume to sound volume
        set sound volume to curSoundVolume + 2
        delay 0.2
      end repeat
    else
      repeat while sound volume > 45
        set curSoundVolume to sound volume
        --Handle poorly coded Implementation by Spotify
        if curSoundVolume is in {80, 60, 40} then
          set sound volume to curSoundVolume - 1
        else
          set sound volume to curSoundVolume
        end if
        delay 0.2
      end repeat
    end if
  end tell
END
