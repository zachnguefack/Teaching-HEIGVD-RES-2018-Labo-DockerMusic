FROM node:4.3.1
MAINTAINER Olivier Liechti <olivier.liechti@heig-vd.ch>

#
# When we build the image, we copy the executable jar in the image file system. 
#
COPY src /opt/src/

WORKDIR /opt/src/
RUN npm install

ENTRYPOINT ["node", "/opt/src/app.js"]
