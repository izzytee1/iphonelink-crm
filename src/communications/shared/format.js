import { leadPhones } from '../../utils/leadUtils.js';

export function listTime(timestamp) {
  const date = new Date(timestamp);
  const now = new Date();
  if (date.toDateString() === now.toDateString()) return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
}

export function durationText(seconds) {
  const value = Math.max(0, Number(seconds || 0));
  return `${Math.floor(value / 60)}:${String(value % 60).padStart(2, '0')}`;
}

export function mobileOfLead(lead) {
  const phones = leadPhones(lead);
  return phones[1] || phones[0] || '';
}
