import ARKit
import ExpoModulesCore

/// Apple's face tracking (ARKit) for the workout mirror and the face scan: whether this iPhone has it, the camera view
/// that reports the face's movements to JavaScript (docs/face-tracking.md), and the face scan's progress photos, which
/// stay in the app on the iPhone (docs/face-scan.md). Nothing is sent anywhere.
public class FaceRepFaceTrackingModule: Module {
  public func definition() -> ModuleDefinition {
    Name("FaceRepFaceTracking")

    // A TrueDepth camera or an A12 chip and later; never in the Simulator.
    Function("isSupported") { () -> Bool in
      ARFaceTrackingConfiguration.isSupported
    }

    // The app plays a pretend face in the Simulator (no camera there) so the face scan's screens can be tried.
    Constant("isSimulator") { () -> Bool in
      #if targetEnvironment(simulator)
      return true
      #else
      return false
      #endif
    }

    // The progress photos' folder as a file URL ending in "/" (the app adds the file name).
    Function("photosDirectory") { () throws -> String in
      try ScanPhotos.directory().absoluteString
    }

    // Saves what the camera shows right now as `name` (only when the user turned scan photos on).
    AsyncFunction("takePhoto") { (name: String, promise: Promise) in
      #if targetEnvironment(simulator)
      let image: UIImage? = ScanPhotos.simulatorImage()
      #else
      let image = FaceTrackingView.current?.snapshot()
      #endif
      guard let image else {
        promise.reject("ERR_NO_CAMERA", "There is no camera picture to save")
        return
      }
      DispatchQueue.global(qos: .userInitiated).async {
        do {
          let size = try ScanPhotos.save(image, as: name)
          promise.resolve(["name": name, "width": Double(size.width), "height": Double(size.height)])
        } catch {
          promise.reject("ERR_SAVE", "The photo couldn't be saved")
        }
      }
    }.runOnQueue(.main)

    AsyncFunction("deletePhoto") { (name: String) throws in
      try ScanPhotos.delete(name)
    }

    AsyncFunction("deleteAllPhotos") { () throws in
      try ScanPhotos.deleteAll()
    }

    View(FaceTrackingView.self) {
      Events("onFace")

      Prop("active") { (view: FaceTrackingView, active: Bool) in
        view.setActive(active)
      }
    }
  }
}
