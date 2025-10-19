# Vercel Environment Variables Configuration

## 🚨 URGENT - Required Configuration

To resolve CORS and API connection errors, you need to configure the following environment variables on Vercel:

## Frontend (hedera-health-id.vercel.app)

### Variables to add in Vercel Dashboard:

1. Go to https://vercel.com/dashboard
2. Select your frontend project `hedera-health-id`
3. Go to Settings > Environment Variables
4. Add the following variables:

```
VITE_API_URL=https://hedera-health-id-backend.vercel.app
VITE_APP_NAME=Hedera Health ID
VITE_APP_VERSION=1.0.0
VITE_NODE_ENV=production
```

## Backend (hedera-health-id-backend.vercel.app)

### Already configured variables to verify:

```
NODE_ENV=production
DATABASE_URL=your-neon-database-url
JWT_SECRET=your-jwt-secret
HEDERA_ACCOUNT_ID=your-hedera-account
HEDERA_PRIVATE_KEY=your-hedera-private-key
ENCRYPTION_KEY=your-encryption-key
CORS_ORIGIN=https://hedera-health-id.vercel.app
```

## 🔧 Configuration Steps

### 1. Frontend
```bash
# In the frontend Vercel dashboard
VITE_API_URL → https://hedera-health-id-backend.vercel.app
```

### 2. Redeployment
After adding the variables:
1. Go to the "Deployments" tab
2. Click "Redeploy" for the latest deployment
3. Or push a new commit to trigger automatic redeployment

## 🧪 Test après Configuration

Une fois configuré, testez :
1. https://hedera-health-id.vercel.app/hospital/dashboard
2. Vérifiez la console du navigateur pour les logs d'API
3. Les erreurs CORS devraient disparaître

## 📝 Notes Importantes

- Les variables `VITE_*` sont exposées côté client
- Elles doivent être configurées au moment du build
- Un redéploiement est nécessaire après modification
- Les logs dans la console vous aideront à déboguer

## 🔍 Debugging

Si les erreurs persistent :
1. Vérifiez les logs Vercel du backend
2. Vérifiez les logs de la console du navigateur
3. Testez l'endpoint directement : https://hedera-health-id-backend.vercel.app/health
