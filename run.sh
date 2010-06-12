#!/bin/bash
#

mode="dev"

play=$HOME/play-1.1;

here=`dirname $0`

if [ ! -d $play ]; then
  play_version="play-1.1-unstable-r836"
  play=$here"/"$play_version
  $here/download-play.sh $play_version
  
  if [ ! -d $play"/modules/sass-head" ]; then
    $play/play install sass-head
  fi
fi

$here/project/orbited/start.sh restq &
$here/project/orbited/start.sh orbited &
$play/play run $here/project/

killall python # TODO: find better to stop restq and orbited...
