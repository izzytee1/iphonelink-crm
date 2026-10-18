export function getPhoneProvider() {
  return window.CRMPhoneProvider || null;
}

export function subscribePhoneProvider(handler) {
  const provider = getPhoneProvider();
  if (!provider || typeof provider.subscribe !== 'function') return () => {};
  try {
    const unsubscribe = provider.subscribe(handler);
    return typeof unsubscribe === 'function' ? unsubscribe : () => {};
  } catch (error) {
    console.error('CRM phone provider subscription failed.', error);
    return () => {};
  }
}

export function invokePhoneProvider(names, args = []) {
  const provider = getPhoneProvider();
  const name = names.find((candidate) => typeof provider?.[candidate] === 'function');
  if (!name) return { handled: false, result: undefined };
  try {
    return { handled: true, result: provider[name](...args), method: name };
  } catch (error) {
    console.error(`CRM phone provider ${name} failed.`, error);
    return { handled: true, error, result: undefined, method: name };
  }
}

export function dialPhone({ number, device }) {
  const provider = getPhoneProvider();
  if (provider && typeof provider.dial === 'function') {
    try {
      return { handled: true, result: provider.dial({ number, device }) };
    } catch (error) {
      console.error('CRM phone provider dial failed.', error);
      return { handled: true, error, result: undefined };
    }
  }
  window.location.href = `tel:${number}`;
  return { handled: false, result: undefined };
}
