const fs = require('fs');
const path = require('path');
const assert = require('assert');

/**
 * The metrics fixture carries the TDS experiment parent under both platform spellings
 * (blockList for Android, contentBlocking elsewhere). The definitions must stay
 * byte-identical so the two spellings remain one spec rather than drifting into two.
 *
 * Exits the process with an error if the parity is broken.
 *
 * @param {string} featureDir - absolute path of the event-hub feature directory
 */
function checkEventHub(featureDir) {
    const fixturePath = path.join(featureDir, 'metrics', 'config_reference.json');
    if (!fs.existsSync(fixturePath)) {
        return;
    }

    console.log(' - checking TDS parent parity in metrics/config_reference.json');

    const config = JSON.parse(fs.readFileSync(fixturePath));
    const blockList = config?.features?.blockList?.features;
    const contentBlocking = config?.features?.contentBlocking?.features;

    if (blockList === undefined || contentBlocking === undefined) {
        console.error(' ❌ metrics/config_reference.json must define TDS experiments under both blockList and contentBlocking');
        process.exit(1);
    }

    try {
        assert.deepStrictEqual(blockList, contentBlocking);
    } catch (error) {
        console.error(' ❌ blockList and contentBlocking experiment definitions have drifted apart; they must be identical:');
        console.error(error.message);
        process.exit(1);
    }
}

module.exports = checkEventHub;
