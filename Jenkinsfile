node {
   def repo = "navikt"
   def application = "bidrag-dokument-cucumber"
 
    stage("#1: checkout code") {
        cleanWs()
        withCredentials([string(credentialsId: 'OAUTH_TOKEN', variable: 'token')]) {
            withEnv(['HTTPS_PROXY=http://webproxy-utvikler.nav.no:8088']) {
                sh(script: "git clone https://${token}:x-oauth-basic@github.com/${repo}/${application}.git .")
            }
        }
    }

    stage("#2: Build docker image") {
        sh "npm install"
        sh "docker build -t ${application} ."
    }

}
