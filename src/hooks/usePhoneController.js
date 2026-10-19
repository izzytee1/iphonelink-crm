import { useCallback, useEffect, useMemo, useState } from 'react';
import { dialPhone, getPhoneProvider, invokePhoneProvider, subscribePhoneProvider } from '../services/phoneService.js';
import { leadPhones } from '../utils/leadUtils.js';
import { playDtmf } from '../communications/sounds.js';
import useDeviceTelemetry from './useDeviceTelemetry.js';

export function digitsOf(value) {
  return String(value || '').replace(/\D/g, '').slice(-10);
}

export function toDial(value) {
  return String(value || '').replace(/[^0-9*#+]/g, '');
}

export function validNumber(value) {
  const digits = String(value || '').replace(/\D/g, '');
  return digits.length === 10 || (digits.length === 11 && digits[0] === '1');
}

export function formatPhone(value) {
  const raw = String(value || '').replace(/\D/g, '');
  const digits = raw.length === 11 && raw[0] === '1' ? raw.slice(1) : raw;
  if (digits.length === 10) return (raw.length === 11 ? "1 " : "") + `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  return String(value || '');
}

export function formatPhonePartial(value) {
  let raw = String(value || '').replace(/\D/g, '').slice(0, 11);
  const country = raw.length === 11 && raw[0] === '1';
  if (country) raw = raw.slice(1); else raw = raw.slice(0, 10);
  if (!raw) return '';
  let output = raw.length < 4 ? raw : `(${raw.slice(0, 3)})`;
  if (raw.length >= 4) output += ` ${raw.slice(3, 6)}`;
  if (raw.length >= 7) output += `-${raw.slice(6, 10)}`;
  return country ? '1 ' + output : output;
}

export function leadByNumber(leads, number) {
  const target = digitsOf(number);
  return leads.find((lead) => leadPhones(lead).some((phone) => digitsOf(phone) === target)) || null;
}

export function platformLabel(device) {
  if (device?.platform === 'ios') return 'iPhone';
  if (device?.platform === 'android') return 'Android';
  return 'Phone';
}

const idleCall = () => ({ phase: 'idle', number: '', name: '', startedAt: 0, muted: false, held: false, speaker: false });

export default function usePhoneController({
  leads,
  phones,
  activePhoneIndex,
  setActivePhoneIndex,
  activeCall,
  setActiveCall,
  onSelectLead,
  callRequest,
  onConsumeCallRequest,
}) {
  const [dialInput, setDialInput] = useState('');
  const [seconds, setSeconds] = useState(0);
  const activePhone = phones[activePhoneIndex] || phones[0] || null;
  const deviceTelemetry=useDeviceTelemetry(activePhone);

  const adoptProviderResult = useCallback((result, number = '') => {
    const apply = (value) => {
      if (!value || typeof value !== 'object' || !value.phase) return;
      setActiveCall((current) => ({ ...current, ...value, number: value.number || number || current.number }));
    };
    if (result && typeof result.then === 'function') {
      result.then(apply).catch((error) => console.error('CRM phone provider action failed.', error));
    } else {
      apply(result);
    }
  }, [setActiveCall]);

  const providerInvoke = useCallback((names, args = []) => {
    const { handled, result, error } = invokePhoneProvider(names, args);
    if (!handled || error) return handled;
    adoptProviderResult(result);
    return true;
  }, [adoptProviderResult]);

  const callPhone = useCallback((phone) => {
    const number = String(phone || '').replace(/[^+\d]/g, '');
    if (!number) return undefined;
    const device = activePhone || null;
    if (device && !device.connected && getPhoneProvider()) return undefined;
    const lead = leadByNumber(leads, number);
    const { handled, result, error } = dialPhone({ number, device });
    if (error || !handled) return undefined;
    setActiveCall({ phase: 'dialing', number, name: lead?.name || '', startedAt: 0, muted: false, held: false, speaker: false });
    adoptProviderResult(result, number);
    return result;
  }, [activePhone, adoptProviderResult, leads, setActiveCall]);


  const callNumber = useCallback((number) => {
    const lead = leadByNumber(leads, number);
    if (lead) onSelectLead?.(lead.id);
    return callPhone(number);
  }, [callPhone, leads, onSelectLead]);

  const loadNumber = useCallback((number = '') => {
    setDialInput(number ? formatPhone(number) : '');
  }, []);

  const requestCall = useCallback(() => {
    if (activeCall.phase === 'incoming') {
      providerInvoke(['answer']);
      return;
    }
    if (activeCall.phase === 'dialing' || activeCall.phase === 'active') {
      if (providerInvoke(['end', 'hangup'])) setActiveCall(idleCall());
      return;
    }
    if (!validNumber(dialInput) || (getPhoneProvider() && !activePhone?.connected)) return;
    callPhone(toDial(dialInput));
  }, [activeCall.phase, activePhone, callPhone, dialInput, providerInvoke, setActiveCall]);

  const decline = useCallback(() => {
    if (providerInvoke(['reject', 'decline', 'end', 'hangup'])) {
      setActiveCall(idleCall());
    }
  }, [providerInvoke, setActiveCall]);

  const toggleControl = useCallback((control) => {
    if (activeCall.phase !== 'active') return;
    const methods = {
      muted: ['setMuted', 'mute'],
      held: ['setHeld', 'hold'],
      speaker: ['setSpeaker', 'speaker'],
    };
    const names = methods[control];
    if (!names) return;
    const next = !activeCall[control];
    if (providerInvoke(names, [next])) setActiveCall((current) => ({ ...current, [control]: next }));
  }, [activeCall, providerInvoke, setActiveCall]);

  const sendTone = useCallback((key) => {
    playDtmf(key);
    if (activeCall.phase === 'active') {
      providerInvoke(['sendTone'], [key]);
      return;
    }
    const raw = `${toDial(dialInput)}${key}`;
    setDialInput(/[#:*]/.test(raw) ? raw : formatPhonePartial(raw));
  }, [activeCall.phase, dialInput, providerInvoke]);

  const transfer = useCallback(() => providerInvoke(['transfer']), [providerInvoke]);
  const addCall = useCallback(() => providerInvoke(['addCall', 'add']), [providerInvoke]);

  const capabilities = useMemo(() => {
    const provider = getPhoneProvider();
    const has = (...names) => names.some((name) => typeof provider?.[name] === 'function');
    return {
      transfer: has('transfer'),
      addCall: has('addCall', 'add'),
    };
  }, [activeCall.phase]);

  useEffect(() => {
    if (activeCall.phase !== 'active' || !activeCall.startedAt) {
      setSeconds(0);
      return undefined;
    }
    const tick = () => setSeconds(Math.max(0, Math.floor((Date.now() - Number(activeCall.startedAt)) / 1000)));
    tick();
    const timer = window.setInterval(tick, 1000);
    return () => window.clearInterval(timer);
  }, [activeCall.phase, activeCall.startedAt]);

  useEffect(() => subscribePhoneProvider((state) => {
    if (!state || typeof state !== 'object') return;
    setActiveCall((current) => {
      const phase = ['idle', 'dialing', 'active', 'incoming'].includes(state.phase) ? state.phase : current.phase;
      if (phase === 'idle') return idleCall();
      return {
        phase,
        number: state.number ?? current.number ?? '',
        name: state.name ?? current.name ?? '',
        startedAt: Number(state.startedAt || state.connectedAt || (phase === 'active' ? current.startedAt : 0)) || (phase === 'active' ? Date.now() : 0),
        muted: Boolean(state.muted),
        held: Boolean(state.held),
        speaker: Boolean(state.speaker),
      };
    });
  }), [setActiveCall]);

  useEffect(() => {
    const handleCallState = (event) => {
      const state = event.detail;
      if (!state || typeof state !== 'object') return;
      setActiveCall((current) => ({ ...current, ...state }));
    };
    window.addEventListener('crm:call-state', handleCallState);
    return () => window.removeEventListener('crm:call-state', handleCallState);
  }, [setActiveCall]);

  useEffect(() => {
    if (!callRequest?.phone) return;
    callPhone(callRequest.phone);
    onConsumeCallRequest?.();
  }, [callPhone, callRequest, onConsumeCallRequest]);

  const dialLead = leadByNumber(leads, activeCall.phase === 'idle' ? dialInput : activeCall.number);
  const dialerName = activeCall.phase === 'idle'
    ? (dialLead?.name || (digitsOf(dialInput).length ? 'New number' : 'Enter a number'))
    : (activeCall.name || dialLead?.name || formatPhone(activeCall.number) || 'Call');
  const dialerStatus = activeCall.phase === 'dialing' ? 'Calling…'
    : activeCall.phase === 'incoming' ? 'Incoming call'
      : activeCall.phase === 'active' ? (activeCall.held ? 'On hold' : activeCall.muted ? 'Muted' : 'Connected')
        : getPhoneProvider() && activePhone?.connected ? `${platformLabel(activePhone)} connected` : 'No call provider';

  return {
    activePhone,
    activePhoneIndex,
    deviceTelemetry,
    activeCall,
    capabilities,
    dialInput,
    dialerName,
    dialerStatus,
    seconds,
    setActivePhoneIndex,
    setDialInput: (value) => {
      const raw = toDial(value);
      setDialInput(/[#:*]/.test(raw) ? raw : formatPhonePartial(raw));
    },
    clearDialInput: () => setDialInput(''),
    loadNumber,
    callPhone,
    callNumber,
    requestCall,
    decline,
    toggleControl,
    sendTone,
    transfer,
    addCall,
  };
}
