const fs = require('fs');
const path = require('path');

// Fichiers à corriger
const files = [
  'src/services/hedera/patient-identity.service.ts',
  'src/services/hedera/access-control.service.ts',
  'src/services/hedera/medical-records.service.ts'
];

files.forEach(filePath => {
  console.log(`Correction de ${filePath}...`);
  
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Remplacer tous les appels hederaService sans vérification null
  content = content.replace(
    /(\s+)(const result = await hederaService\.(executeContractFunction|callContractFunction))/g,
    '$1if (!hederaService) {\n$1    throw new Error(\'Hedera service not available\');\n$1}\n$1$2'
  );
  
  fs.writeFileSync(filePath, content);
  console.log(`✅ ${filePath} corrigé`);
});

console.log('🎉 Toutes les vérifications null ajoutées !');
