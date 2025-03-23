#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib'
import 'source-map-support/register'
import { MainStack } from '../lib/MainStack'

const deploymentPrefix = process.env.DEPLOYMENT_PREFIX
if (!deploymentPrefix) {
  const error = new Error(`Invalid deployment prefix '${deploymentPrefix}'`)
  console.error(error)
  throw error
}

const deploymentStage = process.env.DEPLOYMENT_STAGE
if (!deploymentStage) {
  const error = new Error(`Invalid deployment stage '${deploymentStage}'`)
  console.error(error)
  throw error
}

const qualifier = `${deploymentPrefix}-${deploymentStage}`
const app = new cdk.App()
new MainStack(app, qualifier, {
  env: {
    account: '355320011200',
    region: 'us-east-1',
  },
  tags: {
    qualifier,
    deploymentPrefix,
  },
  config: {
    deploymentPrefix,
  },
})
