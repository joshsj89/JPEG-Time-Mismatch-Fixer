#!/bin/bash

FOLDER=$1
OFFSET=$2 # e.g., "+0:0:0 1:00:00" to add  0 days, 1 hour, 0 minutes, and 0 seconds; "-0:0:0 1:00:00" to subtract the same
TZONE=$3 # e.g., "-07:00" to set the timezone to UTC-7

if [ $# -le 2 ]; then
  echo "Usage: $0 <folder> \"<offset>\" [\"<timezone>\"]"
  echo "Example: $0 /path/to/photos \"+0:0:0 1:00:00\" \"-07:00\""
  exit 1
fi

if [ ! -d "$FOLDER" ]; then
  echo "Error: Folder '$FOLDER' does not exist."
  exit 1
fi

if [ -z "$OFFSET" ]; then
  echo "Usage: $0 <folder> \"<offset>\" \"<timezone>\""
  echo "Example: $0 /path/to/photos \"+0:0:0 1:00:00\" \"-07:00\""
  exit 1
fi

if [ -n "$TZONE" ]; then # if timezone is provided, validate its format
  if ! [[ "$TZONE" =~ ^[+-][0-9]{2}:[0-9]{2}$ ]]; then
    echo "Error: Timezone format is invalid. Expected format: '+HH:MM' or '-HH:MM'"
    exit 1
  fi
fi

if ! command -v exiftool &> /dev/null; then
  echo "Error: exiftool is not installed. Please install it and try again."
  exit 1
fi

if [[ "$OFFSET" != +* ]] && [[ "$OFFSET" != -* ]]; then
  echo "Error: Offset must start with '+' or '-'."
  exit 1
fi

if ! [[ "$OFFSET" =~ ^[+-][0-9]+:[0-9]+:[0-9]+[[:space:]][0-9]+:[0-9]+:[0-9]+$ ]]; then
  echo "Error: Offset format is invalid. Expected format: '+Y:M:D H:M:S' or '-Y:M:D H:M:S'"
  exit 1
fi

# take first character as sign then put an equal sign after it to make it work with exiftool
# e.g., "+0:0:0 1:00:00" becomes "+=0:0:0 1:00:00"
OFFSET="${OFFSET:0:1}=${OFFSET:1}"

echo "Processing files in '$FOLDER' with offset '$OFFSET'..."

if [ -n "$TZONE" ]; then # if timezone is provided, add it to the exiftool command
  exiftool -r -overwrite_original \
  -ext jpg -ext cr2 \
  "-DateTimeOriginal$OFFSET" \
  "-CreateDate$OFFSET" \
  "-DateTimeDigitized$OFFSET" \
  "-ModifyDate$OFFSET" \
  "-OffsetTime=$TZONE" \
  "-OffsetTimeOriginal=$TZONE" \
  "-OffsetTimeDigitized=$TZONE" \
  "-TimeZone=$TZONE" \
  "$FOLDER" 
else # if no timezone is provided, just run the exiftool command without the timezone options
  exiftool -r -overwrite_original \
    -ext jpg -ext cr2 \
    "-DateTimeOriginal$OFFSET" \
    "-CreateDate$OFFSET" \
    "-DateTimeDigitized$OFFSET" \
    "-ModifyDate$OFFSET" \
    "$FOLDER"
fi

echo "Complete"