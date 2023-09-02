#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { EksPipelineStack } from '../lib/eks-pipeline-stack';

const app = new cdk.App();
new EksPipelineStack(app, 'EksPipelineStack', {
  env: { account: process.env.CDK_DEFAULT_ACCOUNT, region: process.env.CDK_DEFAULT_REGION },
});

app.synth()
