pipeline {
    agent {
        kubernetes {
            label 'jenkins-docker-agent'
            yamlFile 'kubernetes_jenkins/jenkins-pod-template.yaml'
        }
    }

    triggers {
        pollSCM('H/2 * * * *')
    }
    
    environment {
        GITHUB_REPO = 'https://github.com/atamankina/feedback-app.git'        
        DOCKER_CREDENTIALS_ID = 'dockerhub-token'
        DOCKER_REPO = 'galaataman/feedback-app'
        IMAGE_TAG = "${BUILD_NUMBER}"
        DOCKER_IMAGE = "${DOCKER_REPO}:${IMAGE_TAG}"
    }
    
    stages {        
        stage('Checkout') {           
            steps {
                git url: "${GITHUB_REPO}", branch: 'main'
            }            
        }       
        stage('Docker Build') {   
            steps {
                echo 'Building the app...'
                container('docker') {
                    sh 'docker build -t $DOCKER_IMAGE .'
                }
                echo 'Build successful.'
            }    
        }
        stage('Docker Push') {
            steps {
                echo 'Pushing the image to Docker Hub...'
                container('docker') {
                    script {
                        docker.withRegistry('', "${DOCKER_CREDENTIALS_ID}") {
                            sh 'docker push $DOCKER_IMAGE'
                        }
                    }  
                }
                echo 'Push successful.'
            }
        }
        stage('Kubernetes Deploy Dependencies') {
            steps {
                echo 'Deploying to kubernetes cluster...'
                container('kubectl') {
                    sh 'kubectl apply -f kubernetes/secret.yaml'
                    sh 'kubectl apply -f kubernetes/configmap.yaml'
                    sh 'kubectl apply -f kubernetes/database-volume.yaml'
                    sh 'kubectl apply -f kubernetes/database-deployment.yaml'
                } 
                echo 'Deployment successful.'
            }
        }
        stage('Kubernetes Deploy API') {
            steps {
                echo 'Deploying to kubernetes cluster...'
                container('kubectl') {
                    script {
                        sh 'sed -i "s|image: galaataman/feedback-app:latest|image: $DOCKER_IMAGE|g" kubernetes/api-deployment.yaml'
                        sh 'kubectl apply -f kubernetes/api-deployment.yaml'
                    }
                } 
                echo 'Deployment successful.'
            }
        }
        stage('Check App Status') {
            steps {
                echo 'Checking if the App is reachable...'
                script {
                    def retries = 30
                    def delay = 10
                    def url = "http://feedback-app-api-service:3000/feedback"

                    for (int i = 0; i < retries; i++) {
                        def result = sh(script: "curl -s -o /dev/null -w '%{http_code}' $url", returnStdout: true).trim()

                        if (result == '200') {
                            echo 'App is reachable!'
                            break
                        } else {
                            echo "App health check ${i + 1}: HTTP $result . Retrying in ${delay} seconds."
                        }

                        if (i == retries -1) {
                            error "App is unreachable after ${retries} attempts."
                        }

                        sleep delay
                    }
                }
            }
        }
        stage('Integration Tests') {
            steps {
                echo 'Running integration tests...'
                container('k6') {
                    sh 'k6 run --env BASE_URL=http://feedback-app-api-service:3000 ./tests/feedback-api.integration.js'
                }
                echo 'Integration tests ready.'
            }
        }
    }

    post {
        always {
            echo 'Post: DockerHub URL...'
            script {
                def dockerHubUrl = "https://hub.docker.com/r/${DOCKER_REPO}/tags?name=${IMAGE_TAG}"
                echo "DockerHub URL for the build: ${dockerHubUrl}"

            }
        }
        success {
            echo 'Build successful, pushing the image as latest...'
            container('docker') {
                script {
                    docker.withRegistry('', "${DOCKER_CREDENTIALS_ID}") {
                        sh "docker tag ${DOCKER_IMAGE} ${DOCKER_REPO}:latest"
                        sh "docker push ${DOCKER_REPO}:latest"
                    }
                }
            }
            echo 'The latest Docker image successfully updated.'
        }
    }   
}