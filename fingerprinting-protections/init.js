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

if (typeof module !== 'undefined' && module.exports) {
    module.exports = init
}