#!/bin/bash

WEF_DIR="$HOME/Library/Containers/com.microsoft.Excel/Data/Documents/wef"

if [ -d "$WEF_DIR" ]; then
  echo "WEF folder already exists: $WEF_DIR"
else
  mkdir -p "$WEF_DIR"
  echo "WEF folder created: $WEF_DIR"
fi
