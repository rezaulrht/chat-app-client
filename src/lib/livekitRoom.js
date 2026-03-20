import { Room, RoomEvent, Track, setLogLevel } from "livekit-client";

// Suppress LiveKit SDK's internal race-condition error that fires when a
// TrackPublished signal arrives after the remote participant has already left.
// This is harmless noise from the SDK and cannot be prevented at app level.
setLogLevel("warn");

let room = null;
let connecting = false;
const listeners = new Set();

export function onRoomStateChange(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

function notify() {
  listeners.forEach((fn) => fn());
}

export function getRoom() {
  return room;
}

export async function connectRoom(url, token, callType = "audio") {
  if (room || connecting) return;
  connecting = true;

  try {
    const newRoom = new Room({
      adaptiveStream: true,
      dynacast: true,
      webRTCConfig: {
        iceTransportPolicy: "all",
      },
    });

    newRoom.on(RoomEvent.Connected, () => notify());
    newRoom.on(RoomEvent.Disconnected, () => {
      room = null;
      notify();
    });
    newRoom.on(RoomEvent.ConnectionStateChanged, () => notify());
    newRoom.on(RoomEvent.ParticipantConnected, () => notify());
    newRoom.on(RoomEvent.ParticipantDisconnected, () => notify());
    newRoom.on(RoomEvent.TrackSubscribed, (track, _pub, participant) => {
      if (track.kind === Track.Kind.Audio) {
        try {
          // Guard against the race where a track event fires after the participant has left
          if (!newRoom.remoteParticipants.has(participant.identity)) return;
          const el = track.attach();
          el.dataset.livekitParticipant = participant.sid;
          document.body.appendChild(el);
        } catch (err) {
          console.warn("[LiveKit] track attach skipped (participant may have left):", err.message);
        }
      }
    });
    newRoom.on(RoomEvent.TrackUnsubscribed, (track) => {
      if (track.kind === Track.Kind.Audio) {
        track.detach().forEach((el) => el.remove());
      }
    });

    await newRoom.connect(url, token, { autoSubscribe: true });

    room = newRoom;
    notify();

    await newRoom.localParticipant.setMicrophoneEnabled(true);

    if (callType === "video") {
      await newRoom.localParticipant.setCameraEnabled(true);
    }

    notify();
  } catch (err) {
    console.error("[LiveKit] connection failed:", err);
    room = null;
    notify();
  } finally {
    connecting = false;
  }
}

export async function disconnectRoom() {
  document.querySelectorAll("audio[data-livekit-participant]").forEach((el) => el.remove());
  const r = room;
  room = null;
  connecting = false;
  if (r) await r.disconnect();
  notify();
}

export function getParticipants() {
  if (!room) return [];
  return [...room.remoteParticipants.values()];
}
