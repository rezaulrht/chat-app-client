import { Room, RoomEvent, Track } from "livekit-client";

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
  if (room || connecting) {
    console.log("[LiveKit] already connected/connecting, skipping");
    return;
  }
  connecting = true;
  console.log("[LiveKit] connecting, callType:", callType);

  try {
    const newRoom = new Room({
      adaptiveStream: true,
      dynacast: true,
      webRTCConfig: {
        iceTransportPolicy: "all",
      },
    });

    newRoom.on(RoomEvent.Connected, () => {
      console.log("[LiveKit] connected");
      notify();
    });
    newRoom.on(RoomEvent.Disconnected, (reason) => {
      console.log("[LiveKit] disconnected, reason:", reason);
      room = null;
      notify();
    });
    newRoom.on(RoomEvent.ConnectionStateChanged, (s) => {
      console.log("[LiveKit] state:", s);
      notify();
    });
    newRoom.on(RoomEvent.ParticipantConnected, (p) => {
      console.log("[LiveKit] participant joined:", p.identity);
      notify();
    });
    newRoom.on(RoomEvent.ParticipantDisconnected, (p) => {
      console.log("[LiveKit] participant left:", p.identity);
      notify();
    });
    newRoom.on(RoomEvent.TrackSubscribed, (track, _pub, participant) => {
      console.log("[LiveKit] track subscribed:", track.kind, "from", participant.identity);
      if (track.kind === Track.Kind.Audio) {
        const el = track.attach();
        el.dataset.livekitParticipant = participant.sid;
        document.body.appendChild(el);
      }
    });
    newRoom.on(RoomEvent.TrackUnsubscribed, (track) => {
      if (track.kind === Track.Kind.Audio) {
        track.detach().forEach((el) => el.remove());
      }
    });

    await newRoom.connect(url, token, { autoSubscribe: true });
    console.log("[LiveKit] connect() resolved, remote participants:", newRoom.remoteParticipants.size);

    room = newRoom;
    notify();

    await newRoom.localParticipant.setMicrophoneEnabled(true);
    console.log("[LiveKit] mic enabled");

    if (callType === "video") {
      await newRoom.localParticipant.setCameraEnabled(true);
      console.log("[LiveKit] camera enabled");
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
  if (r) {
    await r.disconnect();
    console.log("[LiveKit] disconnected");
  }
  notify();
}

export function getParticipants() {
  if (!room) return [];
  return [...room.remoteParticipants.values()];
}
