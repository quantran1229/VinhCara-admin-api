#!/bin/bash
version="$(cat ./package.json | grep version | head -1 | awk -F: '{ print $2 }' | sed 's/[",]//g' | tr -d '[[:space:]]')"
image=""

if [ "$1" = "prod" ];
then
    image="$2/vcr-admin-api:$version"
else
    image="$2/vcr-admin-api:dev"
fi
docker build . -t $image
echo "Image builded $image"
docker push $image