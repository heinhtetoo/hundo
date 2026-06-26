#!/bin/sh
set -e
npm run migrate:up
exec node src/index.js
