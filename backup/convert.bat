FOR /F "tokens=*" %%G IN ('dir /b *.gif') DO ffmpeg -i "%%G" "%%~nG.webm"
FOR /F "tokens=*" %%G IN ('dir /b *.mp4') DO ffmpeg -i "%%G" "%%~nG.webm"