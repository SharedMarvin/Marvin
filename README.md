# Our Marvin
A shared Jenkins instance to run tests for Epitech's projects.
## Usage
### Use an instance
To use the shared Marvin, you need to setup a webhook on your GitHub repository.<br />
Your repository MUST be public (so Jenkins can clone it).<br />
URL of the webhook: `http://localhost:80/webhook/:Module/:Project/:Snowflake`<br />
We already have one instance : `https://marvin.lqvrent.fr/webhook/:Module/:Project/:Snowflake`<br />
Parameters :<br />
- `Module` is the name of the module (ex: `B-PSU-210`)
- `Project` is the name of the project (ex: `42sh`)
- `Snowflake` is a Discord User ID (ex: `235090646946283520`), you can get yours by executing the `/id` command with the bot on Discord.
The webhook only accept `push`, `pull_request` and `ping` events.<br />
In the webhook panel, you can see requests made by GitHub, if a request fails, you can see why by viewing the response of Marvin.<br />
If tests doesn't exists for this project, the request will fail. We ask you to remove the webhook if this is the case.<br />
You MUST be on the Discord server, otherwise the bot can't identify you.

### Writing tests
In the organization, you must have an repository with name : "$Module-$Project".<br />
At the root, you MUST have a `manifest.json`, with the required data to run the tests.<br />
Here's an example of a manifest.json :<br />
```json
{
    "module": "B-PSU-210",
    "project": "42sh",
    "agent-image": "epitechcontent/epitest-docker:latest",
    "build-commands": [
        "make",
        "make clean"
    ],
    "skills": [
        {
            "name": "01 - basic tests",
            "tests": [
               {
                    "name": "Empty",
                    "command": "./tester.sh -test 1",
                    "expected": "^OK"
               },
               {
                    "name": "Simple command",
                    "command": "./tester.sh -test 2",
                    "expected": "^OK"
               }
            ]
        }
    ]
}
```
The `agent-image` property is the Docker image used to run the tests, we recommand you to use the epitest image.<br />
All the content of the tests repository will be available in the job, so you can create a .sh (like in the example) to run tests.<br />
In the example, the `tester.sh` MUST print only `^OK`, otherwise the tests will be marked as failed, and the output will be used as trace for the student.
## Host your own Marvin
### Configuration
Rename the `sample.env` to `.env`, so Docker-compose can use values inside.
| Name | Description |
|--|--|
| JENKINS_ADMIN_ID | Administrator ID in Jenkins (used to log in) |
| JENKINS_ADMIN_NAME | Display name for the admin in Jenkins, not important |
| JENKINS_ADMIN_PASSWORD | Admin's password (a strong password is recommanded) |
| JENKINS_NG_AGENTS | Number of tests nodes, (default : 3) you can add more if you have a powerful machine |
| JENKINS_API_TOKEN | Launch your instance, go to http://localhost:8080/user/JENKINS_ADMIN_ID/configure and create an API token |
| DISCORD_TOKEN | Your Discord bot token |
| DISCORD_CLIENTID | Your Discord bot Client ID |
| GITHUB_ORGANIZATION | Organization name on GitHub |
| GITHUB_TOKEN | Your GitHub token (Can be generated on https://github.com/settings/tokens) |
| GITHUB_RUNNER_REPOSITORY | Repository name in the organization |
| RUNNER_SETUP_CMD | Runner command to build the project |
| RUNNER_BUILD_CMD | Runner command to build the project |
| RUNNER_TESTS_CMD | Runner command to run the tests |
| DOCKER_SOCK_PATH | Path to the Docker socket (docker.sock file) |
| DOCUMENTATION_URL | Link to the documentation (here) |
### Run the bot & the instance
Open a shell in your Marvin directory and run `docker-compose up`<br />
If you've completed the configuration right, you should have your own instance !
