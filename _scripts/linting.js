const glob = require('glob');
const fs = require('fs');
const Ajv = require('ajv').default;
const ajv = new Ajv();

const path = require('path');
const { exit } = require('process');
const root = path.resolve(__dirname, '../');

const FOLDER_FORMAT = /^([a-z]+\-)*[a-z]+$/;
const TEST_FILE_SCHEMA = JSON.parse(fs.readFileSync('./schemas/tests.json'))
const testValidate = ajv.compile(TEST_FILE_SCHEMA);

const dirs = glob.sync("/*/", {root});

dirs.forEach(dir => {
    const featureFolderName = path.basename(dir);

    if (featureFolderName === '_scripts') {
        return;
    }

    if (!FOLDER_FORMAT.test(featureFolderName)) {
        console.error(`❌ ${featureFolderName} doesn't follow the folder naming format`);
        exit(1);
    }

    console.log('Processing feature directory:', featureFolderName);

    const files = glob.sync("/**/?(*_)tests.json", {root: path.resolve(root, featureFolderName)});

    if (files.length === 0) {
        console.error(`❌ tests file missing in the feature folder ${featureFolderName}`);
        exit(1);
    }

    files.forEach(testFile => {
        // doesn't follow the format, skip
        if (path.basename(testFile) === 'tracker_allowlist_matching_tests.json') {
            return;
        }

        console.log(`- validating ${path.basename(testFile)}`);

        const testFileObject = JSON.parse(fs.readFileSync(testFile));

        if (!testValidate(testFileObject)) {
            console.error(`❌ ${testFile} doesn't follow the expected format:`);
            console.error(testValidate.errors.map(item => `- ${item.schemaPath}: ${item.message}`).join('\n'));
            exit(1);
        }
    });
});

console.log('All good ✅');