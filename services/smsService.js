const { smsSender } = require('../config/app');

function sendSms(to, message) {
  if (!to) {
    return { sent: false, reason: 'Telefon raqami topilmadi' };
  }

  // Demo mode: real SMS provider integratsiyasi uchun shu joyni almashtirish kifoya.
  console.log(`[SMS][MOCK] from=${smsSender} to=${to} message="${message}"`);
  return { sent: true, provider: 'mock' };
}

module.exports = { sendSms };
