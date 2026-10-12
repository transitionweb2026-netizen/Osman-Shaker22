type Phone = { e164: string };

export function telHref(phone: Phone): string {
  return `tel:${phone.e164}`;
}

/** WhatsApp click-to-chat link: digits only, no `+`, optional pre-filled message. */
export function whatsappHref(phone: Phone, message?: string): string {
  const number = phone.e164.replace(/\D/g, "");
  return message ? `https://wa.me/${number}?text=${encodeURIComponent(message)}` : `https://wa.me/${number}`;
}
