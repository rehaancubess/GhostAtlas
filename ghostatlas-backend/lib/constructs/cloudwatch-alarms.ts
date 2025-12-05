import * as cdk from 'aws-cdk-lib';
import * as cloudwatch from 'aws-cdk-lib/aws-cloudwatch';
import * as cloudwatch_actions from 'aws-cdk-lib/aws-cloudwatch-actions';
import * as sns from 'aws-cdk-lib/aws-sns';
import * as sns_subscriptions from 'aws-cdk-lib/aws-sns-subscriptions';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as sqs from 'aws-cdk-lib/aws-sqs';
import { Construct } from 'constructs';
import { EnvironmentConfig } from '../config';

export interface CloudWatchAlarmsProps {
  environment: string;
  config: EnvironmentConfig;
  lambdaFunctions: {
    submitEncounter: lambda.Function;
    getEncounters: lambda.Function;
    getAllEncounters: lambda.Function;
    getEncounterById: lambda.Function;
    rateEncounter: lambda.Function;
    verifyLocation: lambda.Function;
    adminListPending: lambda.Function;
    adminApprove: lambda.Function;
    adminReject: lambda.Function;
  };
  api: apigateway.RestApi;
  encountersTable: dynamodb.Table;
  verificationsTable: dynamodb.Table;
  ratingsTable: dynamodb.Table;
  enhancementDLQ: sqs.Queue;
}

/**
 * Construct that creates CloudWatch Alarms for monitoring the GhostAtlas backend
 * 
 * Alarms:
 * - Lambda error rates >5% in 5 minutes
 * - API Gateway 5xx errors
 * - DynamoDB throttling
 * - SQS DLQ messages
 * - Enhancement pipeline failures
 * 
 * Requirements: 11.5
 */
export class CloudWatchAlarms extends Construct {
  public readonly alarmTopic: sns.Topic;

