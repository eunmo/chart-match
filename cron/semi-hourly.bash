#!/bin/bash
for type in single album
do
  curl -s -o /dev/null "localhost:3010/api/chart/check/$type"
done
