# PWA Icons

Ce dossier doit contenir les icônes PWA aux tailles suivantes :

- icon-72x72.png
- icon-96x96.png
- icon-128x128.png
- icon-144x144.png
- icon-152x152.png
- icon-192x192.png
- icon-384x384.png
- icon-512x512.png

## Génération des icônes

Vous pouvez utiliser des outils comme :
- [PWA Asset Generator](https://github.com/onderceylan/pwa-asset-generator)
- [RealFaviconGenerator](https://realfavicongenerator.net/)
- [PWA Builder](https://www.pwabuilder.com/)

## Commande pour générer les icônes

```bash
npx pwa-asset-generator logo.svg public/icons --manifest public/manifest.json
```

Pour l'instant, nous utilisons des icônes placeholder générées par le navigateur.
