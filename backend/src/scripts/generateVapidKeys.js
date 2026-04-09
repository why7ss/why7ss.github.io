import webpush from 'web-push';

// Генерируем VAPID ключи
const vapidKeys = webpush.generateVAPIDKeys();

console.log('\n🔑 VAPID ключи сгенерированы!\n');
console.log('Добавьте эти значения в ваш .env файл:\n');
console.log(`VAPID_PUBLIC_KEY=${vapidKeys.publicKey}`);
console.log(`VAPID_PRIVATE_KEY=${vapidKeys.privateKey}`);
console.log(`VAPID_SUBJECT=mailto:admin@easygame.com\n`);
console.log('Или для production используйте реальный email:\n');
console.log('VAPID_SUBJECT=mailto:your-email@example.com\n');
