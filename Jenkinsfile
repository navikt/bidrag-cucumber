node {
   def repo = "navikt"
   def application = "bidrag-cucumber"
 
    stage("#1: Checkout code") {
        cleanWs()

        withCredentials([usernamePassword(credentialsId: 'jenkinsPipeline', usernameVariable: 'USERNAME', passwordVariable: 'PASSWORD')]) {
            withEnv(['HTTPS_PROXY=http://webproxy-utvikler.nav.no:8088']) {
                sh(script: "git clone https://${USERNAME}:${PASSWORD}@github.com/${repo}/${application}.git .")
            }
        }
    }

    stage("#2: Build docker image") {
        sh "npm install"
        sh "docker build -t ${application} ."
    }

    stage("#3 Cucumber tests") {
        println("[INFO] Run cucumber tests")
        withCredentials([usernamePassword(credentialsId: 'naisUploader', usernameVariable: 'USERNAME', passwordVariable: 'PASSWORD')]) {
            sh "docker run --rm -e fasit_user=${env.USERNAME} -e fasit_pass='${env.PASSWORD}' -v ${env.WORKSPACE}/cucumber:/cucumber bidrag-cucumber"
        }

        if(fileExists('cucumber/cucumber.json')) {
            cucumber buildStatus: 'UNSTABLE',
                fileIncludePattern: 'cucumber/*.json',
                trendsLimit: 10,
                classifications: [
                        [
                                'key'  : 'Browser',
                                'value': 'Firefox'
                        ]
                ]
        }

    }

}
