/**
 * @file EZ Backdrop for Toonboom Harmony
 * @copyright Visual Droids < www.visualdroids.com >
 * @author miwgel < github.com/miwgel >
 */

function fetchData(absFilePath) {
  var readFile = new QFile(absFilePath);
  try {
    if (!readFile.open(QIODevice.ReadOnly)) {
      throw new Error("Unable to open file.");
    }
    var data = readFile.readAll();
    return data;
  } catch (error) {
    MessageLog.trace(error);
  } finally {
    readFile.close();
  }
}

const packageFolder = __file__
  .split("\\")
  .join("/")
  .split("/")
  .slice(0, -1)
  .join("/");

var vdPackage = JSON.parse(fetchData(packageFolder + "/vdpackage.json"));

const packageInfo = {
  packagePublisher: vdPackage.packagePublisher,
  packageName: vdPackage.packageName,
  packageShortName: vdPackage.packageShortName,
  packageFullName: vdPackage.packageFullName,
  packageID: vdPackage.packageID,
  packageFolder: packageFolder,
  packageVersion: vdPackage.packageVersion,
  packageApiURL: vdPackage.packageApiURL,
};
function configure(packageFolder, packageName) {
  if (about.isPaintMode()) return;

  // Keyboard Shortcuts
  ScriptManager.addShortcut({
    id: "com.visualdroids.ezbackdrop.keybind1",
    text: "EZ Backdrop: Show Options Window",
    action: "ezbackdrop in " + packageFolder + "/ezbackdrop.js",
    longDesc: "Displays the EZ Backdrop settings window",
    categoryId: "Visual Droids",
    categoryText: packageInfo.packageShortName,
  });

  ScriptManager.addShortcut({
    id: "com.visualdroids.ezbackdrop.keybind2",
    text: "EZ Backdrop: Pie Menu",
    action: "ezbackdroppiemenu in " + packageFolder + "/ezbackdrop.js",
    longDesc:
      "Displays a pie menu where the mouse is for creating Backdrops super-fast",
    categoryId: "Visual Droids",
    categoryText: packageInfo.packageShortName,
  });

  ScriptManager.addShortcut({
    id: "com.visualdroids.ezbackdrop.keybind3",
    text: "EZ Backdrop: Create a Backdrop immediately",
    action: "ezbackdropfastbackdropkey in " + packageFolder + "/ezbackdrop.js",
    longDesc:
      "Creates a Backdrop with the last settings you chose on the EZ Backdrop settings window.",
    categoryId: "Visual Droids",
    categoryText: packageInfo.packageShortName,
  });

  // Toolbar Buttons
  var toolbar = new ScriptToolbarDef({
    id: packageInfo.packageID,
    text: packageInfo.packageFullName,
    customizable: false,
  });

  toolbar.addButton({
    text:
      packageInfo.packageShortName +
      "\nDisplays the EZ Backdrop settings window",
    icon: "BackdropTool.png",
    checkable: false,
    action: "ezbackdrop in " + packageFolder + "/ezbackdrop.js",
  });

  // //Updater fast Debug
  // toolbar.addButton({
  //   text: "Updater Debug",
  //   icon: "BackdropTool.png",
  //   checkable: false,
  //   action: "forceUpdate in " + packageFolder + "/configure.js",
  // });

  // //Proto fast Debug
  // toolbar.addButton({
  //   text: "PROTO Debug",
  //   icon: "BackdropTool.png",
  //   checkable: false,
  //   action: "protoTest in " + packageFolder + "/configure.js",
  // });

  ScriptManager.addToolbar(toolbar);

  // Uncomment for production
  // Check Updates at Startup
  var Updater = require(packageFolder + "/lib/Updater/updater.js").Updater;
  new Updater(this, packageInfo, null, false);
}

// function protoTest() {
//   MessageLog.trace(JSON.stringify(this.__proto__.visualDroids));
//   MessageLog.trace(visualDroids._nodeViewNumber);
// }

// // Updater fast Debug
// function forceUpdate() {
//   MessageLog.clearLog();

//   // // Create a temporary folder for unzipping
//   // var tmpFolder = new QDir(
//   //   fileMapper.toNativePath(
//   //     specialFolders.temp + "/" + Math.random().toString(36).slice(-8) + "/"
//   //   )
//   // );
//   // if (!tmpFolder.exists()) {
//   //   tmpFolder.mkpath(tmpFolder.path());
//   // }

//   // var onStartCallback = function () {
//   //   MessageLog.trace("Start");
//   // };
//   // var progressCallback = function (int) {
//   //   MessageLog.trace(int);
//   // };
//   // var onEndCallback = function () {
//   //   MessageLog.trace("End");
//   // };

//   // new (require(this.packageInfo.packageFolder +
//   //   "/lib/FileArchiver/sevenzip.js").SevenZip)(
//   //   (parentContext = this),
//   //   (source = this.packageInfo.packageFolder + "/tmp/update.zip"),
//   //   (destination = tmpFolder.path()),
//   //   (processStartCallback = onStartCallback),
//   //   (progressCallback = progressCallback),
//   //   (processEndCallback = onEndCallback)
//   //   // (filter = "/packages/*"),
//   //   // (debug = this.debug)
//   // ).unzipAsync();
//   var Updater = require(packageFolder + "/lib/Updater/updater.js").Updater;
//   var forceUpdater = new Updater(packageInfo, true);
//   forceUpdater.updateInfoUI();
// }

exports.packageInfo = packageInfo;
exports.configure = configure;
