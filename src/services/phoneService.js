export function getPhoneProvider() {
  return window.CRMPhoneProvider || null;
}

// The sample phone list is never proof of a connected device.
export function isPhoneConnected(phone) {
  const provider = getPhoneProvider();
  if (!provider || !phone?.id) return false;
  try {
    const devices = typeof provider.getDevices === 'function' ? provider.getDevices() : provider.devices;
    return Array.isArray(devices) && devices.some(device => device?.id === phone.id && device.connected === true);
  } catch { return false; }
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
