pipeline {
  agent any

  environment {
    COMPOSE_PROJECT_NAME = "clinic-workflow"
  }

  stages {

    stage('Clone repo') {
      steps {
        checkout scm
      }
    }

    stage('Install dependencies') {
      steps {
        dir('backend') {
          sh 'npm install'
        }
        dir('frontend') {
          sh 'npm install'
        }
      }
    }

    stage('Build frontend') {
  steps {
    dir('frontend') {
      sh '''
      npm install
      chmod +x node_modules/.bin/vite
      npm run build
      '''
    }
  }
}

    stage('Run backend smoke check') {
      steps {
        dir('backend') {
          sh '''
          node -e "require('./src/app'); console.log('Backend app bootstrapped successfully')"
          '''
        }
      }
    }

    stage('Build Docker images') {
      steps {
        sh 'docker compose build'
      }
    }

    stage('Deploy containers') {
      steps {
        sh 'docker compose down || true'
        sh 'docker compose up -d'
      }
    }
  }

  post {
    always {
      sh 'docker compose ps'
    }
  }
}
