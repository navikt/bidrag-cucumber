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
            }
        }
    }

    stage("#2: Build docker image") {
        if (Image == "true") {
            println("[INFO] Build ${sourceapp} image")
            sh "npm install"
            sh "docker build -t ${sourceapp} ."
        }
    }

    stage("#3 Cucumber tests") {
        println("[INFO] Run cucumber tests")
        def project = Image == "true" ? "bidrag-cucumber" : ""
        if (Testuser == "true") {
            withCredentials([
                    usernamePassword(credentialsId: 'naisUploader', usernameVariable: 'USERNAME', passwordVariable: 'PASSWORD'),
                    usernamePassword(credentialsId: 'testUser', usernameVariable: 'TEST_USER', passwordVariable: 'TEST_PASS')
                ]) {
                sh (script: "docker run --rm -e test_user=${Username} -e test_pass='${Password}' -e fasit_user=${env.USERNAME} -e fasit_pass='${env.PASSWORD}' -e project=${project} -v '${env.WORKSPACE}/cucumber':/cucumber bidrag-cucumber", returnStatus:true)
            }
        } else {
            withCredentials([usernamePassword(credentialsId: 'naisUploader', usernameVariable: 'USERNAME', passwordVariable: 'PASSWORD')]) {
                sh (script: "docker run --rm -e fasit_user=${env.USERNAME} -e fasit_pass='${env.PASSWORD}' -e project=${project} -v '${env.WORKSPACE}/cucumber':/cucumber bidrag-cucumber", returnStatus:true)
            }
        }
    }

    stage("#4 Create reports") {
        println("[INFO] Create cucumber reports")
        cucumber buildStatus: 'UNSTABLE', fileIncludePattern:'**/cucumber.json'
    }

}

