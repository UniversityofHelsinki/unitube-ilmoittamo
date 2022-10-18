## Development Environment variables
Create and add environment variables in .env file:  
POSTGRES_USER = postgres  
PASSWORD = xxxxxx  
PORT = 5432  
HOST = localhost  
DATABASE= expired_videos

CRON_START_TIME=0 0 * * *

ILMOITTAMO_OPENCAST_HOST = (OpenCast development url)
ILMOITTAMO_OPENCAST_USER = (Local Opencast user)
ILMOITTAMO_OPENCAST_PASS = (Local Opencast password)

ILMOITTAMO_EMAIL_SENDER_HOST = (Local email sender url)
ILMOITTAMO_EMAIL_SENDER_PORT = (Local email sender port)

## Start postgres as Docker container
docker run --name exp_videos_postgres -p 5432:5432 -e POSTGRES_PASSWORD=xxxxxxx -e POSTGRES_DB=expired_videos -d postgres:14-alpine

## Install application dependencies
npm install

## Start application:
node index.js

## Environments and deployments
### Local environment 
local environment communicates with postgres instance installed on your local environment using postgres alpine docker container 
local environment communicates with opencast instance installed on your local environment using docker container

### Development environment in OpenShift
main branch deploys to test Openshift project named Poistamo with labeling ilmoittamo-dev
dev environment communicates with postgres instance called poistamo_dev at possu.it.helsinki.fi
development environment communicates with Opencast test environment https://ocast-devel-a1.it.helsinki.fi

### Test environment in OpenShift
test branch deploys to test Openshift project named Poistamo with labeling imoittamo-test
test environment communicates with postgres instance called poistamo_test at possu.it.helsinki.fi
test environment communicates with devel Opencast https://ocast-a1-test.it.helsinki.fi (used for Version Switching)

### Production environment in OpenShift
prod branch deploys to production Openshift project named Poistamo with labeling ilmoittamo-prod
production environment communicates with postgres instance called poistamo at possu.it.helsinki.fi
production environment communicates with production Opencast https://webcast.it.helsinki.fi
