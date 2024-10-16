properties(
[pipelineTriggers()]
)


def FAILED_STAGE

pipeline {
    // agent { label "master" }
    agent any


    stages {


        stage('PREPARE') {

            steps {
                script {
                    FAILED_STAGE=env.STAGE_NAME
                    echo "PREPARE"
                }

            sh label: 'prepare', script:
            """
            prepare
            """



            sh label: 'notif starting', script:
            """
            notif start "${env.JOB_NAME} , Job No #${env.BUILD_NUMBER} ==> ${env.BUILD_URL}"
            """

            }

        }


        stage('CI/CD BY BRANCH') {
            when {
                anyOf {
                    branch 'master'
                    branch 'develop'
                    branch 'staging'
                    branch 'development'
                }
            }
            steps {

                script {
                    FAILED_STAGE=env.STAGE_NAME + ".-." + env.BRANCH_NAME
                    echo "${env.BRANCH_NAME}"
                }

                sh label: "${env.BRANCH_NAME}", script:
                """
                prepare-git ${env.BRANCH_NAME}
                devops ci ${env.BRANCH_NAME}
                devops cd ${env.BRANCH_NAME}
                """

            }

        }


        stage('CI/CD BY TAG') {
           when {
                expression {
			return (env.TAG_NAME && env.TAG_NAME.contains('rc') && !env.TAG_NAME.contains('v') && !env.TAG_NAME.contains('sandbox'))
                }
            }
            steps {

                script {
                    FAILED_STAGE=env.STAGE_NAME + ".-." + env.TAG_NAME
                    echo "${env.TAG_NAME}"

                }

                sh label: "${env.TAG_NAME}", script:
                """
                devops ci ${env.TAG_NAME}
                devops cd ${env.TAG_NAME}
                """

            }

        }





        stage('CI/CD SANDBOX') {
           when {
                expression {

                    return (env.TAG_NAME && env.TAG_NAME.contains('sandbox') && !env.TAG_NAME.contains('rc'))
                }
            }
            steps {

                script {
                    FAILED_STAGE=env.STAGE_NAME + ".-." + env.TAG_NAME
                    echo "${env.TAG_NAME}"

                }

                sh label: "${env.TAG_NAME}", script:
                """
                devops-sandbox ${env.TAG_NAME}
                """

            }

        }




        stage('RELESE VERSION') {
              when {
                  anyOf {
                      expression {
                          return (env.TAG_NAME && env.TAG_NAME.contains('v') && !env.TAG_NAME.contains('rc') && !env.TAG_NAME.contains('sandbox'))
                      }
                  }
              }

            steps {

                script {
                    FAILED_STAGE=env.STAGE_NAME + ".-." + env.TAG_NAME
                    echo "${env.TAG_NAME}"

                }


                sh label: "${env.TAG_NAME}", script:
                """
                devops ci ${env.TAG_NAME}
                """

            }

        }


        stage('APPROVE VERSION') {
              when {
                  anyOf {
                      expression {
                          return (env.TAG_NAME && env.TAG_NAME.contains('v') && !env.TAG_NAME.contains('rc') && !env.TAG_NAME.contains('sandbox'))
                      }
                  }
              }

            steps {

            sh label: 'notif waiting', script:
            """
            notif waiting "${env.JOB_NAME} , Job No #${env.BUILD_NUMBER}  ==> ${env.BUILD_URL}"
            """



            timeout(time: 3600, unit: 'SECONDS') {
            input message: 'Deploy to Production ? (Click "Proceed" to continue)'
                }


                script {
                    FAILED_STAGE=env.STAGE_NAME + ".-." + env.TAG_NAME
                    echo "${env.TAG_NAME}"

                }


                sh label: "${env.TAG_NAME}", script:
                """
                devops cd ${env.TAG_NAME}
                """

            }

        }




         stage("FINISING") {
             steps {
                 script {
                     FAILED_STAGE=env.STAGE_NAME
                     echo "FINISING"
                 }
                    //==================================
                    sh label: 'STEP FINISING', script:
                    """
                    finising
                    """
                    //==================================
             }
         }


//END stages
    }


//POST============================================================
    post {
        failure {
            // echo "Failed stage name: ${FAILED_STAGE}"

// notif failure
sh label: 'notif failure', script:
"""
notif fail "STEP ==> ${FAILED_STAGE} #${env.JOB_NAME} , Job No #${env.BUILD_NUMBER} is FAILURE ==> ${env.BUILD_URL}"
"""

//
        }

        success {

// notif success
sh label: 'notif success', script:
"""
notif success "${env.JOB_NAME} , Job No #${env.BUILD_NUMBER} is SUCCESS"
"""

        }

    }

//END pipeline
}