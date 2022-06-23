// FOLDERS

folder("Tools") {
    displayName("Tools")
    description("Folder for miscellaneous tools.")
}

folder("Public") {
    displayName("Public")
    description("Folder for webhook'd repos.")
}

// JOBS

freeStyleJob('Tools/SendReport') {
    displayName('Send Tests Report')
    description('Send tests report to an user who triggered a job')
    concurrentBuild()
    parameters {
        stringParam("COMMIT_HASH", "", "The commit that triggered the job")
        stringParam("MODULE", "", "Module of the triggered job project.")
        stringParam("PROJECT", "", "Triggered job project.")
        stringParam("DISCORD_SNOWFLAKE", "", "Discord Snowflake ID of the user to send the report to.")
        stringParam("REPORT_AS_JSON", "", "Report file as JSON.")
    }
    steps {
        shell('curl -X POST -H "Content-Type: application/json" -d "$REPORT_AS_JSON" "http://Discord:80/report/$MODULE/$PROJECT/$DISCORD_SNOWFLAKE?commit_hash=$COMMIT_HASH"')
    }
}
