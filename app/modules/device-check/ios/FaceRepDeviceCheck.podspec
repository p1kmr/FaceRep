Pod::Spec.new do |s|
  s.name           = 'FaceRepDeviceCheck'
  s.version        = '1.0.0'
  s.summary        = 'Apple DeviceCheck token for the FaceRep AI server'
  s.description    = 'Generates a DeviceCheck token so the server can tell a real iPhone running FaceRep.'
  s.author         = ''
  s.homepage       = 'https://docs.expo.dev/modules/'
  s.platforms      = { :ios => '16.4' }
  s.source         = { git: '' }
  s.static_framework = true

  s.dependency 'ExpoModulesCore'
  s.frameworks = 'DeviceCheck'

  s.pod_target_xcconfig = {
    'DEFINES_MODULE' => 'YES',
  }

  s.source_files = "**/*.{h,m,mm,swift}"
end
