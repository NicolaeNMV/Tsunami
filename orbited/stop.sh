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
popd  > /dev/null

kill -9 `cat $SCRIPT_PATH/orbited.pid`
kill -9 `cat $SCRIPT_PATH/morbid.pid`

echo /dev/null > $SCRIPT_PATH/orbited.pid
echo /dev/null > $SCRIPT_PATH/morbid.pid
