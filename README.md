## Environment variables
Create and add environment variables in .env file:  
POSTGRES_USER = postgres  
PASSWORD = xxxxxx  
PORT = 5432  
HOST = localhost  
DATABASE= expired_videos

CRON_START_TIME=0 0 * * *

## Start postgres as Docker container
docker run --name exp_videos_postgres -p 5432:5432 -e POSTGRES_PASSWORD=xxxxxxx -e POSTGRES_DB=expired_videos -d postgres:14-alpine

## Install application dependencies
npm install

## Start application:
node index.js

## Environments and deployments
### Local environment 
local environment communicates with postgres instance installed on your local environment using postgres alpine docker container 

### Development environment in OpenShift
main branch deploys to test Openshift project named Poistamo with labeling ilmoittamo-dev
dev environment communicates with postgres instance called poistamo_dev at possu.it.helsinki.fi

### Test environment in OpenShift
test branch deploys to test Openshift project named Poistamo with labeling imoittamo-test
test environment communicates with postgres instance called poistamo_test at possu.it.helsinki.fi

### Production environment in OpenShift
prod branch deploys to production Openshift project named Poistamo with labeling ilmoittamo-prod
production environment communicates with postgres instance called poistamo at possu.it.helsinki.fi
