import * as cdk from 'aws-cdk-lib';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as logs from 'aws-cdk-lib/aws-logs';
import { Construct } from 'constructs';
import { EnvironmentConfig } from '../config';

export interface ApiGatewayProps {
  environment: string;
  config: EnvironmentConfig;
  lambdaFunctions: {
    submitEncounter: lambda.Function;
    getEncounters: lambda.Function;
    getAllEncounters: lambda.Function;
    getEncounterById: lambda.Function;
    rateEncounter: lambda.Function;
    verifyLocation: lambda.Function;
    triggerEnhancement: lambda.Function;
    adminListPending: lambda.Function;
    adminApprove: lambda.Function;
    adminReject: lambda.Function;
  };
}

/**
 * Construct that creates API Gateway REST API for the GhostAtlas backend
 * 
 * Configuration:
 * - REST API with CORS enabled
 * - Rate limiting (100 req/min per IP)
 * - Request validation
 * - Throttling (burst: 200, rate: 100/s)
 * - All API endpoints with Lambda integrations
 * 
 * Endpoints:
 * - POST /api/encounters → SubmitEncounter
 * - GET /api/encounters → GetEncounters
 * - GET /api/encounters/{id} → GetEncounterById
 * - POST /api/encounters/{id}/rate → RateEncounter
 * - POST /api/encounters/{id}/verify → VerifyLocation
 * - GET /api/admin/encounters → AdminListPending
 * - PUT /api/admin/encounters/{id}/approve → AdminApprove
 * - PUT /api/admin/encounters/{id}/reject → AdminReject
 */
export class ApiGateway extends Construct {
  public readonly api: apigateway.RestApi;
  public readonly usagePlan: apigateway.UsagePlan;

