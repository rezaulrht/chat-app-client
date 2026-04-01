import { Room, RoomEvent, Track, setLogLevel } from "livekit-client";

setLogLevel("error");

let room = null;
let connecting = false;
let activeSpeakerIdentities = new Set();
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

export function getActiveSpeakers() {
  return activeSpeakerIdentities;
}

export function getParticipants() {
  if (!room) return [];
  return [...room.remoteParticipants.values()];
}

export async function connectRoom(
  url,
  token,
  callType = "audio",
  options = {},
) {
  if (room) {
    console.warn(
      "[LiveKit] connectRoom called but room already exists, skipping",
    );
    return;
  }
  if (connecting) {
    console.warn("[LiveKit] connectRoom already in progress, skipping");
    return;
  }
  connecting = true;

  try {
    const newRoom = new Room({
      adaptiveStream: true,
      dynacast: true,
      webRTCConfig: { iceTransportPolicy: "all" },
    });

    const refreshParticipants = () => {
      console.log(
        "[LiveKit] refresh — remoteParticipants:",
        newRoom.remoteParticipants.size,
      );
      notify();
    };

    newRoom.on(RoomEvent.Connected, refreshParticipants);
    newRoom.on(RoomEvent.Disconnected, () => {
      room = null;
      activeSpeakerIdentities = new Set();
      notify();
    });
    newRoom.on(RoomEvent.ConnectionStateChanged, refreshParticipants);
    newRoom.on(RoomEvent.ParticipantConnected, (p) => {
      console.log("[LiveKit] ParticipantConnected:", p.identity);
      refreshParticipants();
    });
    newRoom.on(RoomEvent.ParticipantDisconnected, (p) => {
      console.log("[LiveKit] ParticipantDisconnected:", p.identity);
      refreshParticipants();
    });
    newRoom.on(RoomEvent.TrackPublished, (pub, p) => {
      console.log("[LiveKit] TrackPublished by:", p.identity, pub.kind);
      refreshParticipants();
    });
    newRoom.on(RoomEvent.TrackUnpublished, refreshParticipants);
    newRoom.on(RoomEvent.TrackSubscribed, (track, _pub, participant) => {
      console.log(
        "[LiveKit] TrackSubscribed from:",
        participant.identity,
        track.kind,
      );
      refreshParticipants();
      if (track.kind === Track.Kind.Audio) {
        attachAudioTrack(track, participant, newRoom);
      }
    });
    newRoom.on(RoomEvent.TrackUnsubscribed, (track) => {
      refreshParticipants();
      if (track.kind === Track.Kind.Audio) {
        track.detach().forEach((el) => el.remove());
        document
          .querySelectorAll(`audio[data-livekit-track="${track.sid}"]`)
          .forEach((el) => el.remove());
      }
    });
    newRoom.on(RoomEvent.ActiveSpeakersChanged, (speakers) => {
      activeSpeakerIdentities = new Set(speakers.map((s) => s.identity));
      notify();
    });

    console.log("[LiveKit] connecting to", url);
    await newRoom.connect(url, token, { autoSubscribe: true });
    console.log(
      "[LiveKit] connected, remoteParticipants:",
      newRoom.remoteParticipants.size,
    );

    room = newRoom;
    notify();

    // Attach tracks already present when we joined
    newRoom.remoteParticipants.forEach((participant) => {
      console.log("[LiveKit] existing participant:", participant.identity);
      participant.audioTrackPublications.forEach((pub) => {
        if (pub.track && pub.isSubscribed) {
          attachAudioTrack(pub.track, participant, newRoom);
        }
      });
    });

    await newRoom.localParticipant.setMicrophoneEnabled(true);
    console.log("[LiveKit] mic enabled");

    if (callType === "video") {
      await newRoom.localParticipant.setCameraEnabled(true);
    }

    notify();
  } catch (err) {
    const denied =
      err?.name === "NotAllowedError" ||
      err?.name === "PermissionDeniedError";

    if (denied) {
      console.warn("[LiveKit] microphone permission denied");
    } else {
      console.error("[LiveKit] connection failed:", err);
    }
    room = null;
    // If newRoom already connected before the error, disconnect it so
    // we don't leak media resources with no reference to clean up later.
    if (typeof newRoom !== "undefined") {
      try {
        await newRoom.disconnect();
      } catch (_) {}
    }
    notify();
    if (options?.throwOnError) {
      throw err;
    }
  } finally {
    connecting = false;
  }
}

function attachAudioTrack(track, participant, newRoom) {
  try {
    if (!newRoom.remoteParticipants.has(participant.identity)) return;
    const existing = document.querySelector(
      `audio[data-livekit-track="${track.sid}"]`,
    );
    if (existing) return;
    const el = track.attach();
    el.dataset.livekitParticipant = participant.sid;
    el.dataset.livekitTrack = track.sid;
    el.autoplay = true;
    document.body.appendChild(el);
    console.log("[LiveKit] audio attached for:", participant.identity);
  } catch (err) {
    console.warn("[LiveKit] track attach skipped:", err.message);
  }
}

export async function disconnectRoom() {
  document
    .querySelectorAll(
      "audio[data-livekit-participant], audio[data-livekit-track]",
    )
    .forEach((el) => el.remove());
  const r = room;
  room = null;
  connecting = false;
  activeSpeakerIdentities = new Set();
  notify(); // notify immediately so UI clears right away
  if (r) {
    try {
      r.localParticipant.tracks.forEach((pub) => {
        try {
          pub.track?.mediaStreamTrack?.stop();
          pub.track?.stop();
        } catch (_) { }
      });
    } catch (_) { }
    try {
      await r.disconnect();
    } catch (_) { }
  }
}
