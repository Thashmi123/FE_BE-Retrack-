import SimplePeer from "simple-peer";

class WebRTCService {
  constructor() {
    this.localStream = null;
    this.peers = new Map();
    this.isInitiator = false;
    this.roomId = null;
    this.socket = null;
    this.onUserJoined = null;
    this.onUserLeft = null;
    this.onRemoteStream = null;
    this.onError = null;
    this.onConnectionStateChange = null;
  }

  // Initialize WebRTC with socket connection
  initialize(socket, roomId, isInitiator = false) {
    this.socket = socket;
    this.roomId = roomId;
    this.isInitiator = isInitiator;
    this.setupSocketListeners();
  }

  // Setup socket event listeners
  setupSocketListeners() {
    if (!this.socket) return;

    this.socket.on("user-joined", (userId) => {
      console.log("User joined:", userId);
      if (this.onUserJoined) {
        this.onUserJoined(userId);
      }
    });

    this.socket.on("user-left", (userId) => {
      console.log("User left:", userId);
      this.removePeer(userId);
      if (this.onUserLeft) {
        this.onUserLeft(userId);
      }
    });

    this.socket.on("offer", (data) => {
      this.handleOffer(data);
    });

    this.socket.on("answer", (data) => {
      this.handleAnswer(data);
    });

    this.socket.on("ice-candidate", (data) => {
      this.handleIceCandidate(data);
    });

    this.socket.on("user-muted", (data) => {
      if (this.onUserMuted) {
        this.onUserMuted(data.userId, data.type, data.muted);
      }
    });
  }

  // Request media permissions
  async requestMediaPermissions(audio = true, video = true) {
    try {
      const constraints = {
        audio: audio
          ? {
              echoCancellation: true,
              noiseSuppression: true,
              autoGainControl: true,
            }
          : false,
        video: video
          ? {
              width: { ideal: 1280, max: 1920 },
              height: { ideal: 720, max: 1080 },
              frameRate: { ideal: 30, max: 60 },
            }
          : false,
      };

      this.localStream = await navigator.mediaDevices.getUserMedia(constraints);

      // Set up audio/video tracks
      this.audioTrack = this.localStream.getAudioTracks()[0];
      this.videoTrack = this.localStream.getVideoTracks()[0];

      return {
        success: true,
        stream: this.localStream,
        audioEnabled: !!this.audioTrack,
        videoEnabled: !!this.videoTrack,
      };
    } catch (error) {
      console.error("Error requesting media permissions:", error);
      return {
        success: false,
        error: this.getPermissionError(error),
        stream: null,
      };
    }
  }

  // Get user-friendly error messages for permission issues
  getPermissionError(error) {
    switch (error.name) {
      case "NotAllowedError":
        return "Camera and microphone access denied. Please allow access and refresh the page.";
      case "NotFoundError":
        return "No camera or microphone found. Please connect a device and try again.";
      case "NotReadableError":
        return "Camera or microphone is being used by another application.";
      case "OverconstrainedError":
        return "Camera or microphone constraints cannot be satisfied.";
      case "SecurityError":
        return "Camera or microphone access blocked due to security restrictions.";
      default:
        return "Unable to access camera or microphone. Please check your device settings.";
    }
  }

  // Toggle audio (mute/unmute)
  toggleAudio() {
    if (this.audioTrack) {
      this.audioTrack.enabled = !this.audioTrack.enabled;
      this.notifyMuteState("audio", !this.audioTrack.enabled);
      console.log("Audio toggled:", this.audioTrack.enabled);
      return this.audioTrack.enabled;
    }
    console.warn("No audio track available for toggling");
    return false;
  }

  // Toggle video (camera on/off)
  toggleVideo() {
    if (this.videoTrack) {
      this.videoTrack.enabled = !this.videoTrack.enabled;
      this.notifyMuteState("video", !this.videoTrack.enabled);
      console.log("Video toggled:", this.videoTrack.enabled);
      return this.videoTrack.enabled;
    }
    console.warn("No video track available for toggling");
    return false;
  }

  // Get current mute states
  getMuteStates() {
    return {
      audio: this.audioTrack ? !this.audioTrack.enabled : true,
      video: this.videoTrack ? !this.videoTrack.enabled : true,
    };
  }

