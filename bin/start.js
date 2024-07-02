const path = require("path");
const fs = require("fs");
const { spawnSync } = require("child_process");

const xml2js = require("xml2js");
const color = require("colors");

const { incrementVersion, readFile } = require("./util");

const cmdPath = path.resolve("./");
const type = cmdPath.includes("manage")
  ? "manage"
  : cmdPath.includes("ec")
  ? "ec"
  : "";
if (!type) {
  console.error("文件错误");
  return;
}
const parentPath = path.resolve("../");

let target = `dist-${type}`;
let distDir = `${parentPath}\\${target}`;
let distPath = `${distDir}\\dist`;
let versionPath = `${distDir}\\pom.xml`;

function copyFolder(sourceDir, targetDir) {
  fs.mkdirSync(targetDir, { recursive: true });

  const files = fs.readdirSync(sourceDir);

  // 遍历源文件夹中的所有文件/文件夹
  files.forEach((file) => {
    const sourcePath = path.join(sourceDir, file);
    const targetPath = path.join(targetDir, file);

    if (fs.lstatSync(sourcePath).isFile()) {
      // 如果是文件，则直接复制到目标文件夹
      fs.copyFileSync(sourcePath, targetPath);
    } else {
      // 如果是文件夹，则递归调用 copyFolder 函数进行复制
      copyFolder(sourcePath, targetPath);
    }
  });
}

// 和copyFolder思路差不多就是api换了
function deleteAll(path) {
  let files = [];
  if (fs.existsSync(path)) {
    files = fs.readdirSync(path);
    files.forEach((file) => {
      const curPath = path + "/" + file;
      if (fs.statSync(curPath).isDirectory()) {
        deleteAll(curPath);
      } else {
        fs.unlinkSync(curPath);
      }
    });
    fs.rmdirSync(path);
  }
}

function changeXml() {
  const xmlContent = readFile(versionPath);
  if (!xmlContent) return null;
  let patch = "";
  xml2js.parseString(xmlContent, (err, res) => {
    if (err) {
      console.error("Error parsing XML:", err);
      return;
    }
    const versions = res.project.version;
    versions[0] = incrementVersion(versions[0]);
    patch = versions[0].split("-")[0].split(".")[2];
    const builder = new xml2js.Builder();
    const updatedXmlData = builder.buildObject(res);

    fs.writeFileSync(versionPath, updatedXmlData, "utf-8");
  });
  return patch;
}

function handle() {
  try {
    deleteAll(distPath);
    console.log(color.green("已删除dist"));

    // 把dist文件夹复制到dist-{ec || manage}中
    copyFolder(path.join(cmdPath, "dist"), distPath);
    console.log(color.green("已复制dist"));

    // 版本号自增
    const patch = changeXml();
    if (!patch) throw new Error("版本号修改异常");
    console.log(color.green("版本号已自增"));
    return patch;
  } catch (error) {
    console.log(color.red(error));
  }
}

function init(isEnProduct) {
  if (isEnProduct) {
    target += "-en";
  }
  distDir = `${parentPath}\\${target}`;
  distPath = `${distDir}\\dist`;
  versionPath = `${distDir}\\pom.xml`;
}

function start(needPush, isEnProduct) {
  init(isEnProduct);

  try {
    const distBranchName = isEnProduct ? "master" : "dev";
    const gitCheckoutProgress = spawnSync("git", ["checkout", distBranchName], {
      cwd: distDir,
      stdio: "inherit",
    });
    if (gitCheckoutProgress.status === 0) {
      console.log(color.green(`已切换到${distBranchName}分支`));
      const pullProcess = spawnSync("git", ["pull"], {
        cwd: distDir,
        stdio: "inherit",
      });
      if (pullProcess.status === 0) {
        console.log(color.green("拉取远端代码成功"));
        const patch = handle();
        if (needPush) {
          spawnSync("git", ["add", "."], { cwd: distDir, stdio: "inherit" });
          spawnSync("git", ["commit", "-m", patch], {
            cwd: distDir,
            stdio: "inherit",
          });
          console.log(color.green("开始推送代码"));
          const gitPushProgress = spawnSync("git", ["push"], {
            cwd: distDir,
            stdio: "inherit",
          });
          console.log(
            "Git push process exited with code:",
            gitPushProgress.status
          );
          if (gitPushProgress.status === 0) {
            console.log(color.green("推送完成"));
            console.log(color.green(`版本号: ${patch}`));
          } else console.log(color.red("推送失败"));
        }
      } else {
        console.log(color.red("拉取远端代码失败"));
      }
    } else {
      console.log(color.red("切换分支失败"));
    }
  } catch (error) {
    console.log(color.red(`error: ${error}`));
  }
}

module.exports = start;
