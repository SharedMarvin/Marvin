FROM epitechcontent/epitest-docker:latest

RUN dnf -y install openssh-server git nodejs npm gcovr
RUN ssh-keygen -t rsa -f /etc/ssh/ssh_host_rsa_key -N ''                                                        \
    && sed -i 's/#UsePAM no/UsePAM no/g' /etc/ssh/sshd_config                                                   \
    && sed -i 's/#PermitRootLogin yes/PermitRootLogin yes/' /etc/ssh/sshd_config                                \
    && sed -i 's/#ChallengeResponseAuthentication yes/ChallengeResponseAuthentication no/' /etc/ssh/sshd_config \
    && sed -i 's/#PasswordAuthentication yes/PasswordAuthentication no/' /etc/ssh/sshd_config                   \
    && sed -i 's/#PubkeyAuthentication yes/PubkeyAuthentication yes/' /etc/ssh/sshd_config                      \
    && mkdir -p /root/.ssh                                                                                      \
    && sed -i 's+.ssh/authorized_keys+/root/.ssh/authorized_keys+' /etc/ssh/sshd_config                         \
    && touch /root/.ssh/authorized_keys                                                                         \
    && chmod --recursive 400 /root/.ssh                                                                         \
    && echo "StrictHostKeyChecking=no" > /root/.ssh/config                                                      \
    && echo "UserKnownHostsFile=/dev/null" >> /root/.ssh/config

EXPOSE 22
CMD ["/usr/sbin/sshd", "-D"]
