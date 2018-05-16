FROM node:6.10.2
MAINTAINER zacharie Nguefack <zacharie.nguefack@heig-vd.ch>

#
# When we build the image, we copy the executable js in the image file system.
#
ADD src /opt/src/

WORKDIR /opt/src/

RUN npm install

ENTRYPOINT ["node", "/opt/src/auditeur.js"]