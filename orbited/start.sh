#!/bin/bash
# #
# Get the script path
# #
# The following line should be the first in the script
SCRIPT_PATH="${BASH_SOURCE[0]}";
if([ -h "${SCRIPT_PATH}" ]) then
  while([ -h "${SCRIPT_PATH}" ]) do SCRIPT_PATH=`readlink "${SCRIPT_PATH}"`; done
fi
pushd . > /dev/null
cd `dirname ${SCRIPT_PATH}` > /dev/null
SCRIPT_PATH=`pwd`;


# #
# Set the path env vars for python
# #
PYTHONPATH=$SCRIPT_PATH/lib;
export PYTHONPATH;

if [ ! -d $PYTHONPATH ]; then
	echo "lib extraction ...";
	tar -xjf $SCRIPT_PATH/lib.tar.bzip2;
	echo "extraction done.";
fi;
# #
# Launch morbid_restq or orbited
# #
if [ "$1" = "restq" ]; then
	echo "Restq starts..."
	python $SCRIPT_PATH/lib/morbid/sample_restq/restq_dummy_daemon.py --port 5001
else
	if [ "$1" = "orbited" ]; then
		echo "Orbited starts..."
		python $SCRIPT_PATH/lib/orbited/start.py --config $SCRIPT_PATH/orbited.cfg
	else 
		echo "Usage: 'start restq' or 'start orbited' (restq required to be started first)"
	fi;
fi;

popd  > /dev/null # Restore the old path at the end
