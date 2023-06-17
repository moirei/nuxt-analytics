#!/usr/bin/env sh

# abort on errors
set -e

# navigate into the docs directory
cd docs

# build
yarn generate

# navigate into the build output directory
cd .output

git init
git add -A
git commit -m 'deploy'

git push -f git@github.com:moirei/nuxt-analytics.git master:gh-pages

cd -