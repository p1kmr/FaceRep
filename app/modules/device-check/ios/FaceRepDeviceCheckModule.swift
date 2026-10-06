import DeviceCheck
import ExpoModulesCore

/// One function: a fresh Apple DeviceCheck token (base64), or nil where DeviceCheck isn't
/// available (the Simulator, very old devices). The server sends it to Apple, never stores it.
public class FaceRepDeviceCheckModule: Module {
  public func definition() -> ModuleDefinition {
    Name("FaceRepDeviceCheck")

    AsyncFunction("getTokenAsync") { (promise: Promise) in
      guard DCDevice.current.isSupported else {
        promise.resolve(nil)
        return
      }
      DCDevice.current.generateToken { data, _ in
        promise.resolve(data?.base64EncodedString())
      }
    }
  }
}
