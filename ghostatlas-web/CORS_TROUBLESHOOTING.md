# CORS Troubleshooting Guide

## Issue
The web application is experiencing CORS (Cross-Origin Resource Sharing) errors when trying to access the AWS API Gateway, while the Flutter app works fine.

## Why Flutter Works But Web Doesn't

### Flutter (Mobile App)
- Makes direct HTTP requests from the device
- Not subject to browser CORS policies
- No preflight OPTIONS requests
- Works with any API endpoint

### Web Browser
- Enforces CORS security policy
- Requires server to explicitly allow cross-origin requests
- Sends OPTIONS preflight requests for certain requests
- Blocks requests if CORS headers are missing or incorrect

## Current API Gateway CORS Configuration

The API Gateway is configured with CORS in `api-gateway.ts`:

```typescript
defaultCorsPreflightOptions: {
  allowOrigins: apigateway.Cors.ALL_ORIGINS, // Allows all origins
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
}
```

Lambda functions also return CORS headers:

```typescript
headers: {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
  'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS'
}
```

## Testing CORS

### 1. Open the CORS Test Page
```bash
# Open in browser
open ghostatlas-web/test-cors.html
```

This will automatically run tests and show you:
- Whether requests are being blocked
- What CORS headers are being returned
- Whether OPTIONS preflight is working

### 2. Check Browser Console
Open DevTools (F12) and look for errors like:
```
Access to fetch at 'https://...' from origin 'http://localhost:5173' 
has been blocked by CORS policy: No 'Access-Control-Allow-Origin' header 
is present on the requested resource.
```

### 3. Test with curl (Should Work)
```bash
curl -X GET \
  "https://yj3dszj0vh.execute-api.us-east-1.amazonaws.com/dev/api/encounters?latitude=13.081084&longitude=77.559572&radius=100&limit=10" \
  -H "Content-Type: application/json" \
  -v
```

Look for these headers in the response:
```
< access-control-allow-origin: *
< access-control-allow-methods: GET,POST,PUT,DELETE,OPTIONS
< access-control-allow-headers: Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token
```

## Common CORS Issues and Solutions

### Issue 1: OPTIONS Preflight Failing

**Symptom**: Browser sends OPTIONS request, gets 403 or 404

**Solution**: Ensure API Gateway has OPTIONS method configured for all routes

**Check**:
```bash
curl -X OPTIONS \
  "https://yj3dszj0vh.execute-api.us-east-1.amazonaws.com/dev/api/encounters" \
  -H "Origin: http://localhost:5173" \
  -H "Access-Control-Request-Method: GET" \
  -v
```

Should return 200/204 with CORS headers.

### Issue 2: Custom Headers Not Allowed

**Symptom**: Error mentions specific header not allowed

**Solution**: We removed the custom `X-Request-Time` header from the client

**Verify**: Check `apiClient.ts` - should only use standard headers

### Issue 3: Credentials Mode Mismatch

**Symptom**: Error about credentials

**Solution**: Set `withCredentials: false` in axios config (already done)

### Issue 4: API Gateway Not Deployed

**Symptom**: All requests fail

**Solution**: Redeploy the API Gateway
```bash
cd ghostatlas-backend
npm run deploy
```

## Solutions Applied

### 1. Updated API Client (`apiClient.ts`)
- Removed custom `X-Request-Time` header
- Set `withCredentials: false`
- Added explicit `Accept: application/json` header
- Added CORS error detection in interceptor

### 2. Verified Lambda CORS Headers
- All Lambda functions return proper CORS headers
- Headers include `Access-Control-Allow-Origin: *`
- Methods and headers are properly configured

### 3. Created Test Tools
- `test-cors.html` - Browser-based CORS testing
- `test-api.sh` - Command-line API testing
- Enhanced logging in API client

## If CORS Still Doesn't Work

### Option 1: Use Vite Proxy (Development Only)

Add to `vite.config.ts`:

```typescript
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    proxy: {
      '/api': {
        target: 'https://yj3dszj0vh.execute-api.us-east-1.amazonaws.com/dev',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/api/, '/api'),
      },
    },
  },
})
```

Then update `config.ts`:
```typescript
apiBaseUrl: import.meta.env.VITE_API_BASE_URL || '/api'
```

This proxies requests through the Vite dev server, avoiding CORS.

### Option 2: Redeploy API Gateway with Updated CORS

If the API Gateway CORS config needs updating:

1. Edit `ghostatlas-backend/lib/constructs/api-gateway.ts`
2. Ensure `defaultCorsPreflightOptions` is correct
3. Redeploy:
```bash
cd ghostatlas-backend
npm run deploy
```

### Option 3: Add Accept Header to Allowed Headers

If browser is sending `Accept` header and it's not allowed:

Update API Gateway CORS config to include:
```typescript
allowHeaders: [
  'Content-Type',
  'Accept',  // Add this
  'X-Amz-Date',
  'Authorization',
  'X-Api-Key',
  'X-Amz-Security-Token',
  'X-Amz-User-Agent',
],
```

## Verification Checklist

- [ ] `test-cors.html` shows successful requests
- [ ] Browser console shows no CORS errors
- [ ] Network tab shows 200 responses
- [ ] OPTIONS preflight returns 200/204
- [ ] Response includes `access-control-allow-origin: *`
- [ ] `/stories` page loads encounters
- [ ] `/map` page displays markers

## Production Considerations

### Security: Restrict Origins

For production, change from `*` to specific domains:

```typescript
// In api-gateway.ts
allowOrigins: [
  'https://ghostatlas.com',
  'https://www.ghostatlas.com',
  'https://app.ghostatlas.com'
],
```

### Performance: Increase Max Age

```typescript
maxAge: cdk.Duration.days(1), // Cache preflight for 24 hours
```

## Debugging Commands

### Check API Gateway Stage
```bash
aws apigateway get-stages \
  --rest-api-id yj3dszj0vh \
  --region us-east-1
```

### Check CORS Configuration
```bash
aws apigateway get-integration \
  --rest-api-id yj3dszj0vh \
  --resource-id <resource-id> \
  --http-method OPTIONS \
  --region us-east-1
```

### Test from Different Origin
```bash
# Test from localhost:5173
curl -X GET \
  "https://yj3dszj0vh.execute-api.us-east-1.amazonaws.com/dev/api/encounters?latitude=13.081084&longitude=77.559572&radius=100&limit=10" \
  -H "Origin: http://localhost:5173" \
  -H "Content-Type: application/json" \
  -v
```

## Contact & Support

If CORS issues persist:

1. Check CloudWatch logs for Lambda errors
2. Verify API Gateway deployment
3. Test with `test-cors.html`
4. Check browser console for specific error messages
5. Try the Vite proxy solution for development

## Additional Resources

- [MDN CORS Documentation](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS)
- [AWS API Gateway CORS](https://docs.aws.amazon.com/apigateway/latest/developerguide/how-to-cors.html)
- [Axios CORS Guide](https://axios-http.com/docs/handling_errors)
