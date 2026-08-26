export interface DailyRoomConfig {
  url: string;
  name: string;
  isSandbox: boolean;
}

const DAILY_API_KEY = process.env.DAILY_API_KEY;
const DAILY_DOMAIN = process.env.DAILY_DOMAIN; // e.g. jancare.daily.co

/**
 * Creates a Daily.co WebRTC room for secure video consultations.
 * If credentials are missing, falls back to a sandbox route to simulate video meetings.
 */
export async function createConsultationRoom(roomName: string): Promise<DailyRoomConfig> {
  const cleanRoomName = roomName.replace(/[^a-zA-Z0-9_-]/g, "");

  // Use Jitsi Meet (Gold Standard Free WebRTC for Hackathons - No API Key, No Billing limits)
  console.log(`[JanCare WebRTC] Creating secure Jitsi room: https://meet.jit.si/${cleanRoomName}`);
  return {
    url: `https://meet.jit.si/${cleanRoomName}#config.prejoinPageEnabled=false&config.startWithAudioMuted=false&config.startWithVideoMuted=false`,
    name: cleanRoomName,
    isSandbox: false,
  };
}
