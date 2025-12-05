#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { GhostAtlasBackendStack } from '../lib/ghostatlas-backend-stack';
import { getConfig } from '../lib/config';

const app = new cdk.App();

// Get environment from context (defaults to 'dev')
const environment = app.node.tryGetContext('environment') || 'dev';
const config = getConfig(environment);

// Create the main stack
new GhostAtlasBackendStack(app, config.stackName, {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION || 'us-east-1',
  },
  environment,
  config,
  description: `GhostAtlas Backend Stack for ${environment} environment`,
  tags: {
    Environment: environment,
    Project: 'GhostAtlas',
    CostCenter: 'GhostAtlas-Backend',
    ManagedBy: 'CDK',
  },
  terminationProtection: environment === 'prod', // Enable termination protection for production
});
