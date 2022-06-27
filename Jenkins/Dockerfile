FROM jenkins/jenkins:2.356-jdk11

ENV JAVA_OPTS "-Dorg.jenkinsci.plugins.durabletask.BourneShellScript.LAUNCH_DIAGNOSTICS=true -Dpermissive-script-security.enabled=true -Djenkins.install.runSetupWizard=false -Xmx4096m -Djava.awt.headless=true"
ENV CASC_JENKINS_CONFIG /var/configuration.yml

USER root
RUN apt-get -y update && \
    apt-get -y install ca-certificates curl gnupg lsb-release

RUN mkdir -p /etc/apt/keyrings && \
    curl -fsSL https://download.docker.com/linux/debian/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg && \
    echo \
    "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/debian \
    $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null

RUN apt-get -y update && \
    apt-get -y install docker-ce docker-ce-cli containerd.io docker-compose-plugin

COPY plugins.txt /usr/share/jenkins/ref/plugins.txt
RUN jenkins-plugin-cli --plugin-file /usr/share/jenkins/ref/plugins.txt