  // Get current media states (enabled/disabled)
  getMediaStates() {
    return {
      audioEnabled: this.audioTrack ? this.audioTrack.enabled : false,
      videoEnabled: this.videoTrack ? this.videoTrack.enabled : false,
      isMuted: this.audioTrack ? !this.audioTrack.enabled : true,
    };
  }

  // Notify other users about mute state changes
  notifyMuteState(type, muted) {
    if (this.socket) {
      this.socket.emit("user-muted", {
        userId: this.getCurrentUserId(),
        type,
        muted,
      });
    }
  }

  // Join a room
  joinRoom(userId) {
    if (this.socket && this.roomId) {
      this.socket.emit("join-room", {
        roomId: this.roomId,
        userId: userId,
      });
    }
  }

  // Leave the room
  leaveRoom() {
    if (this.socket && this.roomId) {
      this.socket.emit("leave-room", {
        roomId: this.roomId,
        userId: this.getCurrentUserId(),
      });
    }
    this.cleanup();
  }

  // Create peer connection for a new user
  createPeer(userId, initiator = false) {
    const peer = new SimplePeer({
      initiator: initiator,
      trickle: false,
      stream: this.localStream,
      config: {
        iceServers: [
          { urls: "stun:stun.l.google.com:19302" },
          { urls: "stun:stun1.l.google.com:19302" },
        ],
      },
    });

    peer.on("signal", (data) => {
      if (this.socket) {
        this.socket.emit(initiator ? "offer" : "answer", {
          target: userId,
          data: data,
        });
      }
    });

    peer.on("stream", (stream) => {
      console.log("Received remote stream from:", userId);
      if (this.onRemoteStream) {
        this.onRemoteStream(userId, stream);
      }
    });

    peer.on("error", (error) => {
      console.error("Peer error:", error);
      if (this.onError) {
        this.onError(error);
      }
    });

    peer.on("connect", () => {
      console.log("Peer connected:", userId);
      if (this.onConnectionStateChange) {
        this.onConnectionStateChange(userId, "connected");
      }
    });

    peer.on("close", () => {
      console.log("Peer disconnected:", userId);
      if (this.onConnectionStateChange) {
        this.onConnectionStateChange(userId, "disconnected");
      }
    });

    this.peers.set(userId, peer);
    return peer;
  }

  // Handle incoming offer
  handleOffer(data) {
    const peer = this.createPeer(data.sender, false);
    peer.signal(data.data);
  }

  // Handle incoming answer
  handleAnswer(data) {
    const peer = this.peers.get(data.sender);
    if (peer) {
      peer.signal(data.data);
    }
  }

  // Handle ICE candidate
  handleIceCandidate(data) {
    const peer = this.peers.get(data.sender);
    if (peer) {
      peer.signal(data.data);
    }
  }

  // Remove peer connection
  removePeer(userId) {
    const peer = this.peers.get(userId);
    if (peer) {
      peer.destroy();
      this.peers.delete(userId);
    }
  }

  // Get current user ID (implement based on your auth system)
  getCurrentUserId() {
    return localStorage.getItem("userId") || "anonymous";
  }

  // Cleanup resources
  cleanup() {
    // Stop local stream
    if (this.localStream) {
      this.localStream.getTracks().forEach((track) => track.stop());
      this.localStream = null;
    }

    // Close all peer connections
    this.peers.forEach((peer) => peer.destroy());
    this.peers.clear();

    // Remove socket listeners
    if (this.socket) {
      this.socket.off("user-joined");
      this.socket.off("user-left");
      this.socket.off("offer");
      this.socket.off("answer");
      this.socket.off("ice-candidate");
      this.socket.off("user-muted");
    }
  }

  // Get connection quality (simplified)
  getConnectionQuality() {
    const quality = {
      local: "good",
      remote: {},
    };

    this.peers.forEach((peer, userId) => {
      // In a real implementation, you'd get stats from peer.getStats()
      quality.remote[userId] = "good";
    });

    return quality;
  }

  // Set event handlers
  setOnUserJoined(callback) {
    this.onUserJoined = callback;
  }

  setOnUserLeft(callback) {
    this.onUserLeft = callback;
  }

  setOnRemoteStream(callback) {
    this.onRemoteStream = callback;
  }

  setOnError(callback) {
    this.onError = callback;
  }

  setOnConnectionStateChange(callback) {
    this.onConnectionStateChange = callback;
  }

  setOnUserMuted(callback) {
    this.onUserMuted = callback;
  }
}

export default new WebRTCService();
