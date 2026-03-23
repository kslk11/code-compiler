pipeline {
    agent any

    environment {
        FRONTEND_IMAGE = "frontend-app"
        BACKEND_IMAGE = "backend-app"
        FRONTEND_CONTAINER = "frontend-container"
        BACKEND_CONTAINER = "backend-container"
        NETWORK = "app-network"
    }

    stages {

        stage('Clone Repo') {
            steps {
                git 'https://github.com/kslk11/code-compiler.git'
            }
        }

        // 🔥 BUILD RUNNER IMAGES (CRITICAL)
        stage('Build Runner Images') {
            steps {
                sh '''
                docker build -t runner-python ./runner-python
                docker build -t runner-js ./runner-js
                docker build -t runner-java ./runner-java
                '''
            }
        }

        // 🔹 CREATE NETWORK
        stage('Create Network') {
            steps {
                sh 'docker network create $NETWORK || true'
            }
        }

        // 🔹 BUILD FRONTEND
        stage('Build Frontend Image') {
            steps {
                dir('frontend') {
                    sh 'docker build -t $FRONTEND_IMAGE .'
                }
            }
        }

        // 🔹 BUILD BACKEND
        stage('Build Backend Image') {
            steps {
                dir('backend') {
                    sh 'docker build -t $BACKEND_IMAGE .'
                }
            }
        }

        // 🔹 CLEAN OLD CONTAINERS
        stage('Clean Old Containers') {
            steps {
                sh '''
                docker rm -f $FRONTEND_CONTAINER || true
                docker rm -f $BACKEND_CONTAINER || true
                '''
            }
        }

        // 🔥 RUN BACKEND (FIXED)
        stage('Run Backend') {
            steps {
                sh '''
                docker run -d \
                --name $BACKEND_CONTAINER \
                --network $NETWORK \
                -p 5001:5001 \
                -v /var/run/docker.sock:/var/run/docker.sock \
                $BACKEND_IMAGE
                '''
            }
        }

        // 🔹 RUN FRONTEND
        stage('Run Frontend') {
            steps {
                sh '''
                docker run -d \
                --name $FRONTEND_CONTAINER \
                --network $NETWORK \
                -p 3000:80 \
                $FRONTEND_IMAGE
                '''
            }
        }
    }
}