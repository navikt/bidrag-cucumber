node {
   def repo = "navikt"
   def application = env.Application
   def branch = env.Branch
   def ns = env.Namespace
 
    stage("#1: Checkout code") {
        cleanWs()

        println("[INFO] Application = ${application}, branch = ${branch}")

        withCredentials([usernamePassword(credentialsId: 'jenkinsPipeline', usernameVariable: 'USERNAME', passwordVariable: 'PASSWORD')]) {
            withEnv(['HTTPS_PROXY=http://webproxy-utvikler.nav.no:8088']) {
                sh(script: "git clone https://${USERNAME}:${PASSWORD}@github.com/${repo}/bidrag-cucumber.git .")
                sh(script: "git checkout ${branch}", returnStatus:true)
            }
        }
    }

    stage("#2 Cucumber tests") {
        println("[INFO] Run cucumber tests for ${application}")
        withCredentials([usernamePassword(credentialsId: 'naisUploader', usernameVariable: 'USERNAME', passwordVariable: 'PASSWORD')]) {
            sh "docker run --rm -e environment=${ns} -e fasit_user=${env.USERNAME} -e fasit_pass='${env.PASSWORD}' -e project=${application} -v ${env.WORKSPACE}/cucumber:/cucumber bidrag-cucumber"
        }

        if(fileExists('cucumber/cucumber.json')) {
            cucumber buildStatus: 'UNSTABLE',
                fileIncludePattern: 'cucumber/*.json',
                trendsLimit: 10
        }

    }

}
