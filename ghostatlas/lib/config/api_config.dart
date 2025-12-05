/// API Configuration for different environments
class ApiConfig {
  // Environment selection
  static const Environment currentEnvironment = Environment.dev;

  // Get the base URL for the current environment
  static String get baseUrl {
    switch (currentEnvironment) {
      case Environment.dev:
        return 'https://yj3dszj0vh.execute-api.us-east-1.amazonaws.com/dev';
      case Environment.staging:
        return 'https://api-staging.ghostatlas.com'; // Update when staging is deployed
      case Environment.production:
        return 'https://api.ghostatlas.com'; // Update when production is deployed
      case Environment.local:
        return 'http://localhost:3000'; // For local development
    }
  }

  // CloudFront CDN URL for media assets
  static String get cdnUrl {
    switch (currentEnvironment) {
      case Environment.dev:
        return 'https://d3r1sqvpmvqwaa.cloudfront.net';
      case Environment.staging:
        return 'https://cdn-staging.ghostatlas.com'; // Update when staging is deployed
      case Environment.production:
        return 'https://cdn.ghostatlas.com'; // Update when production is deployed
      case Environment.local:
        return 'http://localhost:3000';
    }
  }

  // Request configuration
  static const int maxRetries = 3;
  static const Duration retryDelay = Duration(seconds: 2);
  static const Duration requestTimeout = Duration(seconds: 30);

  // Feature flags
  static bool get enableAnalytics =>
      currentEnvironment == Environment.production;
  static bool get enableCrashReporting =>
      currentEnvironment != Environment.local;
  static bool get showDebugInfo =>
      currentEnvironment == Environment.dev ||
      currentEnvironment == Environment.local;
}

enum Environment { dev, staging, production, local }
