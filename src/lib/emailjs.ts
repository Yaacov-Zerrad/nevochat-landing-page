// Config EmailJS
export const emailjsConfig = {
  serviceId: process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID || '',
  templateId: process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID || '',
  publicKey: process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY || '',
};

export const isEmailjsConfigured = () => {
  return !!(emailjsConfig.serviceId && emailjsConfig.templateId && emailjsConfig.publicKey);
};
