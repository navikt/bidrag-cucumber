node {
   def repo = "navikt"
   def sourceapp = "bidrag-cucumber"

    stage("#1: Checkout code") {
        println("[INFO] Clean workspace")
        cleanWs()

        println("[INFO] Checkout ${sourceapp}")
        withCredentials([usernamePassword(credentialsId: 'jenkinsPipeline', usernameVariable: 'USERNAME', passwordVariable: 'PASSWORD')]) {
            withEnv(['HTTPS_PROXY=http://webproxy-utvikler.nav.no:8088']) {
                sh(script: "git clone https://${USERNAME}:${PASSWORD}@github.com/${repo}/${sourceapp}.git .")
                sh(script: "git checkout ${BRANCH}", returnStatus:true)
            }
        }
    }

    stage("#2: npm install") {
        dir("${env.WORKSPACE}") {
            sh(script: "npm install")
        }
    }

    stage("#3 Cucumber tests") {
        println("[INFO] Run cucumber tests using test user: ${TestUserID}")
        withCredentials([
                usernamePassword(credentialsId: 'naisUploader', usernameVariable: 'USERNAME', passwordVariable: 'PASSWORD'),
                usernamePassword(credentialsId: TestUserID, usernameVariable: 'TEST_USER', passwordVariable: 'TEST_PASS')
            ]) {
            sh (script: "docker run --rm -e NODE_TLS_REJECT_UNAUTHORIZED=0 -e environment=${NaisEnvironment} -e test_user=${env.TEST_USER} -e test_pass='${env.TEST_PASS}' -e fasit_user=${env.USERNAME} -e fasit_pass='${env.PASSWORD}' -e project=${FeaturePrefix} -v '${env.WORKSPACE}':/src -w /src node:latest npm start", returnStatus:true)
        }
    }

    stage("#4 Create reports") {
        println("[INFO] Create cucumber reports")
        cucumber buildStatus: 'UNSTABLE', fileIncludePattern:'**/cucumber.json'
        def msg = sh(script: "node slackMessage.js", returnStdout: true).trim()
        if (msg.length() > 0) {
            def color = msg.indexOf('FAILED') == -1 ? 'good' : '#FF0000'
            slackSend color: color, message: msg
        }
    }


}

