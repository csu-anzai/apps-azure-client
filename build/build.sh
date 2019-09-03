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

echo "Builing app..."

sed -i 's/1\.0\.0/'$APP_VERSION'/g' ./src/environments/config.$APP_ENVIRONMENT.ts

npm --no-git-tag-version version $VERSION
npm install
npm update

if [ "$APP_ENVIRONMENT" == "production" ]; then
    NG_FLAGS=--prod
fi

ng build --configuration $APP_ENVIRONMENT $NG_FLAGS

