node {
   def repo = "navikt"
   def sourceapp = "bidrag-cucumber"
   def application = Application
 
    stage("#1: Checkout code") {
        cleanWs()

        withCredentials([usernamePassword(credentialsId: 'jenkinsPipeline', usernameVariable: 'USERNAME', passwordVariable: 'PASSWORD')]) {
            withEnv(['HTTPS_PROXY=http://webproxy-utvikler.nav.no:8088']) {
                sh(script: "git clone https://${USERNAME}:${PASSWORD}@github.com/${repo}/${sourceapp}.git .")
            }
        }
    }

    stage("#2: Build docker image") {
	if (sourceapp == application) {
       	    sh "npm install"
            sh "docker build -t ${application} ."
	}
    }

    stage("#3 Cucumber tests") {
        println("[INFO] Run cucumber tests for ${application}")
        withCredentials([usernamePassword(credentialsId: 'naisUploader', usernameVariable: 'USERNAME', passwordVariable: 'PASSWORD')]) {
            sh "docker run --rm -e fasit_user=${env.USERNAME} -e fasit_pass='${env.PASSWORD}' -v '${env.WORKSPACE}/cucumber/${application}':/cucumber bidrag-cucumber"
        }
    }

    stage("#4 Create reports") {
        cucumber buildStatus: 'UNSTABLE',
            fileIncludePattern: '${env.WORKSPACE}/cucumber/${application}/*.json',
            trendsLimit: 10
    }

}
