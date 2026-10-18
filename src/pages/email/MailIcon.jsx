import React from 'react';
const paths = {
  inbox: <><path d="M4 4h16v12h-5l-2 3h-2l-2-3H4z"/><path d="M4 12h5l2 3h2l2-3h5"/></>,
  sent: <><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></>,
  drafts: <><path d="M5 4h10l4 4v12H5z"/><path d="M9 12h6M9 16h6"/></>,
  archive: <><rect x="3" y="3" width="18" height="5" rx="1"/><path d="M5 8v12h14V8M10 12h4"/></>,
  trash: <><path d="M4 7h16M9 7V4h6v3M6 7l1 14h10l1-14M10 11v6M14 11v6"/></>,
  spam: <><path d="M8 3h8l5 5v8l-5 5H8l-5-5V8z"/><path d="M12 8v5m0 4h.01"/></>,
  all: <><rect x="4" y="6" width="16" height="14" rx="2"/><path d="M7 3h10M8 11h8M8 15h6"/></>,
  search: <><circle cx="10.7" cy="10.7" r="6.7"/><path d="m16 16 5 5"/></>,
  filter: <><path d="M4 7h16M7 12h10M10 17h4"/><circle cx="8" cy="7" r="2" fill="currentColor" stroke="none"/></>,
  back: <path d="m15 18-6-6 6-6"/>,
  refresh: <><path d="M20 7v5h-5M4 17v-5h5"/><path d="M6 9a7 7 0 0 1 12-2l2 5M4 12l2 5a7 7 0 0 0 12-2"/></>,
  reply: <path d="M10 9 4 13l6 4v-3h4c3 0 5 1 6 4-.2-6-2-9-6-9h-4z"/>,
  replyAll: <><path d="M9 9 3 13l6 4v-3h5c3 0 5 1 6 4-.2-6-2-9-6-9H9z"/><path d="m9 5-4 3"/></>,
  forward: <path d="m14 9 6 4-6 4v-3h-4c-3 0-5 1-6 4 .2-6 2-9 6-9h4z"/>,
  unread: <><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 7 9-7"/></>,
  read: <><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 8 9 6 9-6"/><path d="M8 17h8"/></>,
  move: <><path d="M3 7V5h6l2 2h10v12H3z"/><path d="m10 13 2 2 3-3"/></>,
  more: <><circle cx="5" cy="12" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/></>,
  check: <path d="m5 12 5 5 9-10"/>,
  close: <path d="M6 6 18 18M18 6 6 18"/>,
  minimize: <path d="M5 18h14"/>,
  expand: <path d="M8 4H4v4M16 4h4v4M20 16v4h-4M4 16v4h4"/>,
  attachment: <path d="m8 13 6-6a3 3 0 0 1 4 4l-8 8a5 5 0 0 1-7-7l9-9"/>,
  link: <><path d="M10 13a5 5 0 0 0 8-1l2-2a5 5 0 0 0-7-7l-2 2M14 11a5 5 0 0 0-8 1l-2 2a5 5 0 0 0 7 7l2-2"/></>,
  emoji: <><circle cx="12" cy="12" r="9"/><path d="M8 14c1 3 7 3 8 0"/><path d="M8.5 9h.01M15.5 9h.01"/></>,
  image: <><rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="8" cy="9" r="1"/><path d="m3 17 6-5 3 3 3-4 6 6"/></>,
  compose: <><path d="M13 5H5v14h14v-8"/><path d="m10 14 2-5 7-7 3 3-7 7z"/></>,
  checkBox: <rect x="4" y="4" width="16" height="16" rx="2"/>,
};
export default function MailIcon({ name, size=18, ...rest }) {
  return <svg {...rest} width={size} height={size} viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" fill="none" aria-hidden="true">{paths[name] || paths.more}</svg>;
}
