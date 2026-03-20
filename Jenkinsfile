pipeline {
    agent any

    environment {
        FRONTEND_IMAGE = "frontend-app"
        BACKEND_IMAGE = "backend-app"
        FRONTEND_CONTAINER = "frontend-container"
        BACKEND_CONTAINER = "backend-container"
    }

    stages {

        stage('Clone Repo') {
            steps {
                git 'https://github.com/kslk11/code-compiler.git'
            }
        }

        // 🔹 FRONTEND BUILD
        stage('Build Frontend Image') {
            steps {
                dir('frontend') {
                    sh 'docker build -t $FRONTEND_IMAGE .'
                }
            }
        }

        // 🔹 BACKEND BUILD
        stage('Build Backend Image') {
            steps {
                dir('backend') {
                    sh 'docker build -t $BACKEND_IMAGE .'
                }
            }
        }

        // 🔹 STOP OLD CONTAINERS
        stage('Stop Old Containers') {
            steps {
                sh '''
                docker stop $FRONTEND_CONTAINER || true
                docker rm $FRONTEND_CONTAINER || true
                docker stop $BACKEND_CONTAINER || true
                docker rm $BACKEND_CONTAINER || true
                '''
            }
        }

        // 🔹 RUN BACKEND
        stage('Run Backend') {
            steps {
                sh '''
                docker run -d -p 5000:5000 --name $BACKEND_CONTAINER $BACKEND_IMAGE
                '''
            }
        }

        // 🔹 RUN FRONTEND
        stage('Run Frontend') {
            steps {
                sh '''
                docker run -d -p 3000:80 --name $FRONTEND_CONTAINER $FRONTEND_IMAGE
                '''
            }
        }
    }
}