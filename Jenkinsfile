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
            sh script: "export FEATURE_PREFIX=${FeaturePrefix}."
            sh (script: "docker run --rm -e NODE_TLS_REJECT_UNAUTHORIZED=0 -e environment=${NaisEnvironment} -e test_user=${env.TEST_USER} -e test_pass='${env.TEST_PASS}' -e fasit_user=${env.USERNAME} -e fasit_pass='${env.PASSWORD}' -e project=${env.FEATURE_PREFIX} -v '${env.WORKSPACE}':/src -w /src node:latest npm start", returnStatus:true)
        }
    }

    stage("#4 Cucumber tests with kotlin") {
        println("[INFO] Run cucumber tests with kotlin")

        sh script: 'if [ "${FeaturePrefix}" != "*" ] ; then export DO_TEST=\'test -Dcucumber.options=\'--tags "@bidrag-cucumber or @${FeaturePrefix}"\'\' ; else ; export DO_TEST=test ; fi'
        println("[INFO] running kotlin cucumber like $DO_TEST")

        withCredentials([
                usernamePassword(credentialsId: 'naisUploader', usernameVariable: 'USERNAME', passwordVariable: 'PASSWORD'),
                usernamePassword(credentialsId: TestUserID, usernameVariable: 'TEST_USER', passwordVariable: 'TEST_PASS')
            ]) {
            try {
                sh(script:"docker run --rm -v '${env.WORKSPACE}':/usr/src/mymaven -w /usr/src/mymaven " +
                          "-v $JENKINS_HOME/.m2:/root/.m2 maven:3.6.1-jdk-12 " +
                          "mvn clean $DO_TEST"
                )
            } catch(err) {
                // no failures... always write report
            }
        }
    }

    stage("#5 Create cucumber report") {
        println("[INFO] Create cucumber reports")

        withCredentials([
                usernamePassword(credentialsId: 'naisUploader', usernameVariable: 'USERNAME', passwordVariable: 'PASSWORD'),
                usernamePassword(credentialsId: TestUserID, usernameVariable: 'TEST_USER', passwordVariable: 'TEST_PASS')
            ]) {
            sh (script: "docker run --rm " +
                        "-e environment=${NaisEnvironment} " +
                        "-e fasit_user=${env.USERNAME} " +
                        "-e fasit_pass='${env.PASSWORD}' " +
                        "-v '${env.WORKSPACE}':/src " +
                        "-w /src mv /cucumber/cucumber.json /target/cucumber-node.json",
                         returnStatus:true
            )
        }

        sh(script:"docker run --rm -v '${env.WORKSPACE}':/usr/src/mymaven -w /usr/src/mymaven " +
                  "-v $JENKINS_HOME/.m2:/root/.m2 maven:3.6.1-jdk-12 " +
                  "mvn cluecumber-report:reporting"
        )

        cucumber buildStatus: 'UNSTABLE', fileIncludePattern:'**/cucumber.json'

        def msg = sh(script: "node slackMessage.js", returnStdout: true).trim()
        def startedBy = "unknown"

        try {
            startedBy = currentBuild.rawBuild.getCause(Cause.UserIdCause).getUserId()
        } catch(err) {}

        if(startedBy == "jenkins") {
            if (msg.length() > 0) {
                def color = msg.indexOf('FAILED') == -1 ? 'good' : '#FF0000'
                slackSend color: color, message: msg
            }
        } else {
            println("StartedBy: ${startedBy} - ${msg}")
        }
    }
}
