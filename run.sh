#!/bin/bash
#


here=`dirname $0`
cd $here;

type -t play;

if [ $? == 1 ]; then
  play_version="play-1.0.3"
  playdir=$here"/"$play_version
  
  if [ ! -d $playdir ]; then
    echo "Téléchargement de Play! framework ("$play_version")...";
    wget "http://download.playframework.org/releases/"$play_version".zip" -O $play_version".zip";
    echo "Téléchargé.";

    echo "Extraction des sources...";
    unzip $play_version".zip";
    echo "Extrait.";
  fi
  
  PATH=$PATH":"$playdir;
  
  if [ ! -d $playdir"/modules/sass-head" ]; then
    play install sass-head
  fi
fi

play run $here/project/
