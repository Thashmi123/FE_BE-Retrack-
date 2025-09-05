import React, { useState, useEffect } from "react";
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Alert,
  Card,
  CardBody,
  Row,
  Col,
} from "reactstrap";
import {
  Camera,
  Mic,
  MicOff,
  Video,
  VideoOff,
  AlertTriangle,
} from "react-feather";

const MediaPermissions = ({
  isOpen,
  onPermissionGranted,
  onPermissionDenied,
  onClose,
}) => {
  const [permissionState, setPermissionState] = useState({
    audio: null, // null, 'granted', 'denied', 'error'
    video: null,
    error: null,
    loading: false,
  });

  const [previewStream, setPreviewStream] = useState(null);
  const [previewElement, setPreviewElement] = useState(null);

  // Check current permissions
  useEffect(() => {
    if (isOpen) {
      checkPermissions();
    }
  }, [isOpen]);

  const checkPermissions = async () => {
    try {
      const audioPermission = await navigator.permissions.query({
        name: "microphone",
      });
      const videoPermission = await navigator.permissions.query({
        name: "camera",
      });

      setPermissionState((prev) => ({
        ...prev,
        audio: audioPermission.state,
        video: videoPermission.state,
      }));
    } catch (error) {
      console.log("Permission API not supported, will request on user action");
    }
  };

  const requestPermissions = async () => {
    setPermissionState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
        video: {
          width: { ideal: 1280, max: 1920 },
          height: { ideal: 720, max: 1080 },
          frameRate: { ideal: 30, max: 60 },
        },
      });

      setPreviewStream(stream);
      setPermissionState((prev) => ({
        ...prev,
        audio: "granted",
        video: "granted",
        loading: false,
      }));

      // Show preview
      if (previewElement && stream) {
        previewElement.srcObject = stream;
      }
    } catch (error) {
      console.error("Permission error:", error);
      setPermissionState((prev) => ({
        ...prev,
        loading: false,
        error: getErrorMessage(error),
      }));
    }
  };

  const getErrorMessage = (error) => {
    switch (error.name) {
      case "NotAllowedError":
        return "Camera and microphone access was denied. Please allow access in your browser settings and refresh the page.";
      case "NotFoundError":
        return "No camera or microphone found. Please connect a device and try again.";
      case "NotReadableError":
        return "Camera or microphone is being used by another application. Please close other applications and try again.";
      case "OverconstrainedError":
        return "Camera or microphone settings cannot be satisfied. Please check your device capabilities.";
      case "SecurityError":
        return "Camera or microphone access blocked due to security restrictions. Please use HTTPS.";
      default:
        return "Unable to access camera or microphone. Please check your device settings and try again.";
    }
  };

  const handleContinue = () => {
    if (previewStream) {
      onPermissionGranted(previewStream);
    }
  };

  const handleDeny = () => {
    if (previewStream) {
      previewStream.getTracks().forEach((track) => track.stop());
    }
    onPermissionDenied();
  };

  const handleClose = () => {
    if (previewStream) {
      previewStream.getTracks().forEach((track) => track.stop());
    }
    onClose();
  };

  const getPermissionIcon = (type) => {
    const state = permissionState[type];
    const iconSize = 32;
    if (state === "granted") {
      return type === "audio" ? (
        <Mic className="text-success" size={iconSize} />
      ) : (
        <Video className="text-success" size={iconSize} />
      );
    } else if (state === "denied") {
      return type === "audio" ? (
        <MicOff className="text-danger" size={iconSize} />
      ) : (
        <VideoOff className="text-danger" size={iconSize} />
      );
    }
    return type === "audio" ? (
      <Mic className="text-muted" size={iconSize} />
    ) : (
      <Video className="text-muted" size={iconSize} />
    );
  };

  const getPermissionText = (type) => {
    const state = permissionState[type];
    switch (state) {
      case "granted":
        return `${type === "audio" ? "Microphone" : "Camera"} access granted`;
      case "denied":
        return `${type === "audio" ? "Microphone" : "Camera"} access denied`;
      default:
        return `${
          type === "audio" ? "Microphone" : "Camera"
        } permission needed`;
    }
  };

  const canContinue =
    permissionState.audio === "granted" && permissionState.video === "granted";

  return (
    <Modal
      isOpen={isOpen}
      toggle={handleClose}
      size="lg"
      centered
      style={{
        backdropFilter: "blur(5px)",
        backgroundColor: "rgba(0,0,0,0.5)",
      }}
    >
      <ModalHeader
        toggle={handleClose}
        style={{
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          color: "white",
          border: "none",
          borderRadius: "8px 8px 0 0",
        }}
      >
        <div className="d-flex align-items-center">
          <Camera
            className="me-2"
            size={20}
            style={{ width: "20px", height: "20px" }}
          />
          <span style={{ fontWeight: "600" }}>Media Permissions Required</span>
        </div>
      </ModalHeader>

      <ModalBody style={{ padding: "2rem", background: "#f8f9fa" }}>
        <div className="text-center mb-4">
          <div
            style={{
              width: "80px",
              height: "80px",
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 20px",
              boxShadow: "0 8px 25px rgba(102, 126, 234, 0.3)",
            }}
          >
            <Video
              size={32}
              color="white"
              style={{ width: "32px", height: "32px" }}
            />
          </div>
          <h4
            style={{
              fontWeight: "600",
              color: "#2c3e50",
              marginBottom: "10px",
            }}
          >
            Allow camera and microphone access to join the meeting
          </h4>
          <p style={{ color: "#6c757d", fontSize: "16px", lineHeight: "1.5" }}>
            We need access to your camera and microphone to enable video and
            audio in this meeting for the best experience.
          </p>
        </div>

        {permissionState.error && (
          <Alert color="danger" className="mb-4">
            <strong>Error:</strong> {permissionState.error}
          </Alert>
        )}

        <Row className="mb-4">
          <Col md={6}>
            <Card
              className="h-100"
              style={{
                border: "none",
                borderRadius: "12px",
                boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
                transition: "all 0.3s ease",
                background:
                  permissionState.audio === "granted" ? "#d4edda" : "#fff",
              }}
            >
              <CardBody className="text-center" style={{ padding: "2rem" }}>
                <div className="mb-3" style={{ fontSize: "2rem" }}>
                  <div style={{ display: "flex", justifyContent: "center" }}>
                    {getPermissionIcon("audio")}
                  </div>
                </div>
                <h6 style={{ fontWeight: "600", color: "#2c3e50" }}>
                  Microphone
                </h6>
                <p
                  className="small"
                  style={{
                    color:
                      permissionState.audio === "granted"
                        ? "#28a745"
                        : "#6c757d",
                    fontWeight: "500",
                  }}
                >
                  {getPermissionText("audio")}
                </p>
                <p className="small text-muted">
                  Used for speaking and audio communication
                </p>
              </CardBody>
            </Card>
          </Col>

          <Col md={6}>
            <Card
              className="h-100"
              style={{
                border: "none",
                borderRadius: "12px",
                boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
                transition: "all 0.3s ease",
                background:
                  permissionState.video === "granted" ? "#d4edda" : "#fff",
              }}
            >
              <CardBody className="text-center" style={{ padding: "2rem" }}>
                <div className="mb-3" style={{ fontSize: "2rem" }}>
                  <div style={{ display: "flex", justifyContent: "center" }}>
                    {getPermissionIcon("video")}
                  </div>
                </div>
                <h6 style={{ fontWeight: "600", color: "#2c3e50" }}>Camera</h6>
                <p
                  className="small"
                  style={{
                    color:
                      permissionState.video === "granted"
                        ? "#28a745"
                        : "#6c757d",
                    fontWeight: "500",
                  }}
                >
                  {getPermissionText("video")}
                </p>
                <p className="small text-muted">
                  Used for video display and visual communication
                </p>
              </CardBody>
            </Card>
          </Col>
        </Row>

        {previewStream && (
          <div className="text-center mb-4">
            <h6>Preview</h6>
            <video
              ref={setPreviewElement}
              autoPlay
              muted
              playsInline
              className="rounded border"
              style={{ maxWidth: "100%", height: "200px" }}
            />
            <p className="small text-muted mt-2">
              This is how you'll appear to other participants
            </p>
          </div>
        )}

        <div className="text-center">
          <Button
            color="primary"
            size="lg"
            onClick={requestPermissions}
            disabled={permissionState.loading}
            className="me-3"
            style={{
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              border: "none",
              borderRadius: "25px",
              padding: "12px 30px",
              fontWeight: "600",
              fontSize: "16px",
              boxShadow: "0 4px 15px rgba(102, 126, 234, 0.4)",
              transition: "all 0.3s ease",
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = "translateY(-2px)";
              e.target.style.boxShadow = "0 6px 20px rgba(102, 126, 234, 0.6)";
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = "translateY(0)";
              e.target.style.boxShadow = "0 4px 15px rgba(102, 126, 234, 0.4)";
            }}
          >
            {permissionState.loading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" />
                Requesting Permissions...
              </>
            ) : (
              "Allow Camera & Microphone"
            )}
          </Button>
        </div>

        <div className="mt-4">
          <h6>Privacy & Security</h6>
          <ul className="small text-muted">
            <li>
              Your video and audio are only shared with meeting participants
            </li>
            <li>You can turn off your camera or microphone at any time</li>
            <li>No recordings are made without your explicit consent</li>
            <li>All data is encrypted during transmission</li>
          </ul>
        </div>
      </ModalBody>

      <ModalFooter>
        <Button color="secondary" onClick={handleDeny}>
          Join Audio Only
        </Button>
        <Button color="danger" onClick={handleClose}>
          Cancel
        </Button>
        <Button
          color="success"
          onClick={handleContinue}
          disabled={!canContinue}
        >
          Continue to Meeting
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default MediaPermissions;