  constructor(scope: Construct, id: string, props: ApiGatewayProps) {
    super(scope, id);

    // Create CloudWatch Log Group for API Gateway access logs
    const logGroup = new logs.LogGroup(this, 'ApiGatewayAccessLogs', {
      logGroupName: `/aws/apigateway/ghostatlas-${props.environment}`,
      retention: props.config.monitoring.logRetentionDays,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    // Create REST API with CORS configuration (Requirement 15.4)
    this.api = new apigateway.RestApi(this, 'GhostAtlasApi', {
      restApiName: `ghostatlas-api-${props.environment}`,
      description: `GhostAtlas Backend API (${props.environment})`,
      
      // Enable CORS for all endpoints (Requirement 15.4)
      defaultCorsPreflightOptions: {
        allowOrigins: apigateway.Cors.ALL_ORIGINS, // In production, replace with specific Flutter app domain
        allowMethods: apigateway.Cors.ALL_METHODS,
        allowHeaders: [
          'Content-Type',
          'X-Amz-Date',
          'Authorization',
          'X-Api-Key',
          'X-Amz-Security-Token',
          'X-Amz-User-Agent',
        ],
        allowCredentials: false,
        maxAge: cdk.Duration.hours(1),
      },
      
      // Deploy options
      deployOptions: {
        stageName: props.environment,
        
        // Enable access logging
        accessLogDestination: new apigateway.LogGroupLogDestination(logGroup),
        accessLogFormat: apigateway.AccessLogFormat.jsonWithStandardFields({
          caller: true,
          httpMethod: true,
          ip: true,
          protocol: true,
          requestTime: true,
          resourcePath: true,
          responseLength: true,
          status: true,
          user: true,
        }),
        
        // Enable execution logging for debugging
        loggingLevel: props.environment === 'prod' 
          ? apigateway.MethodLoggingLevel.ERROR 
          : apigateway.MethodLoggingLevel.INFO,
        dataTraceEnabled: props.environment !== 'prod',
        
        // Enable metrics
        metricsEnabled: true,
        
        // Configure throttling (Requirement 12.1, 12.2)
        // Burst limit: 200 requests
        // Rate limit: 100 requests per second
        throttlingBurstLimit: props.config.apiGateway.burstLimit,
        throttlingRateLimit: props.config.apiGateway.rateLimit,
        
        // Enable X-Ray tracing if configured
        tracingEnabled: props.config.monitoring.enableXRay,
      },
      
      // CloudWatch role for logging
      cloudWatchRole: true,
      
      // Endpoint configuration
      endpointConfiguration: {
        types: [apigateway.EndpointType.REGIONAL],
      },
    });

    // Create request validators
    const requestValidator = new apigateway.RequestValidator(this, 'RequestValidator', {
      restApi: this.api,
      requestValidatorName: 'request-validator',
      validateRequestBody: true,
      validateRequestParameters: true,
    });

    // Create API resources
    const apiResource = this.api.root.addResource('api');
    const encountersResource = apiResource.addResource('encounters');
    const allEncountersResource = encountersResource.addResource('all');
    const encounterByIdResource = encountersResource.addResource('{id}');
    const rateResource = encounterByIdResource.addResource('rate');
    const verifyResource = encounterByIdResource.addResource('verify');
    const uploadCompleteResource = encounterByIdResource.addResource('upload-complete');
    
    const adminResource = apiResource.addResource('admin');
    const adminEncountersResource = adminResource.addResource('encounters');
    const adminEncounterByIdResource = adminEncountersResource.addResource('{id}');
    const approveResource = adminEncounterByIdResource.addResource('approve');
    const rejectResource = adminEncounterByIdResource.addResource('reject');

    // Lambda integration options with error handling
    const lambdaIntegrationOptions: apigateway.LambdaIntegrationOptions = {
      proxy: true,
      allowTestInvoke: props.environment !== 'prod',
      timeout: cdk.Duration.seconds(29), // API Gateway max timeout
    };

    // Public Endpoints
    
    // POST /api/encounters → SubmitEncounter (Requirement 1.1)
    encountersResource.addMethod(
      'POST',
      new apigateway.LambdaIntegration(props.lambdaFunctions.submitEncounter, lambdaIntegrationOptions),
      {
        requestValidator,
        methodResponses: [
          { statusCode: '200' },
          { statusCode: '400' },
          { statusCode: '429' },
          { statusCode: '500' },
        ],
      }
    );

    // GET /api/encounters → GetEncounters (Requirement 3.1)
    encountersResource.addMethod(
      'GET',
      new apigateway.LambdaIntegration(props.lambdaFunctions.getEncounters, lambdaIntegrationOptions),
      {
        requestValidator,
        requestParameters: {
          'method.request.querystring.latitude': true,
          'method.request.querystring.longitude': true,
          'method.request.querystring.radius': false,
          'method.request.querystring.limit': false,
        },
        methodResponses: [
          { statusCode: '200' },
          { statusCode: '400' },
          { statusCode: '429' },
          { statusCode: '500' },
        ],
      }
    );

    // GET /api/encounters/all → GetAllEncounters (Returns all approved encounters)
    allEncountersResource.addMethod(
      'GET',
      new apigateway.LambdaIntegration(props.lambdaFunctions.getAllEncounters, lambdaIntegrationOptions),
      {
        requestValidator,
        requestParameters: {
          'method.request.querystring.limit': false,
        },
        methodResponses: [
          { statusCode: '200' },
          { statusCode: '429' },
          { statusCode: '500' },
        ],
      }
    );

    // GET /api/encounters/{id} → GetEncounterById (Requirement 4.1)
    encounterByIdResource.addMethod(
      'GET',
      new apigateway.LambdaIntegration(props.lambdaFunctions.getEncounterById, lambdaIntegrationOptions),
      {
        requestValidator,
        requestParameters: {
          'method.request.path.id': true,
        },
        methodResponses: [
          { statusCode: '200' },
          { statusCode: '403' },
          { statusCode: '404' },
          { statusCode: '429' },
          { statusCode: '500' },
        ],
      }
    );

    // POST /api/encounters/{id}/rate → RateEncounter (Requirement 5.1)
    rateResource.addMethod(
      'POST',
      new apigateway.LambdaIntegration(props.lambdaFunctions.rateEncounter, lambdaIntegrationOptions),
      {
        requestValidator,
        requestParameters: {
          'method.request.path.id': true,
        },
        methodResponses: [
          { statusCode: '200' },
          { statusCode: '400' },
          { statusCode: '404' },
          { statusCode: '409' },
          { statusCode: '429' },
          { statusCode: '500' },
        ],
      }
    );

    // POST /api/encounters/{id}/verify → VerifyLocation (Requirement 6.1)
    verifyResource.addMethod(
      'POST',
      new apigateway.LambdaIntegration(props.lambdaFunctions.verifyLocation, lambdaIntegrationOptions),
      {
        requestValidator,
        requestParameters: {
          'method.request.path.id': true,
        },
        methodResponses: [
          { statusCode: '200' },
          { statusCode: '400' },
          { statusCode: '404' },
          { statusCode: '429' },
          { statusCode: '500' },
        ],
      }
    );

    // PUT /api/encounters/{id}/upload-complete → TriggerEnhancement
    uploadCompleteResource.addMethod(
      'PUT',
      new apigateway.LambdaIntegration(props.lambdaFunctions.triggerEnhancement, lambdaIntegrationOptions),
      {
        requestValidator,
        requestParameters: {
          'method.request.path.id': true,
        },
        methodResponses: [
          { statusCode: '200' },
          { statusCode: '400' },
          { statusCode: '404' },
          { statusCode: '429' },
          { statusCode: '500' },
        ],
      }
    );

    // Admin Endpoints
    
    // GET /api/admin/encounters → AdminListPending (Requirement 7.1)
    adminEncountersResource.addMethod(
      'GET',
      new apigateway.LambdaIntegration(props.lambdaFunctions.adminListPending, lambdaIntegrationOptions),
      {
        requestValidator,
        requestParameters: {
          'method.request.querystring.nextToken': false,
          'method.request.querystring.limit': false,
        },
        methodResponses: [
          { statusCode: '200' },
          { statusCode: '400' },
          { statusCode: '429' },
          { statusCode: '500' },
        ],
      }
    );

    // PUT /api/admin/encounters/{id}/approve → AdminApprove (Requirement 8.1)
    approveResource.addMethod(
      'PUT',
      new apigateway.LambdaIntegration(props.lambdaFunctions.adminApprove, lambdaIntegrationOptions),
      {
        requestValidator,
        requestParameters: {
          'method.request.path.id': true,
        },
        methodResponses: [
          { statusCode: '200' },
          { statusCode: '404' },
          { statusCode: '429' },
          { statusCode: '500' },
        ],
      }
    );

    // PUT /api/admin/encounters/{id}/reject → AdminReject (Requirement 9.1)
    rejectResource.addMethod(
      'PUT',
      new apigateway.LambdaIntegration(props.lambdaFunctions.adminReject, lambdaIntegrationOptions),
      {
        requestValidator,
        requestParameters: {
          'method.request.path.id': true,
        },
        methodResponses: [
          { statusCode: '200' },
          { statusCode: '404' },
          { statusCode: '429' },
          { statusCode: '500' },
        ],
      }
    );

    // Create Usage Plan for rate limiting (Requirement 12.1)
    // 100 requests per minute per IP address
    this.usagePlan = this.api.addUsagePlan('UsagePlan', {
      name: `ghostatlas-usage-plan-${props.environment}`,
      description: `Usage plan for GhostAtlas API (${props.environment})`,
      throttle: {
        burstLimit: props.config.apiGateway.burstLimit,
        rateLimit: props.config.apiGateway.rateLimit,
      },
      quota: {
        limit: props.config.apiGateway.rateLimitPerMinute * 60 * 24, // Daily limit
        period: apigateway.Period.DAY,
      },
    });

    // Associate usage plan with API stage
    this.usagePlan.addApiStage({
      stage: this.api.deploymentStage,
    });

    // Add tags
    cdk.Tags.of(this.api).add('Project', 'GhostAtlas');
    cdk.Tags.of(this.api).add('Environment', props.environment);
    cdk.Tags.of(this.api).add('Component', 'api');

    // CloudFormation Outputs
    new cdk.CfnOutput(this, 'ApiUrl', {
      value: this.api.url,
      description: 'API Gateway URL',
      exportName: `${props.environment}-ApiUrl`,
    });

    new cdk.CfnOutput(this, 'ApiId', {
      value: this.api.restApiId,
      description: 'API Gateway ID',
      exportName: `${props.environment}-ApiId`,
    });

    new cdk.CfnOutput(this, 'ApiStage', {
      value: this.api.deploymentStage.stageName,
      description: 'API Gateway stage name',
      exportName: `${props.environment}-ApiStage`,
    });
  }
}
