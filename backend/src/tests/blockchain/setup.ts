import dotenv from 'dotenv';
import path from 'path';

// Charger les variables d'environnement pour les tests
dotenv.config({ path: path.join(__dirname, '../../../.env') });

// Configuration globale pour les tests
beforeAll(() => {
    // Vérifier que les variables d'environnement critiques sont définies
    const requiredEnvVars = [
        'OPERATOR_ID',
        'OPERATOR_KEY',
        'HEDERA_NETWORK'
    ];

    const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
    
    if (missingVars.length > 0) {
        console.warn(`⚠️  Variables d'environnement manquantes pour les tests: ${missingVars.join(', ')}`);
        console.warn('Les tests blockchain nécessitent une configuration Hedera valide.');
    }

    // Configuration des timeouts pour les tests blockchain
    jest.setTimeout(60000); // 1 minute par défaut
});

// Nettoyage après tous les tests
afterAll(() => {
    // Fermer toutes les connexions ouvertes
    console.log('🧹 Nettoyage des ressources de test...');
});

// Gestion des erreurs non capturées
process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
});

export {};
