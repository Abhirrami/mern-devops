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
          bat 'call npm install'
        }
        dir('frontend') {
          bat 'call npm install'
        }
      }
    }

    stage('Build frontend') {
      steps {
        dir('frontend') {
          bat 'call npm run build'
        }
      }
    }

    stage('Run backend smoke check') {
      steps {
        dir('backend') {
          bat 'node -e "require(''./src/app''); console.log(''Backend app bootstrapped successfully'')"'
        }
      }
    }

    stage('Build Docker images') {
      steps {
        bat 'docker compose build'
      }
    }

    stage('Deploy containers') {
      steps {
        bat 'docker compose down'
        bat 'docker compose up -d'
      }
    }
  }

  post {
    always {
      bat 'docker compose ps'
    }
  }
}
