pipeline {
    agent any
  
    stages {
        stage('Build') {
            steps {
                
                sh '''
                echo 'Building... '
                docker-compose  build  build-agent
                '''
            }
        }
        stage('Test') {
            steps {
                sh '''
                echo 'Testing...'
                docker-compose  build  test-agent
                '''

            }
               post {
               
                failure {
                    echo 'Tests failed!'
                    emailext attachLog: true,
                    body: "${currentBuild.currentResult}: Job ${env.JOB_NAME} build ${env.BUILD_NUMBER}",
                    recipientProviders: [developers(), requestor()],
                    subject: "Tests failed",
                    to: 'aleksandra.furyk@gmail.com'
                }

                 success {
                    echo 'Susces!'
                    emailext attachLog: true,
                    body: "${currentBuild.currentResult}: Job ${env.JOB_NAME} build ${env.BUILD_NUMBER}",
                    recipientProviders: [developers(), requestor()],
                    subject: "Success",
                    to: 'aleksandra.furyk@gmail.com'
                }
            }
        }
        stage('Deploy') {
            steps {
                sh '''
                echo 'Deploying...'
                docker-compose  up -d build-agent
                '''
            }
               post {

                failure {
                    echo 'Depoly failed!'
                    emailext attachLog: true,
                    body: "${currentBuild.currentResult}: Job ${env.JOB_NAME} build ${env.BUILD_NUMBER}",
                    recipientProviders: [developers(), requestor()],
                    subject: "Depoly failed",
                    to: 'aleksandra.furyk@gmail.com'
                }

               
 
                    success {
                    echo 'Success!'
                    emailext attachLog: true,
                    body: "${currentBuild.currentResult}: Job ${env.JOB_NAME} build ${env.BUILD_NUMBER}",
                    recipientProviders: [developers(), requestor()],
                    subject: "Success",
                    to: 'aleksandra.furyk@gmail.com'
                }
            
               
            }
        }
    }
}