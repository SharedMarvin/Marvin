FROM jenkins/jenkins:2.357-jdk11

ENV JAVA_OPTS "-Dorg.jenkinsci.plugins.durabletask.BourneShellScript.LAUNCH_DIAGNOSTICS=true -Dpermissive-script-security.enabled=true -Djenkins.install.runSetupWizard=false -Xmx4096m -Djava.awt.headless=true"
ENV CASC_JENKINS_CONFIG /var/configuration.yml

USER root
COPY plugins.txt /usr/share/jenkins/ref/plugins.txt
RUN jenkins-plugin-cli --plugin-file /usr/share/jenkins/ref/plugins.txt
