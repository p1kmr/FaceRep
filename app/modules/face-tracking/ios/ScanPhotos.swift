import UIKit

/// The face scan's progress photos (docs/face-scan.md): JPEG files in Application Support/FaceScanPhotos, saved only
/// when the user turned photos on. Excluded from iCloud and computer backups, readable only while the iPhone is
/// unlocked (complete file protection), deleted with the app. Never sent anywhere.
enum ScanPhotos {
  enum Failure: Error {
    case badName
    case encode
  }

  private static let folder = "FaceScanPhotos"
  /// Longest side in pixels: plenty for a face on a phone screen, about 300–500 KB a photo.
  private static let maxSide: CGFloat = 1440

  /// The folder (made on first use), always marked as excluded from backups.
  static func directory() throws -> URL {
    let fileManager = FileManager.default
    let base = try fileManager.url(for: .applicationSupportDirectory, in: .userDomainMask, appropriateFor: nil, create: true)
    var directory = base.appendingPathComponent(folder, isDirectory: true)
    if !fileManager.fileExists(atPath: directory.path) {
      try fileManager.createDirectory(
        at: directory,
        withIntermediateDirectories: true,
        attributes: [.protectionKey: FileProtectionType.complete]
      )
    }
    var values = URLResourceValues()
    values.isExcludedFromBackup = true
    try directory.setResourceValues(values)
    return directory
  }

  /// The app names each photo after its scan ("<scan id>.jpg"); anything else (a path, "..") is refused.
  static func file(_ name: String) throws -> URL {
    guard name.range(of: "^[A-Za-z0-9-]{1,64}\\.jpg$", options: .regularExpression) != nil else {
      throw Failure.badName
    }
    return try directory().appendingPathComponent(name, isDirectory: false)
  }

  /// Scales the picture down to `maxSide`, saves it as JPEG and returns its size in pixels.
  static func save(_ image: UIImage, as name: String) throws -> CGSize {
    var url = try file(name)
    let pixels = CGSize(width: image.size.width * image.scale, height: image.size.height * image.scale)
    let scale = min(1, maxSide / max(pixels.width, pixels.height, 1))
    let size = CGSize(width: floor(pixels.width * scale), height: floor(pixels.height * scale))
    let format = UIGraphicsImageRendererFormat()
    format.scale = 1
    format.opaque = true
    let resized = UIGraphicsImageRenderer(size: size, format: format).image { _ in
      image.draw(in: CGRect(origin: .zero, size: size))
    }
    guard let data = resized.jpegData(compressionQuality: 0.85) else {
      throw Failure.encode
    }
    try data.write(to: url, options: [.atomic, .completeFileProtection])
    var values = URLResourceValues()
    values.isExcludedFromBackup = true
    try url.setResourceValues(values)
    return size
  }

  static func delete(_ name: String) throws {
    let url = try file(name)
    if FileManager.default.fileExists(atPath: url.path) {
      try FileManager.default.removeItem(at: url)
    }
  }

  static func deleteAll() throws {
    let fileManager = FileManager.default
    for url in try fileManager.contentsOfDirectory(at: try directory(), includingPropertiesForKeys: nil) {
      try fileManager.removeItem(at: url)
    }
  }

  #if targetEnvironment(simulator)
  /// A picture copied into the app's Documents/SimulatorCamera/<name>.jpg that stands in for the camera in the store
  /// screenshots (docs/screenshots.md §4): "scan" for the face scan, "mirror" for the workout mirror. Simulator only.
  static func simulatorCamera(_ name: String) -> URL? {
    guard name.range(of: "^[a-z]{1,16}$", options: .regularExpression) != nil,
      let documents = FileManager.default.urls(for: .documentDirectory, in: .userDomainMask).first
    else { return nil }
    let url = documents.appendingPathComponent("SimulatorCamera", isDirectory: true).appendingPathComponent("\(name).jpg")
    return FileManager.default.fileExists(atPath: url.path) ? url : nil
  }

  /// The Simulator has no camera: the scan's stand-in picture (above) if there is one, else a plain picture with a face
  /// outline and the time, so the photo screens can be tried there. Never used on an iPhone.
  static func simulatorImage() -> UIImage {
    if let url = simulatorCamera("scan"), let image = UIImage(contentsOfFile: url.path) {
      return image
    }
    let size = CGSize(width: 900, height: 1200)
    let format = UIGraphicsImageRendererFormat()
    format.scale = 1
    format.opaque = true
    let time = DateFormatter.localizedString(from: Date(), dateStyle: .medium, timeStyle: .short)
    return UIGraphicsImageRenderer(size: size, format: format).image { context in
      let colors = [UIColor.darkGray.cgColor, UIColor.brown.cgColor] as CFArray
      if let gradient = CGGradient(colorsSpace: CGColorSpaceCreateDeviceRGB(), colors: colors, locations: [0, 1]) {
        context.cgContext.drawLinearGradient(gradient, start: .zero, end: CGPoint(x: 0, y: size.height), options: [])
      }
      UIColor.white.withAlphaComponent(0.85).setStroke()
      let oval = UIBezierPath(ovalIn: CGRect(x: 200, y: 240, width: 500, height: 660))
      oval.lineWidth = 10
      oval.stroke()
      let attributes: [NSAttributedString.Key: Any] = [
        .font: UIFont.boldSystemFont(ofSize: 44),
        .foregroundColor: UIColor.white,
      ]
      ("Simulator · \(time)" as NSString).draw(at: CGPoint(x: 60, y: 1060), withAttributes: attributes)
    }
  }
  #endif
}
