import { motion } from "framer-motion";
import { Smartphone, Tablet, Monitor, Check } from "lucide-react";
import { useDeviceDetection } from "../../hooks/useDeviceDetection";

export function MobileDemo() {
  const deviceInfo = useDeviceDetection();

  const features = [
    {
      title: "Native Mobile UI",
      description: "Optimized for 2015-2025 mobile devices with touch-first interactions",
      icon: Smartphone,
    },
    {
      title: "Bottom Navigation",
      description: "Thumb-friendly navigation with haptic feedback",
      icon: Check,
    },
    {
      title: "Swipe Gestures",
      description: "Natural swipe controls for music playback",
      icon: Check,
    },
    {
      title: "Expandable Player",
      description: "Drag-to-expand music player with visualizations",
      icon: Check,
    },
    {
      title: "Glass Morphism",
      description: "Modern glass effects optimized for mobile performance",
      icon: Check,
    },
    {
      title: "Safe Area Support",
      description: "Proper handling of notches and home indicators",
      icon: Check,
    },
  ];

  const deviceTypes = [
    { type: 'mobile', icon: Smartphone, label: 'Mobile', active: deviceInfo.type === 'mobile' },
    { type: 'tablet', icon: Tablet, label: 'Tablet', active: deviceInfo.type === 'tablet' },
    { type: 'desktop', icon: Monitor, label: 'Desktop', active: deviceInfo.type === 'desktop' },
  ];

  return (
    <div className="space-y-8">
      {/* Device Detection Status */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-slate-800/40 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6"
      >
        <h3 className="text-xl font-bold text-slate-100 mb-4">Current Device</h3>
        <div className="grid grid-cols-3 gap-4 mb-4">
          {deviceTypes.map((device) => {
            const Icon = device.icon;
            return (
              <div
                key={device.type}
                className={`flex flex-col items-center p-4 rounded-xl transition-all ${
                  device.active
                    ? 'bg-blue-500/20 border border-blue-500/30 text-blue-400'
                    : 'bg-slate-700/40 text-slate-400'
                }`}
              >
                <Icon className="w-8 h-8 mb-2" />
                <span className="text-sm font-medium">{device.label}</span>
              </div>
            );
          })}
        </div>
        
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-slate-400">Screen Size:</span>
            <span className="text-slate-200 ml-2">
              {deviceInfo.screenWidth} × {deviceInfo.screenHeight}
            </span>
          </div>
          <div>
            <span className="text-slate-400">Touch Device:</span>
            <span className="text-slate-200 ml-2">
              {deviceInfo.isTouchDevice ? 'Yes' : 'No'}
            </span>
          </div>
          <div>
            <span className="text-slate-400">Pixel Ratio:</span>
            <span className="text-slate-200 ml-2">{deviceInfo.pixelRatio}x</span>
          </div>
          <div>
            <span className="text-slate-400">Haptics:</span>
            <span className="text-slate-200 ml-2">
              {deviceInfo.supportsHaptics ? 'Supported' : 'Not Available'}
            </span>
          </div>
        </div>
      </motion.div>

      {/* Mobile Features */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-slate-800/40 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6"
      >
        <h3 className="text-xl font-bold text-slate-100 mb-6">Mobile UI Features</h3>
        <div className="grid gap-4">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 * index }}
                className="flex items-start space-x-4 p-4 rounded-xl bg-slate-700/30 hover:bg-slate-700/50 transition-colors"
              >
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h4 className="font-semibold text-slate-100 mb-1">{feature.title}</h4>
                  <p className="text-sm text-slate-300">{feature.description}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* Mobile Resolution Support */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-slate-800/40 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6"
      >
        <h3 className="text-xl font-bold text-slate-100 mb-4">Supported Mobile Resolutions</h3>
        <p className="text-slate-300 mb-4">
          Optimized for standard mobile devices from 2015-2025:
        </p>
        
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <h4 className="font-medium text-slate-200 mb-2">iPhone Resolutions</h4>
            <ul className="space-y-1 text-slate-400">
              <li>375×667 (iPhone 6/7/8)</li>
              <li>414×736 (iPhone Plus)</li>
              <li>375×812 (iPhone X/XS/11 Pro)</li>
              <li>390×844 (iPhone 12/13/14)</li>
              <li>428×926 (iPhone Pro Max)</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-slate-200 mb-2">Android Resolutions</h4>
            <ul className="space-y-1 text-slate-400">
              <li>360×640 (Common Android)</li>
              <li>360×720 (HD Android)</li>
              <li>412×732 (Pixel)</li>
              <li>360×780 (Galaxy S8/S9)</li>
              <li>412×915 (Galaxy S10/S20)</li>
            </ul>
          </div>
        </div>
      </motion.div>
    </div>
  );
}