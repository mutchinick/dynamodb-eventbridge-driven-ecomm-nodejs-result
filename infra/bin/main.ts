#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib'
import 'source-map-support/register'
import { MainStack } from '../lib/MainStack'

const prefix = process.env.CONFIG_PREFIX
if (!prefix) {
  const error = new Error(`Invalid prefix '${prefix}'`)
  console.error(error)
  throw error
}

const stage = process.env.STAGE
if (!stage) {
  const error = new Error(`Invalid stage '${stage}'`)
  console.error(error)
  throw error
}

const qualifier = `${prefix}-${stage}`
const app = new cdk.App()
new MainStack(app, qualifier, {
  env: {
    account: '355320011200',
    region: 'us-east-1',
  },
  tags: {
    qualifier,
    prefix,
  },
  config: {
    prefix,
  },
})
