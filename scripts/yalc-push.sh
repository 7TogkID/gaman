#!/bin/bash

# Exit on any error
set -e

# Run build in the root directory
npm run build

# Navigate to packages/core and push with yalc
cd ./packages/core
yalc push

# Navigate to packages/common and push with yalc
cd ../common
yalc push

# Navigate to packages/cli and push with yalc
cd ../cli
yalc push

cd ../../plugins/cors
yalc push

# Return to the root directory
cd ../..

echo "Build and push completed successfully!"