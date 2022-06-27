# Shared Marvin
A shared Jenkins instance to run tests for Epitech's projects.
## Usage
### Use an instance
To use the shared Marvin, you need to setup a webhook on your GitHub repository.<br />
Your repository MUST be public (so Jenkins can clone it).<br />
URL of the webhook: `http://localhost:80/webhook/:Module/:Project/:Snowflake`<br />
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
| DOCKER_SOCK_PATH | Path to the Docker socket (docker.sock file) |
| DOCUMENTATION_URL | Link to the documentation (here) |
| BLACKLISTED_SNOWFLAKES | A list of string of blacklisted users |
| SSL | Boolean, enable https in report link if true |
| DOMAIN | Domain of the instance (ex: `localhost` or `marvin.com`) |

### Run the bot & the instance
Open a shell in your Marvin directory and run `docker-compose up`<br />
If you've completed the configuration right, you should have your own instance !

## Supported projects in this instance
#### Semester 0
#### Semester 1
###### B-BOO-101 - Bootcamp Phoenix
- [ ] [phoenixd01](https://github.com/SharedMarvin/B-BOO-101-phoenixd01)
- [ ] [phoenixd02](https://github.com/SharedMarvin/B-BOO-101-phoenixd02)
- [ ] [phoenixd03](https://github.com/SharedMarvin/B-BOO-101-phoenixd03)
- [ ] [phoenixd04](https://github.com/SharedMarvin/B-BOO-101-phoenixd04)
- [ ] [phoenixd05](https://github.com/SharedMarvin/B-BOO-101-phoenixd05)
###### B-CPE-100 - Unix & C Lab Seminar (Part I)
- [ ] [cpoolday01](https://github.com/SharedMarvin/B-CPE-100-cpoolday01)
- [ ] [cpoolday02](https://github.com/SharedMarvin/B-CPE-100-cpoolday02)
- [ ] [cpoolday03](https://github.com/SharedMarvin/B-CPE-100-cpoolday03)
- [ ] [cpoolday04](https://github.com/SharedMarvin/B-CPE-100-cpoolday04)
- [ ] [cpoolday05](https://github.com/SharedMarvin/B-CPE-100-cpoolday05)
- [ ] [cpoolday06](https://github.com/SharedMarvin/B-CPE-100-cpoolday06)
- [ ] [cpoolday07](https://github.com/SharedMarvin/B-CPE-100-cpoolday07)
- [ ] [cpoolday08](https://github.com/SharedMarvin/B-CPE-100-cpoolday08)
- [ ] [cpoolday09](https://github.com/SharedMarvin/B-CPE-100-cpoolday09)
- [ ] [cpoolday10](https://github.com/SharedMarvin/B-CPE-100-cpoolday10)
- [ ] [cpoolday11](https://github.com/SharedMarvin/B-CPE-100-cpoolday11)
- [ ] [cpoolday12](https://github.com/SharedMarvin/B-CPE-100-cpoolday12)
- [ ] [cpoolday13](https://github.com/SharedMarvin/B-CPE-100-cpoolday13)
- [ ] [rush1](https://github.com/SharedMarvin/B-CPE-100-rush1)
- [ ] [rush2](https://github.com/SharedMarvin/B-CPE-100-rush2)
- [ ] [star](https://github.com/SharedMarvin/B-CPE-100-star)
- [ ] [firtree](https://github.com/SharedMarvin/B-CPE-100-firtree)
- [ ] [countisland](https://github.com/SharedMarvin/B-CPE-100-countisland)
- [ ] [Cworkshoplib](https://github.com/SharedMarvin/B-CPE-100-Cworkshoplib)
###### B-CPE-101 - Unix & C Lab Seminar (Part II)
- [ ] [infinadd](https://github.com/SharedMarvin/B-CPE-101-infinadd)
- [ ] [bistromatic](https://github.com/SharedMarvin/B-CPE-101-bistromatic)
- [ ] [evalexpr](https://github.com/SharedMarvin/B-CPE-101-evalexpr)
- [ ] [finalstumper](https://github.com/SharedMarvin/B-CPE-101-finalstumper)
###### B-CPE-110 - Elementary Programming in C
- [ ] [bsbsq](https://github.com/SharedMarvin/B-CPE-110-bsbsq)
- [ ] [BSQ](https://github.com/SharedMarvin/B-CPE-110-BSQ)
- [ ] [pushswap](https://github.com/SharedMarvin/B-CPE-110-pushswap)
- [ ] [antman](https://github.com/SharedMarvin/B-CPE-110-antman)
###### B-MAT-100 - Mathematics
- [ ] [101pong](https://github.com/SharedMarvin/B-MAT-100-101pong)
- [ ] [102architect](https://github.com/SharedMarvin/B-MAT-100-102architect)
- [ ] [103cipher](https://github.com/SharedMarvin/B-MAT-100-103cipher)
- [ ] [104intersection](https://github.com/SharedMarvin/B-MAT-100-104intersection)
- [ ] [105torus](https://github.com/SharedMarvin/B-MAT-100-105torus)
###### B-MUL-100 - C Graphical Programming
- [ ] [myhunter](https://github.com/SharedMarvin/B-MUL-100-myhunter)
- [ ] [myscreensaver](https://github.com/SharedMarvin/B-MUL-100-myscreensaver)
- [ ] [myrunner](https://github.com/SharedMarvin/B-MUL-100-myrunner)
- [ ] [myradar](https://github.com/SharedMarvin/B-MUL-100-myradar)
###### B-PSU-100 - Unix System Programming (Part I)
- [ ] [bsmyprintf](https://github.com/SharedMarvin/B-PSU-100-bsmyprintf)
- [ ] [myprintf](https://github.com/SharedMarvin/B-PSU-100-myprintf)
- [ ] [bsmyls](https://github.com/SharedMarvin/B-PSU-100-bsmyls)
- [ ] [myls](https://github.com/SharedMarvin/B-PSU-100-myls)
###### B-PSU-101 - Unix System Programming (Part II)
- [ ] [bsnavy](https://github.com/SharedMarvin/B-PSU-101-bsnavy)
- [ ] [navy](https://github.com/SharedMarvin/B-PSU-101-navy)
- [ ] [bsminishell1](https://github.com/SharedMarvin/B-PSU-101-bsminishell1)
- [ ] [minishell1](https://github.com/SharedMarvin/B-PSU-101-minishell1)
#### Semester 2
#### Semester 3
#### Semester 4
#### Semester 5
#### Semester 6
#### Others
Tests wrote for debug, testing, templating...
###### M-OTH-420
- [ ] [ctemplate](https://github.com/SharedMarvin/M-OTH-420-ctemplate)
- [ ] [ctemplatewref](https://github.com/SharedMarvin/M-OTH-420-ctemplatewref)
- [ ] [csfmltemplate](https://github.com/SharedMarvin/M-OTH-420-csfmltemplate)
- [ ] [cpptemplate](https://github.com/SharedMarvin/M-OTH-420-cpptemplate)
- [ ] [cpptemplatewref](https://github.com/SharedMarvin/M-OTH-420-cpptemplatewref)
- [x] [success](https://github.com/SharedMarvin/M-OTH-420-success)
- [x] [failure](https://github.com/SharedMarvin/M-OTH-420-failure)
- [x] [both](https://github.com/SharedMarvin/M-OTH-420-both) (success & failure)
- [x] [badbuild](https://github.com/SharedMarvin/M-OTH-420-badbuild)
