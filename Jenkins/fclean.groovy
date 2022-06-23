import jenkins.model.*
import hudson.model.*

int nb_delete = 0;
Jenkins.instance.getAllItems(AbstractProject.class).each { item ->
    if (item.fullName.startsWith("Public/")) {
        if (nb_delete == 0)
            println "----------"
        println "Deleted item \"" + item.name + "\"";
        item.delete();
        nb_delete += 1;
    }
}
if (nb_delete == 0) {
    println "No items to delete"
}
else if (nb_delete == 1) {
    println "Deleted " + nb_delete + " item";
    println "----------"
}
else {
    println "Deleted " + nb_delete + " items";
    println "----------"
}
