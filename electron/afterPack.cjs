const { execSync } = require('child_process');

exports.default = async function (context) {
  // xattr cleanup is only needed on macOS
  if (process.platform !== 'darwin') return;

  const appPath = context.appOutDir;
  try {
    execSync(`xattr -cr "${appPath}"`, { stdio: 'inherit' });
  } catch {
    // Ignore errors — xattr may not find anything to clean
  }
};
