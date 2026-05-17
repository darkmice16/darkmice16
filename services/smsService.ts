import * as SMS from 'expo-sms';
import type { EmergencyContact } from '../types';

export async function sendEmergencySms(
  contact: EmergencyContact,
  userName: string,
  destinationName: string,
  coords: { lat: number; lng: number } | null,
) {
  const isAvailable = await SMS.isAvailableAsync();
  if (!isAvailable) return false;

  const locationStr = coords
    ? `https://maps.google.com/?q=${coords.lat},${coords.lng}`
    : 'location unavailable';

  const message =
    `Hi — this is Drift on ${userName}'s phone. ` +
    `They didn't wake up at ${destinationName}. ` +
    `They are currently at: ${locationStr}. ` +
    `Reply STOP to opt out of these messages.`;

  const { result } = await SMS.sendSMSAsync([contact.phone], message);
  return result === 'sent';
}
