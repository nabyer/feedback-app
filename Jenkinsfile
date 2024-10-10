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
                echo 'Checking out code...'
                git url: "${GITHUB_REPO}", branch: 'main'
            }            
        }
        stage('Run Unit Tests') {
            steps {
                echo 'Running unit tests...'
                container('node') {
                    sh '''
                        npm install
                        npm test  -- --maxWorkers=50%
                    '''
                }
                echo 'Unit tests completed successfully.'
            }
        }       
        stage('Docker Build') {   
            steps {
                echo 'Building the Docker image...'
                container('docker') {
                    sh 'docker build -t $DOCKER_IMAGE .'
                }
                echo 'Docker build successful.'
            }    
        }
        stage('Docker Push') {
            steps {
                echo 'Pushing the Docker image to Docker Hub...'
                container('docker') {
                    script {
                        docker.withRegistry('', "${DOCKER_CREDENTIALS_ID}") {
                            sh 'docker push $DOCKER_IMAGE'
                        }
                    }  
                }
                echo 'Docker image pushed successfully.'
            }
        }
        stage('Kubernetes Deploy App Dependencies') {
            steps {
                echo 'Deploying API dependencies to kubernetes cluster...'
                container('kubectl') {
                    sh 'kubectl apply -f kubernetes/secret.yaml'
                    sh 'kubectl apply -f kubernetes/configmap.yaml'
                    sh 'kubectl apply -f kubernetes/database-volume.yaml'
                    sh 'kubectl apply -f kubernetes/database-deployment.yaml'
                } 
                echo 'Deployment successful.'
            }
        }
        stage('Kubernetes Deploy App') {
            steps {
                echo 'Deleting previous App deployment...'
                container('kubectl') {
                    sh '''
                        kubectl delete deployment feedback-app-api || true  
                    '''
                } 
                echo 'Previous App deployment deleted successfully.'
                echo 'Creating new App deployment...'
                container('kubectl') {
                    script {
                        sh '''
                            sed -i "s|image: galaataman/feedback-app:latest|image: $DOCKER_IMAGE|g" kubernetes/api-deployment.yaml
                        '''
                        sh '''
                            kubectl apply -f kubernetes/api-deployment.yaml
                            kubectl rollout status deployment feedback-app-api --timeout=300s
                        '''
                    }
                } 
                echo 'New App deployment created successfully.'
            }
        }
        stage('Check App Status') {
            steps {
                echo 'Waiting for the App to become reachable...'
                container('kubectl') {
                    script {
                        def retries = 30
                        def delay = 10
                        def url = "http://feedback-app-api-service:3000/feedback" 

                        for (int i = 0; i < retries; i++) {
                            def result = sh(script: "curl -s -o /dev/null -w '%{http_code}' $url", returnStatus: true)
                            
                            if (result == 0) {
                                def http_code = sh(script: "curl -s -o /dev/null -w '%{http_code}' $url", returnStdout: true).trim()
                                echo "App health check attempt ${i + 1}: HTTP $http_code"
                                if (http_code == '200') {
                                    echo 'App is reachable!'
                                    break
                                }
                            } else {
                                echo "App is not reachable yet (attempt ${i + 1}). Retrying in ${delay} seconds..."
                            }
                            
                            if (i == retries - 1) {
                                error 'App is still unreachable after multiple attempts.'
                            }
                            sleep delay
                        }
                    }
                }
            }
        }
        stage('Run Integration Tests') {
            steps {
                echo 'Running integration tests...'
                container('k6') {
                    sh 'k6 run --env BASE_URL=http://feedback-app-api-service:3000 --verbose ./tests/feedback-api.integration.js'
                }
                echo 'Integration tests completed successfully.'
            }
        }
    }
    post {
        always {
            echo 'Post: DockerHub URL...'
            script {
                def dockerHubUrl = "https://hub.docker.com/r/${DOCKER_REPO}/tags?name=${IMAGE_TAG}"
                echo "DockerHub URL for the image: ${dockerHubUrl}"
                writeFile file: 'dockerhub-url.txt', text: dockerHubUrl
                archiveArtifacts artifacts: 'dockerhub-url.txt'
            }
        }

        success {
            echo 'Integration tests succeeded, tagging the image with "latest"...'
            container('docker') {
                script {
                    docker.withRegistry('', "${DOCKER_CREDENTIALS_ID}") {
                        sh "docker tag ${DOCKER_IMAGE} ${DOCKER_REPO}:latest"
                        sh "docker push ${DOCKER_REPO}:latest"
                    }
                }
            }
            echo 'Docker image successfully pushed with "latest" tag.'
        }
    }   
}