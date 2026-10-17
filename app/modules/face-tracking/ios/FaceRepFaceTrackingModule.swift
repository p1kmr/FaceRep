import ARKit
import ExpoModulesCore

/// Apple's face tracking (ARKit) for the workout mirror: whether this iPhone has it, and the mirror view that
/// reports the face's movements to JavaScript (docs/face-tracking.md). Everything stays on the iPhone.
public class FaceRepFaceTrackingModule: Module {
  public func definition() -> ModuleDefinition {
    Name("FaceRepFaceTracking")

    // A TrueDepth camera or an A12 chip and later; never in the Simulator.
    Function("isSupported") { () -> Bool in
      ARFaceTrackingConfiguration.isSupported
    }

    View(FaceTrackingView.self) {
      Events("onFace")

      Prop("active") { (view: FaceTrackingView, active: Bool) in
        view.setActive(active)
      }
    }
  }
}
