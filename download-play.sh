#!/bin/bash



if [ "$1" = "" ]; then
  play_version="play-1.1-unstable-r836"; # used if not arg $1
else
  play_version=$1;
fi;

echo "Téléchargement du framework play 1.1 (r836)...";
wget "http://download.playframework.org/1.1-nightly/"$play_version".zip";
echo "Téléchargé.";

echo "Extraction des sources...";
unzip $play_version".zip";
echo "Extrait.";