  constructor(scope: Construct, id: string, props: CloudWatchAlarmsProps) {
    super(scope, id);

    // Create SNS topic for alarm notifications
    this.alarmTopic = new sns.Topic(this, 'AlarmTopic', {
      topicName: `ghostatlas-alarms-${props.environment}`,
      displayName: `GhostAtlas Alarms (${props.environment})`,
    });

    // Subscribe email to alarm topic if configured
    if (props.config.monitoring.alarmEmail) {
      this.alarmTopic.addSubscription(
        new sns_subscriptions.EmailSubscription(props.config.monitoring.alarmEmail)
      );
    }

    // Create alarm action
    const alarmAction = new cloudwatch_actions.SnsAction(this.alarmTopic);

    // Lambda Error Rate Alarms (>5% in 5 minutes)
    // Requirement 11.5: Monitor Lambda error rates
    const lambdaFunctions = [
      { name: 'SubmitEncounter', fn: props.lambdaFunctions.submitEncounter },
      { name: 'GetEncounters', fn: props.lambdaFunctions.getEncounters },
      { name: 'GetEncounterById', fn: props.lambdaFunctions.getEncounterById },
      { name: 'RateEncounter', fn: props.lambdaFunctions.rateEncounter },
      { name: 'VerifyLocation', fn: props.lambdaFunctions.verifyLocation },
      { name: 'AdminListPending', fn: props.lambdaFunctions.adminListPending },
      { name: 'AdminApprove', fn: props.lambdaFunctions.adminApprove },
      { name: 'AdminReject', fn: props.lambdaFunctions.adminReject },
    ];

    lambdaFunctions.forEach(({ name, fn }) => {
      // Error rate alarm
      const errorMetric = fn.metricErrors({
        statistic: cloudwatch.Stats.SUM,
        period: cdk.Duration.minutes(5),
      });

      const invocationMetric = fn.metricInvocations({
        statistic: cloudwatch.Stats.SUM,
        period: cdk.Duration.minutes(5),
      });

      // Calculate error rate as percentage
      const errorRateMetric = new cloudwatch.MathExpression({
        expression: '(errors / invocations) * 100',
        usingMetrics: {
          errors: errorMetric,
          invocations: invocationMetric,
        },
        period: cdk.Duration.minutes(5),
      });

      const errorRateAlarm = new cloudwatch.Alarm(this, `${name}ErrorRateAlarm`, {
        alarmName: `ghostatlas-${props.environment}-${name}-error-rate`,
        alarmDescription: `${name} Lambda function error rate exceeds 5% in 5 minutes`,
        metric: errorRateMetric,
        threshold: 5,
        evaluationPeriods: 1,
        comparisonOperator: cloudwatch.ComparisonOperator.GREATER_THAN_THRESHOLD,
        treatMissingData: cloudwatch.TreatMissingData.NOT_BREACHING,
      });

      errorRateAlarm.addAlarmAction(alarmAction);

      // Throttle alarm
      const throttleMetric = fn.metricThrottles({
        statistic: cloudwatch.Stats.SUM,
        period: cdk.Duration.minutes(5),
      });

      const throttleAlarm = new cloudwatch.Alarm(this, `${name}ThrottleAlarm`, {
        alarmName: `ghostatlas-${props.environment}-${name}-throttles`,
        alarmDescription: `${name} Lambda function is being throttled`,
        metric: throttleMetric,
        threshold: 1,
        evaluationPeriods: 1,
        comparisonOperator: cloudwatch.ComparisonOperator.GREATER_THAN_OR_EQUAL_TO_THRESHOLD,
        treatMissingData: cloudwatch.TreatMissingData.NOT_BREACHING,
      });

      throttleAlarm.addAlarmAction(alarmAction);
    });

    // API Gateway 5xx Error Alarm
    // Requirement 11.5: Monitor API Gateway errors
    const api5xxMetric = new cloudwatch.Metric({
      namespace: 'AWS/ApiGateway',
      metricName: '5XXError',
      dimensionsMap: {
        ApiName: props.api.restApiName,
      },
      statistic: cloudwatch.Stats.SUM,
      period: cdk.Duration.minutes(5),
    });

    const api5xxAlarm = new cloudwatch.Alarm(this, 'Api5xxErrorAlarm', {
      alarmName: `ghostatlas-${props.environment}-api-5xx-errors`,
      alarmDescription: 'API Gateway is returning 5xx errors',
      metric: api5xxMetric,
      threshold: 5,
      evaluationPeriods: 1,
      comparisonOperator: cloudwatch.ComparisonOperator.GREATER_THAN_THRESHOLD,
      treatMissingData: cloudwatch.TreatMissingData.NOT_BREACHING,
    });

    api5xxAlarm.addAlarmAction(alarmAction);

    // API Gateway 4xx Error Alarm (for monitoring)
    const api4xxMetric = new cloudwatch.Metric({
      namespace: 'AWS/ApiGateway',
      metricName: '4XXError',
      dimensionsMap: {
        ApiName: props.api.restApiName,
      },
      statistic: cloudwatch.Stats.SUM,
      period: cdk.Duration.minutes(5),
    });

    const api4xxAlarm = new cloudwatch.Alarm(this, 'Api4xxErrorAlarm', {
      alarmName: `ghostatlas-${props.environment}-api-4xx-errors`,
      alarmDescription: 'API Gateway is returning high rate of 4xx errors',
      metric: api4xxMetric,
      threshold: 50,
      evaluationPeriods: 2,
      comparisonOperator: cloudwatch.ComparisonOperator.GREATER_THAN_THRESHOLD,
      treatMissingData: cloudwatch.TreatMissingData.NOT_BREACHING,
    });

    api4xxAlarm.addAlarmAction(alarmAction);

    // DynamoDB Throttling Alarms
    // Requirement 11.5: Monitor DynamoDB throttling
    const tables = [
      { name: 'Encounters', table: props.encountersTable },
      { name: 'Verifications', table: props.verificationsTable },
      { name: 'Ratings', table: props.ratingsTable },
    ];

    tables.forEach(({ name, table }) => {
      // Read throttle events
      const readThrottleMetric = table.metricUserErrors({
        statistic: cloudwatch.Stats.SUM,
        period: cdk.Duration.minutes(5),
      });

      const readThrottleAlarm = new cloudwatch.Alarm(this, `${name}ReadThrottleAlarm`, {
        alarmName: `ghostatlas-${props.environment}-${name}-read-throttle`,
        alarmDescription: `${name} table is experiencing read throttling`,
        metric: readThrottleMetric,
        threshold: 5,
        evaluationPeriods: 1,
        comparisonOperator: cloudwatch.ComparisonOperator.GREATER_THAN_THRESHOLD,
        treatMissingData: cloudwatch.TreatMissingData.NOT_BREACHING,
      });

      readThrottleAlarm.addAlarmAction(alarmAction);

      // System errors (includes throttling)
      const systemErrorMetric = table.metricSystemErrorsForOperations({
        operations: [dynamodb.Operation.GET_ITEM, dynamodb.Operation.PUT_ITEM, dynamodb.Operation.QUERY],
        statistic: cloudwatch.Stats.SUM,
        period: cdk.Duration.minutes(5),
      });

      const systemErrorAlarm = new cloudwatch.Alarm(this, `${name}SystemErrorAlarm`, {
        alarmName: `ghostatlas-${props.environment}-${name}-system-errors`,
        alarmDescription: `${name} table is experiencing system errors`,
        metric: systemErrorMetric,
        threshold: 5,
        evaluationPeriods: 1,
        comparisonOperator: cloudwatch.ComparisonOperator.GREATER_THAN_THRESHOLD,
        treatMissingData: cloudwatch.TreatMissingData.NOT_BREACHING,
      });

      systemErrorAlarm.addAlarmAction(alarmAction);
    });

    // SQS Dead Letter Queue Alarm
    // Requirement 11.5: Monitor enhancement pipeline failures
    const dlqMessagesMetric = props.enhancementDLQ.metricApproximateNumberOfMessagesVisible({
      statistic: cloudwatch.Stats.MAXIMUM,
      period: cdk.Duration.minutes(5),
    });

    const dlqAlarm = new cloudwatch.Alarm(this, 'EnhancementDLQAlarm', {
      alarmName: `ghostatlas-${props.environment}-enhancement-dlq-messages`,
      alarmDescription: 'Enhancement pipeline has messages in Dead Letter Queue',
      metric: dlqMessagesMetric,
      threshold: 1,
      evaluationPeriods: 1,
      comparisonOperator: cloudwatch.ComparisonOperator.GREATER_THAN_OR_EQUAL_TO_THRESHOLD,
      treatMissingData: cloudwatch.TreatMissingData.NOT_BREACHING,
    });

    dlqAlarm.addAlarmAction(alarmAction);

    // Add tags
    cdk.Tags.of(this.alarmTopic).add('Project', 'GhostAtlas');
    cdk.Tags.of(this.alarmTopic).add('Environment', props.environment);
    cdk.Tags.of(this.alarmTopic).add('Component', 'monitoring');

    // CloudFormation Outputs
    new cdk.CfnOutput(this, 'AlarmTopicArn', {
      value: this.alarmTopic.topicArn,
      description: 'ARN of the CloudWatch Alarms SNS topic',
      exportName: `${props.environment}-AlarmTopicArn`,
    });
  }
}
