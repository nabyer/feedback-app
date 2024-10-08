#!/bin/bash

# Define variables
DOCKER_IMAGE_NAME="galaataman/k6"
DOCKERFILE_NAME="k6_dockerfile"
DOCKER_TAG="latest"

# Check if the Dockerfile exists
if [[ ! -f "$DOCKERFILE_NAME" ]]; then
    echo "Error: Dockerfile '$DOCKERFILE_NAME' not found!"
    exit 1
fi

# Build the Docker image
echo "Building Docker image: $DOCKER_IMAGE_NAME:$DOCKER_TAG"
docker build -f $DOCKERFILE_NAME -t $DOCKER_IMAGE_NAME:$DOCKER_TAG .

# Check if the build was successful
if [[ $? -ne 0 ]]; then
    echo "Error: Docker image build failed!"
    exit 1
fi

# Push the Docker image to DockerHub
echo "Pushing Docker image to DockerHub: $DOCKER_IMAGE_NAME:$DOCKER_TAG"
docker push $DOCKER_IMAGE_NAME:$DOCKER_TAG

# Check if the push was successful
if [[ $? -ne 0 ]]; then
    echo "Error: Docker image push failed!"
    exit 1
fi

echo "Docker image successfully built and pushed: $DOCKER_IMAGE_NAME:$DOCKER_TAG"