#!/bin/bash

# === Configuration ===

TARGET_DIR="$1"   # First argument to the script: path to folder
TEXT_TO_PREPEND="// Under review"

# === Safety Check ===

if [ -z "$TARGET_DIR" ]; then
  echo "Error: Please provide a folder path."
  echo "Usage: ./prepend-text.sh /path/to/folder"
  exit 1
fi

if [ ! -d "$TARGET_DIR" ]; then
  echo "Error: '$TARGET_DIR' is not a directory."
  exit 1
fi

# === Prepend Text to Each File ===

find "$TARGET_DIR" -type f | while read -r file; do
  tmpfile=$(mktemp)
  printf "%s\n" "$TEXT_TO_PREPEND" > "$tmpfile"
  cat "$file" >> "$tmpfile"
  mv "$tmpfile" "$file"
  echo "Modified: $file"
done

echo "Done. Text prepended to all files in $TARGET_DIR"
