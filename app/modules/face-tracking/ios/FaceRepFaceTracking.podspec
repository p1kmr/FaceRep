Pod::Spec.new do |s|
  s.name           = 'FaceRepFaceTracking'
  s.version        = '1.0.0'
  s.summary        = 'Apple face tracking (ARKit) for the FaceRep workout mirror'
  s.description    = 'Shows the front camera as a mirror and reads face movements on the iPhone. Nothing is recorded, saved or sent.'
  s.author         = ''
  s.homepage       = 'https://docs.expo.dev/modules/'
  s.platforms      = { :ios => '16.4' }
  s.source         = { git: '' }
  s.static_framework = true
  s.swift_version  = '5.9'

  s.dependency 'ExpoModulesCore'
  s.frameworks = 'ARKit', 'SceneKit'

  s.pod_target_xcconfig = {
    'DEFINES_MODULE' => 'YES',
  }

  s.source_files = "**/*.{h,m,mm,swift}"
end
