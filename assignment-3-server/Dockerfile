# Create a new build stage from the node:22.14.0-alpine3.21 base image.
FROM node:22.14.0-alpine3.21

# Set the working directory as /app.
WORKDIR /app

# Copy tgz file into the app directory.
COPY server-1.0.0.tgz .

# Run npm install inside the container during the image-building process.
RUN npm install server-1.0.0.tgz

# Copy files into the app directory.
COPY . .

# Compare the package.json files.
RUN cmp package.json node_modules/server/package.json

# Move the node modules into the app directory.
RUN mv node_modules new_node_modules
RUN mv new_node_modules/server/node_modules .

# Create a new user with no password, no admin privileges and no home directory.
RUN adduser -D -H user

# Give all users r-x permissions but no w permission for the app directory.
RUN chmod 555 -R /app

# Give owner r-x-w permissions and everyone else no permissions for the home directory.
RUN chmod 700 -R /home

# Set the running user in the container as user.
USER user

# Run the application.
CMD ["node", "server.js"]