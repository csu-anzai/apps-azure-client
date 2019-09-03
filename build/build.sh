#! /bin/bash

set -o xtrace

VERSION=$1
BRANCH=$2

echo "Install angular cli..."
npm install -g @angular/cli


if [ "$BRANCH" == "master" ]; then
    APP_ENVIRONMENT=production
else
    APP_ENVIRONMENT=staging  
fi

echo "Updating npm version..."

sed -i 's/1\.0\.0/'$APP_VERSION'/g' ./src/environments/config.$APP_ENVIRONMENT.ts
npm --no-git-tag-version version $VERSION

echo "Updating npm pacakages..."

npm install
npm update

echo "Building app..."
ng build --configuration $APP_ENVIRONMENT 

cd dist 
APP_NAME=ls | sort -n | head -1
cd $APP_NAME

find . -type f -exec sha256sum {} > module.map
