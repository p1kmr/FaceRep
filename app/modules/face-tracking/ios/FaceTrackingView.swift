import ARKit
import ExpoModulesCore
import SceneKit

/// The workout mirror and the face scan with Apple's face tracking: the front camera on screen, and about 15 times a
/// second the face's movements: ARKit's blend shapes (0–1, by ARKit's names), the head's rotation (3×3, column by
/// column), how far the face is turned away from the camera (degrees) and its distance (metres). Frames are read and
/// dropped; nothing is recorded or saved, except the face scan's progress photo when the user turned photos on
/// (`snapshot`, saved by ScanPhotos). Tracking runs only while the view is on screen and `active` (the app turns it
/// off in the background).
public class FaceTrackingView: ExpoView, ARSessionDelegate {
  let onFace = EventDispatcher()

  /// The view whose camera is running (one at a time: the mirror or the face scan), for the scan's photo.
  static weak var current: FaceTrackingView?

  private static let interval: TimeInterval = 1.0 / 15
  /// A failed session is started again this many times before the app hears about it (the camera can be busy for a
  /// moment, e.g. right after a system alert or another camera user).
  private static let maxRetries = 2
  private let sceneView = ARSCNView(frame: .zero)
  private var active = false
  private var running = false
  private var lastSent: TimeInterval = 0
  private var loggedFrame = false
  private var retries = 0
  private var retryWork: DispatchWorkItem?

  public required init(appContext: AppContext? = nil) {
    super.init(appContext: appContext)
    clipsToBounds = true
    backgroundColor = .black
    sceneView.scene = SCNScene()
    sceneView.automaticallyUpdatesLighting = false
    sceneView.session.delegate = self
    addSubview(sceneView)
    NotificationCenter.default.addObserver(
      self, selector: #selector(appDidBecomeActive), name: UIApplication.didBecomeActiveNotification, object: nil)
  }

  /// A session that had to wait for the app to be active (see updateSession) starts now.
  @objc private func appDidBecomeActive() {
    updateSession()
  }

  public override func layoutSubviews() {
    super.layoutSubviews()
    sceneView.frame = bounds
  }

  public override func didMoveToWindow() {
    super.didMoveToWindow()
    updateSession()
  }

  func setActive(_ value: Bool) {
    active = value
    updateSession()
  }

  private func updateSession() {
    let shouldRun = active && window != nil && ARFaceTrackingConfiguration.isSupported
    guard shouldRun != running else {
      return
    }
    if shouldRun {
      // The camera can't start while a system alert (the camera permission, for one) is still on screen: wait for
      // appDidBecomeActive instead of letting ARKit fail.
      guard UIApplication.shared.applicationState == .active else {
        NSLog("FaceRep face tracking waits for the app to be active")
        return
      }
      running = true
      retries = 0
      startSession()
    } else {
      running = false
      retryWork?.cancel()
      retryWork = nil
      sceneView.session.pause()
      if FaceTrackingView.current === self {
        FaceTrackingView.current = nil
      }
    }
  }

  private func startSession() {
    let configuration = ARFaceTrackingConfiguration()
    configuration.isLightEstimationEnabled = false
    lastSent = 0
    loggedFrame = false
    NSLog("FaceRep face tracking started (view %.0f×%.0f, retry %ld)", bounds.width, bounds.height, retries)
    sceneView.session.run(configuration, options: [.resetTracking, .removeExistingAnchors])
    FaceTrackingView.current = self
  }

  /// What the camera shows now, as on screen (mirrored, without the app's buttons on top); nil when it isn't running.
  func snapshot() -> UIImage? {
    running ? sceneView.snapshot() : nil
  }

  // MARK: - ARSessionDelegate (called on the main queue: the session has no delegate queue)

  public func session(_ session: ARSession, didUpdate frame: ARFrame) {
    guard frame.timestamp - lastSent >= FaceTrackingView.interval else {
      return
    }
    lastSent = frame.timestamp
    if !loggedFrame {
      loggedFrame = true
      retries = 0
      NSLog("FaceRep face tracking: first camera frame (view %.0f×%.0f)", sceneView.bounds.width, sceneView.bounds.height)
    }
    guard let face = frame.anchors.compactMap({ $0 as? ARFaceAnchor }).first, face.isTracked else {
      onFace(["tracked": false, "t": frame.timestamp])
      return
    }
    var shapes: [String: Double] = [:]
    for (location, value) in face.blendShapes {
      shapes[location.rawValue] = value.doubleValue
    }
    let c = face.transform.columns
    let rotation = [c.0.x, c.0.y, c.0.z, c.1.x, c.1.y, c.1.z, c.2.x, c.2.y, c.2.z].map { Double($0) }
    var event: [String: Any] = ["tracked": true, "t": frame.timestamp, "shapes": shapes, "rotation": rotation]
    // The face seen from the camera: the face scan reads its moves only while the face looks at the screen.
    let fromCamera = simd_mul(simd_inverse(frame.camera.transform), face.transform)
    let p = fromCamera.columns.3
    let position = SIMD3<Float>(p.x, p.y, p.z)
    let distance = simd_length(position)
    if distance > 0.01 {
      let z = fromCamera.columns.2
      let forward = simd_normalize(SIMD3<Float>(z.x, z.y, z.z))
      let cosine = simd_dot(forward, -position / distance)
      event["turn"] = Double(acos(min(1, max(-1, cosine))) * 180 / Float.pi)
      event["distance"] = Double(distance)
    }
    onFace(event)
  }

  /// The session stopped. A busy or briefly unavailable camera gets maxRetries more tries; after that (or at once with
  /// no camera permission or an unsupported configuration) the app hears Apple's error code: the mirror then shows the
  /// plain camera, the face scan offers to try again. Only the code goes to the app and the device log, never anything
  /// about the face.
  public func session(_ session: ARSession, didFailWithError error: Error) {
    let code = (error as NSError).code
    NSLog("FaceRep face tracking failed (%ld, retry %ld): %@", code, retries, error.localizedDescription)
    guard running else {
      return
    }
    let final = code == ARError.Code.cameraUnauthorized.rawValue || code == ARError.Code.unsupportedConfiguration.rawValue
    if !final && retries < FaceTrackingView.maxRetries {
      retries += 1
      onFace(["tracked": false, "t": lastSent])
      let work = DispatchWorkItem { [weak self] in
        guard let self, self.running else {
          return
        }
        self.retryWork = nil
        guard UIApplication.shared.applicationState == .active else {
          // appDidBecomeActive starts it again.
          self.running = false
          return
        }
        self.startSession()
      }
      retryWork = work
      DispatchQueue.main.asyncAfter(deadline: .now() + 0.7 * Double(retries), execute: work)
      return
    }
    running = false
    if FaceTrackingView.current === self {
      FaceTrackingView.current = nil
    }
    onFace(["tracked": false, "t": lastSent, "error": code])
  }

  /// The camera was taken away for a while (a call, Control Center, another camera user): no face until it's back.
  public func sessionWasInterrupted(_ session: ARSession) {
    NSLog("FaceRep face tracking interrupted")
    onFace(["tracked": false, "t": lastSent])
  }

  /// Back from an interruption: start again rather than wait on a face ARKit may have lost.
  public func sessionInterruptionEnded(_ session: ARSession) {
    NSLog("FaceRep face tracking resumed")
    guard running else {
      return
    }
    running = false
    updateSession()
  }

  deinit {
    NotificationCenter.default.removeObserver(self)
    retryWork?.cancel()
    sceneView.session.pause()
  }
}
