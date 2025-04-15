import hudson.Util;
def current_stage
def build_duration_msg = "\n *Detail by Stage* \n"
def dockerImage

pipeline {
    agent any

    environment {
        NODE_VERSION = '20'
        DOCKER_IMAGE = 'frontend'
        AWS_REGION = 'ap-southeast-2'
        ECR_REPOSITORY = '016456419140.dkr.ecr.ap-southeast-2.amazonaws.com/taskmaster'
        IMAGE_TAG = "latest"
    }

    stages {
        stage('Setup Node Environment') {
            steps {
                script {
                    start = System.currentTimeMillis()
                    current_stage = env.STAGE_NAME
                    if (isUnix()) {
                        sh '''
                            npm install
                        '''
                    } else {
                        bat '''
                            npm install
                        '''
                    }
                    end = System.currentTimeMillis()
                    build_duration_msg = build_duration_msg + "*" + current_stage + "*" + " : " + Util.getTimeSpanString(end - start) + "\n"
                }
            }
        }

        stage('Run Tests') {
            steps {
                script {
                    start = System.currentTimeMillis()
                    current_stage = env.STAGE_NAME
                    if (isUnix()) {
                        sh '''
                            npm test -- --watchAll=false
                        '''
                    } else {
                        bat '''
                            npm test -- --coverage
                        '''
                    }
                    end = System.currentTimeMillis()
                    build_duration_msg = build_duration_msg + "*" + current_stage + "*" + " : " + Util.getTimeSpanString(end - start) + "\n"
                }
            }
        }

        stage('Build') {
            steps {
                script {
                    start = System.currentTimeMillis()
                    current_stage = env.STAGE_NAME
                    if (isUnix()) {
                        sh '''
                            npm run build
                        '''
                    } else {
                        bat '''
                            npm run build
                        '''
                    }
                    end = System.currentTimeMillis()
                    build_duration_msg = build_duration_msg + "*" + current_stage + "*" + " : " + Util.getTimeSpanString(end - start) + "\n"
                }
            }
        }

        stage('Build Docker Image') {
            steps {
                script {
                    start = System.currentTimeMillis()
                    current_stage = env.STAGE_NAME
                    sh """
                        docker build -t ${DOCKER_IMAGE}:${IMAGE_TAG} .
                    """
                    end = System.currentTimeMillis()
                    build_duration_msg = build_duration_msg + "*" + current_stage + "*" + " : " + Util.getTimeSpanString(end - start) + "\n"
                }
            }
        }

        stage('Push to AWS ECR') {
            steps {
                script {
                    start = System.currentTimeMillis()
                    current_stage = env.STAGE_NAME
                    sh """
                        aws ecr get-login-password --region ${AWS_REGION} | docker login --username AWS --password-stdin ${ECR_REPOSITORY}
                        docker tag ${DOCKER_IMAGE}:${IMAGE_TAG} ${ECR_REPOSITORY}/${DOCKER_IMAGE}:${IMAGE_TAG}
                        docker push ${ECR_REPOSITORY}/${DOCKER_IMAGE}:${IMAGE_TAG}
                    """
                    end = System.currentTimeMillis()
                    build_duration_msg = build_duration_msg + "*" + current_stage + "*" + " : " + Util.getTimeSpanString(end - start) + "\n"
                }
            }
        }

        stage('Clean Up') {
            steps {
                script {
                    start = System.currentTimeMillis()
                    current_stage = env.STAGE_NAME
                    sh """
                        docker rmi ${DOCKER_IMAGE}:${IMAGE_TAG}
                        docker system prune -f
                    """
                    end = System.currentTimeMillis()
                    build_duration_msg = build_duration_msg + "*" + current_stage + "*" + " : " + Util.getTimeSpanString(end - start) + "\n"
                }
            }
        }
    }

    post {
        always {
            script {
                build_duration_msg = build_duration_msg + "\n *Total build time:* " + "${currentBuild.durationString}".replaceAll(' and counting', "")
            }
            cleanWs()
        }
        success {
            script {
                current_stage = "Post Build"
                slackSend color: 'good', message: "[${env.JOB_NAME}][Branch : ${env.GIT_BRANCH}] [Stage :${current_stage}][Result: ${currentBuild.result}](<${env.BUILD_URL}|Detail>)${build_duration_msg}", tokenCredentialId: 'slack-group3-token'
            }
        }
        failure {
            slackSend color: 'danger', message: "[${env.JOB_NAME}][Rama : ${env.GIT_BRANCH}] [Stage :${current_stage}][Result:${currentBuild.result}](<${env.BUILD_URL}|Detail>)${build_duration_msg}", tokenCredentialId: 'slack-group3-token'
        }
    }
}