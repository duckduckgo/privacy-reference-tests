function init(window) {
    // values of properties are being set by this script on purpose to be 'outlier' values,
    // so the test can verify protection in a platform agnostic way

    const BatteryManager = function BatteryManager () {}
    Object.defineProperty(BatteryManager.prototype, 'charging', { get: () => false, configurable: true });
    Object.defineProperty(BatteryManager.prototype, 'chargingTime', { get: () => 12345, configurable: true });
    Object.defineProperty(BatteryManager.prototype, 'dischargingTime', { get: () => 12345, configurable: true });

    window.BatteryManager = BatteryManager;
    window.navigator.getBattery = () => Promise.resolve(new BatteryManager());

    Object.defineProperty(window.Navigator.prototype, 'deviceMemory', { get: () => 12345, configurable: true });
    Object.defineProperty(window.Navigator.prototype, 'hardwareConcurrency', { get: () => 12345, configurable: true });

    Object.defineProperty(window.Screen.prototype, 'availTop', { get: () => 12345, configurable: true });
    Object.defineProperty(window.Screen.prototype, 'availLeft', { get: () => 12345, configurable: true });
    Object.defineProperty(window.Screen.prototype, 'availWidth', { get: () => 12345, configurable: true });
    Object.defineProperty(window.Screen.prototype, 'availHeight', { get: () => 12345, configurable: true });
    Object.defineProperty(window.Screen.prototype, 'colorDepth', { get: () => 12345, configurable: true });
    Object.defineProperty(window.Screen.prototype, 'pixelDepth', { get: () => 12345, configurable: true });

    window.navigator.webkitTemporaryStorage = {
        queryUsageAndQuota: callback => {
            callback(0, 9999999999)
        }
    };

    window.DeviceOrientationEvent = window.Event; // we only need the constructor in tests
    window.DeviceMotionEvent = window.Event; // we only need the constructor in tests
    window.Permissions = class {
        query() {
            return Promise.resolve({ state: 'granted' });
        }
    }
    window.navigator.permissions = new window.Permissions();

    class SensorMock extends EventTarget {
        start() {}
    }
    if (!window.Sensor) window.Sensor = SensorMock;
    class ConcreteSensorMock extends window.Sensor {}
    if (!window.AbsoluteOrientationSensor) window.AbsoluteOrientationSensor = ConcreteSensorMock;
    if (!window.Accelerometer) window.Accelerometer = ConcreteSensorMock;
    if (!window.GravitySensor) window.GravitySensor = ConcreteSensorMock;
    if (!window.Gyroscope) window.Gyroscope = ConcreteSensorMock;
    if (!window.LinearAccelerationSensor) window.LinearAccelerationSensor = ConcreteSensorMock;
    if (!window.RelativeOrientationSensor) window.RelativeOrientationSensor = ConcreteSensorMock;

    if (!window.NavigatorUAData) {
        window.NavigatorUAData = class {
            async getHighEntropyValues() {
                return { platform: 'Win32' };
            }
        }
        window.navigator.userAgentData = new window.NavigatorUAData();
    }

    // freeze the base return value for getHighEntropyValues to not depend on the actual browser
    window.NavigatorUAData.prototype.getHighEntropyValues = function() {
        return Promise.resolve({
            "architecture": "arm",
            "bitness": "64",
            "brands": [
                {
                    "brand": "Not.A/Brand",
                    "version": "8"
                },
                {
                    "brand": "Chromium",
                    "version": "114"
                },
                {
                    "brand": "Google Chrome",
                    "version": "114"
                }
            ],
            "fullVersionList": [
                {
                    "brand": "Not.A/Brand",
                    "version": "8.0.0.0"
                },
                {
                    "brand": "Chromium",
                    "version": "114.1.5735.198"
                },
                {
                    "brand": "Google Chrome",
                    "version": "114.1.5735.198"
                }
            ],
            "mobile": false,
            "model": "some-real-model",
            "platform": "macOS",
            "platformVersion": "13.4.1",
            "uaFullVersion": "114.0.5735.198"
        });
    }

    if (!window.navigator.connection) {
        Object.getPrototypeOf(window.navigator).connection = {
            rtt: 12345,
            downlink: 12345,
            effectiveType: '4g'
        };
    }

    if (!window.navigator.getInstalledRelatedApps) {
        Object.getPrototypeOf(window.navigator).getInstalledRelatedApps = async function() {
            return ['some-returned-app'];
        }
    }

    if (!window.showOpenFilePicker) {
        window.showOpenFilePicker = () => 'mocked-showOpenFilePicker-result';
    }
    if (!window.showSaveFilePicker) {
        window.showSaveFilePicker = () => 'mocked-showSaveFilePicker-result';
    }
    if (!window.showDirectoryPicker) {
        window.showDirectoryPicker = () => 'mocked-showDirectoryPicker-result';
    }
    if (!window.DataTransferItem) {
        window.DataTransferItem = class {
            getAsFileSystemHandle() {
                return 'mocked-DataTransferItem-getAsFileSystemHandle-result';
            }
        }
    }

    if (typeof window.screen.isExtended === 'undefined') {
        Object.defineProperty(window.Screen.prototype, 'isExtended', { get: () => true, configurable: true });
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = init
}