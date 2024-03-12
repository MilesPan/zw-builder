const fs = require("fs");
/**
 *
 * @param {string} version 版本号
 * @returns 1.0.08-basic => 1.0.09-basic
 */
function incrementVersion(version) {
  const parts = version.split("-")[0].split(".");
  const lastPart = parts[parts.length - 1];
  const incrementedLastPart = parseInt(lastPart) + 1;
  const paddedLastPart = incrementedLastPart
    .toString()
    .padStart(lastPart.length, "0"); // 使用 padStart() 方法确保固定的位数
  parts[parts.length - 1] = paddedLastPart;
  const newVersion = parts.join(".") + "-basic";
  return newVersion;
}

/**
 *
 * @param {string} filePath 文件路径
 * @returns 增强的readFileSync
 */
function readFile(filePath) {
  try {
    // 读取文件内容
    const content = fs.readFileSync(filePath, "utf-8");
    return content;
  } catch (error) {
    console.error("Error reading file:", error);
    return null;
  }
}
module.exports = { incrementVersion, readFile };
