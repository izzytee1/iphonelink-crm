export function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export function formatMoney(value) {
  const formatted = Number(value || 0).toLocaleString('en-US', { maximumFractionDigits: 0 });
  return `$${formatted.replace(/,/g, '<span class="money-comma">,</span>')}`;
}

export function formatMoneyText(value) {
  return `$${Number(value || 0).toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
}

export function formatPhoneDisplay(phone) {
  if (!phone) return '';
  let digits = String(phone).replace(/\D/g, '');
  if (digits.length === 11 && digits.startsWith('1')) digits = digits.slice(1);
  if (digits.length === 10) {
    return `<span class="phone-area">(${digits.slice(0, 3)})</span><span class="phone-local">${digits.slice(3, 6)}-${digits.slice(6)}</span>`;
  }
  return escapeHtml(phone);
}

export function leadPhones(lead) {
  if (Array.isArray(lead?.phones)) return lead.phones.filter(Boolean);
  return lead?.phone ? [lead.phone] : [];
}

export function leadEmails(lead) {
  if (Array.isArray(lead?.emails)) return lead.emails.filter(Boolean);
  return lead?.email ? [lead.email] : [];
}

export function addressText(address) {
  if (!address) return '';
  if (typeof address === 'string') return address;
  return [address.street, [address.city, address.state, address.zip].filter(Boolean).join(' ')].filter(Boolean).join(', ');
}

export function leadSearchText(lead) {
  const address = typeof lead.address === 'string' ? lead.address : Object.values(lead.address || {}).join(' ');
  const statements = (lead.statements || []).flatMap((item) => Object.values(item || {})).join(' ');
  return [lead.name, lead.company, lead.title, lead.stage, lead.owner, lead.action, lead.date, lead.birthDate, ...leadPhones(lead), ...leadEmails(lead), address, statements]
    .filter(Boolean).join(' ').toLowerCase();
}
