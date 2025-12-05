/**
 * Environment-specific configuration for GhostAtlas Backend
 */

export interface EnvironmentConfig {
  environment: string;
  stackName: string;
  apiGateway: {
    rateLimitPerMinute: number;
    burstLimit: number;
    rateLimit: number;
    stageName: string;
  };
  dynamodb: {
    billingMode: 'PAY_PER_REQUEST' | 'PROVISIONED';
    pointInTimeRecovery: boolean;
  };
  s3: {
    lifecycleTransitionDays: number;
    bucketPrefix: string;
  };
  cloudfront: {
    defaultTtl: number;
    minTtl: number;
    maxTtl: number;
  };
  lambda: {
    defaultMemorySize: number;
    defaultTimeout: number;
    reservedConcurrency?: number;
  };
  sqs: {
    messageRetentionDays: number;
    visibilityTimeout: number;
    receiveWaitTime: number;
    maxReceiveCount: number;
  };
  monitoring: {
    logRetentionDays: number;
    enableXRay: boolean;
    alarmEmail?: string;
    enableDetailedMetrics: boolean;
  };
  deployment: {
    enableBlueGreen: boolean;
    trafficShiftPercentage?: number;
    trafficShiftInterval?: number;
  };
  bedrock?: {
    region: string;
  };
}

const baseConfig: Omit<EnvironmentConfig, 'environment' | 'stackName' | 'monitoring' | 'deployment'> = {
  apiGateway: {
    rateLimitPerMinute: 100,
    burstLimit: 200,
    rateLimit: 100,
    stageName: 'api',
  },
  dynamodb: {
    billingMode: 'PAY_PER_REQUEST',
    pointInTimeRecovery: true,
  },
  s3: {
    lifecycleTransitionDays: 90,
    bucketPrefix: 'ghostatlas-media',
  },
  cloudfront: {
    defaultTtl: 86400, // 24 hours
    minTtl: 0,
    maxTtl: 31536000, // 1 year
  },
  lambda: {
    defaultMemorySize: 512,
    defaultTimeout: 10,
  },
  sqs: {
    messageRetentionDays: 14,
    visibilityTimeout: 600, // 10 minutes - must be >= 6x Lambda timeout (90s)
    receiveWaitTime: 20,
    maxReceiveCount: 3,
  },
};

const devConfig: EnvironmentConfig = {
  ...baseConfig,
  environment: 'dev',
  stackName: 'GhostAtlasBackendStack-dev',
  monitoring: {
    logRetentionDays: 7,
    enableXRay: false,
    enableDetailedMetrics: false,
  },
  deployment: {
    enableBlueGreen: false,
  },
  bedrock: {
    region: 'us-east-1',
  },
};

const stagingConfig: EnvironmentConfig = {
  ...baseConfig,
  environment: 'staging',
  stackName: 'GhostAtlasBackendStack-staging',
  monitoring: {
    logRetentionDays: 30,
    enableXRay: true,
    enableDetailedMetrics: true,
  },
  deployment: {
    enableBlueGreen: false,
  },
  bedrock: {
    region: 'us-east-1',
  },
};

const prodConfig: EnvironmentConfig = {
  ...baseConfig,
  environment: 'prod',
  stackName: 'GhostAtlasBackendStack-prod',
  lambda: {
    ...baseConfig.lambda,
    reservedConcurrency: 100, // Reserve concurrency for production
  },
  monitoring: {
    logRetentionDays: 30,
    enableXRay: true,
    enableDetailedMetrics: true,
    alarmEmail: process.env.ALARM_EMAIL,
  },
  deployment: {
    enableBlueGreen: true,
    trafficShiftPercentage: 10, // Shift 10% of traffic at a time
    trafficShiftInterval: 5, // Wait 5 minutes between shifts
  },
  bedrock: {
    region: 'us-east-1',
  },
};

export function getConfig(environment: string): EnvironmentConfig {
  switch (environment.toLowerCase()) {
    case 'dev':
    case 'development':
      return devConfig;
    case 'staging':
    case 'stage':
      return stagingConfig;
    case 'prod':
    case 'production':
      return prodConfig;
    default:
      console.warn(`Unknown environment: ${environment}, defaulting to dev`);
      return devConfig;
  }
}
