#!/bin/bash

# Build the image
docker build --platform linux/amd64 -t gcr.io/imagegenerationflux1/ecom-gen .

# Push the image to Google Container Registry
docker push gcr.io/imagegenerationflux1/ecom-gen

# Function to safely read .env file
read_dot_env() {
    if [[ -f .env ]]; then
        while IFS='=' read -r key temp || [ -n "$key" ]; do
            if [[ $key == \#* ]] || [[ -z "$key" ]]; then
                continue
            fi
            # Remove leading spaces
            value="${temp#"${temp%%[![:space:]]*}"}"
            # Remove trailing spaces
            value="${value%"${value##*[![:space:]]}"}"
            # Remove surrounding quotes if present
            value="${value%\"}"
            value="${value#\"}"
            # Escape special characters
            value=$(printf '%s' "$value" | sed 's/[&/\]/\\&/g')
            # Export the variable
            export "$key=$value"
        done < .env
    fi
}

# Read and export environment variables
read_dot_env

# Prepare environment variables for Cloud Run
ENV_VARS=""
while IFS='=' read -r key value
do
    # Skip comments and empty lines
    if [[ $key == \#* ]] || [[ -z "$key" ]]; then
        continue
    fi
    
    # Get the value from the environment
    value="${!key}"
    
    # Escape special characters in the value
    value=$(printf '%s' "$value" | sed 's/[&/\]/\\&/g')
    
    ENV_VARS+="$key=$value,"
done < .env

# Remove trailing comma
ENV_VARS=${ENV_VARS%,}


# Deploy to Google Cloud Run
gcloud run deploy ecom-gen \
  --image gcr.io/imagegenerationflux1/ecom-gen \
  --platform managed \
  --region europe-west1 \
  --allow-unauthenticated \