import { execSync } from 'node:child_process'
import { exit } from 'process'

// Get the prefix
const prefix = process.env.npm_package_config_prefix
console.info(`cdk-runner: prefix = ${prefix}`)
if (!prefix) {
  console.error('Missing config.prefix in package.json file')
  exit(1)
}

// Get the cdk command
const cdkCommand = process.argv[2]
console.info(`cdk-runner: command = ${cdkCommand}`)
if (!cdkCommand) {
  console.error('Missing cdk command. Example: "npm run <cdk-command> <stage>"')
  exit(1)
}

// Validate the cdk command
const cdkAvailableCommands: string[] = ['bootstrap', 'synth', 'deploy', 'destroy']
if (!cdkAvailableCommands.includes(cdkCommand)) {
  console.error(`Invalid cdk command. Available: '${cdkAvailableCommands.join(', ')}'`)
  exit(1)
}

// Get the stage
const stage = process.argv[3] || process.env.STAGE
console.info(`cdk-runner: stage = ${stage}`)
if (!stage) {
  console.error('Missing stage. Example: "npm run <cdk-command> <stage>"')
  exit(1)
}

// Pass or omit the profile (useful for pipelines)
const cdkOmitProfile = Boolean(process.env.CDK_OMIT_PROFILE)
const profileParams = cdkOmitProfile ? '' : `--profile ${prefix}-${stage}`

// Require or omit the approval
const cdkOmitApproval = Boolean(process.env.CDK_OMIT_APPROVAL)
const approvalParams = cdkOmitApproval ? '--require-approval never' : ''

execSync(
  `cross-env NODE_ENV=p CONFIG_PREFIX=${prefix} STAGE=${stage} cdk ${cdkCommand} ${approvalParams} ${profileParams}`,
  {
    stdio: [0, 1, 2],
  },
)
