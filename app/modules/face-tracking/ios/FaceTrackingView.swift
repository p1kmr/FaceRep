import ARKit
import ExpoModulesCore
import SceneKit

/// The workout mirror with Apple's face tracking: the front camera on screen, and about 15 times a second the face's
/// movements for the move check: ARKit's blend shapes (0–1, by ARKit's names) and the head's rotation (3×3, column
/// by column). Frames are read and dropped; nothing is recorded or saved. Tracking runs only while the view is on
/// screen and `active` (the app turns it off in the background).
public class FaceTrackingView: ExpoView, ARSessionDelegate {
  let onFace = EventDispatcher()

  private static let interval: TimeInterval = 1.0 / 15
  private let sceneView = ARSCNView(frame: .zero)
  private var active = false
  private var running = false
  private var lastSent: TimeInterval = 0

  public required init(appContext: AppContext? = nil) {
    super.init(appContext: appContext)
    clipsToBounds = true
    backgroundColor = .black
    sceneView.scene = SCNScene()
    sceneView.automaticallyUpdatesLighting = false
    sceneView.session.delegate = self
    addSubview(sceneView)
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
    running = shouldRun
    if shouldRun {
      let configuration = ARFaceTrackingConfiguration()
      configuration.isLightEstimationEnabled = false
      lastSent = 0
      sceneView.session.run(configuration, options: [.resetTracking, .removeExistingAnchors])
    } else {
      sceneView.session.pause()
    }
  }

  // MARK: - ARSessionDelegate (called on the main queue: the session has no delegate queue)

  public func session(_ session: ARSession, didUpdate frame: ARFrame) {
    guard frame.timestamp - lastSent >= FaceTrackingView.interval else {
      return
    }
    lastSent = frame.timestamp
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
    onFace(["tracked": true, "t": frame.timestamp, "shapes": shapes, "rotation": rotation])
  }

  public func session(_ session: ARSession, didFailWithError error: Error) {
    running = false
    onFace(["tracked": false, "t": lastSent])
  }
}
