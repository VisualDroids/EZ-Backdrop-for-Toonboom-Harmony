/**
 * @file EZ Backdrop for Toonboom Harmony
 * @copyright Visual Droids < www.visualdroids.com >
 * @author miwgel < github.com/miwgel >
 */
var packageInfo = require("./configure.js").packageInfo;
include(packageInfo.packageFolder + "/lib/OpenHarmony/openHarmony.js");

if (typeof this.__proto__.visualDroids === "undefined") {
  // Mount object to persitent vars
  visualDroids = { _nodeViewNumber: "" };
  this.__proto__.visualDroids = visualDroids;

  Object.defineProperty(visualDroids, "nodeViewGroup", {
    get: function () {
      var findNodeView = function () {
        for (var i = 0; i < 100000; i++) {
          if (view.type("View" + i) === "Node View") break;
        }
        return "View" + i;
      };
      if (this._nodeViewNumber === "") {
        this._nodeViewNumber = findNodeView();
        if (this._nodeViewNumber === "") {
          throw new Error("Could not find Node View.");
        }
        return view.group(this._nodeViewNumber);
      } else {
        var currentGroup = view.group(visualDroids._nodeViewNumber);
        if (currentGroup === "") {
          this._nodeViewNumber = findNodeView();
          if (this._nodeViewNumber === "") {
            throw new Error("Could not find Node View.");
          }
          var currentGroup = view.group(this._nodeViewNumber);
        }
        return currentGroup;
      }
    },
  });
}

function Ezbackdrop(packageInfo, debug) {
  this.packageInfo = packageInfo;
  this.debug = debug;
}

Object.defineProperty(Ezbackdrop.prototype, "backdropName", {
  get: function () {
    return preferences.getString("VISUALDROIDS_EZBACKDROP_NAME", "");
  },
  set: function (backdropName) {
    preferences.setString("VISUALDROIDS_EZBACKDROP_NAME", backdropName);
  },
});

Object.defineProperty(Ezbackdrop.prototype, "backdropText", {
  get: function () {
    return preferences.getString("VISUALDROIDS_EZBACKDROP_TEXT", "");
  },
  set: function (backdropText) {
    preferences.setString("VISUALDROIDS_EZBACKDROP_TEXT", backdropText);
  },
});

Object.defineProperty(Ezbackdrop.prototype, "backdropColor", {
  get: function () {
    return preferences.getString(
      "VISUALDROIDS_EZBACKDROP_COLOR",
      new $.oColorValue("#196CB0")
    );
  },
  set: function (color) {
    preferences.setString(
      "VISUALDROIDS_EZBACKDROP_COLOR",
      new $.oColorValue(color)
    );
  },
});

// // Find current group using Prefs
// Object.defineProperty(Ezbackdrop.prototype, "nodeViewGroup", {
//   get: function () {
//     var nodeViewNumber = preferences.getString("VISUALDROIDS_EZBACKDROP_NODEVIEWNUMBER", "")
//     var findNodeView = function () {
//       for (var i = 0; i < 100000; i++) {
//         if (view.type("View" + i) === "Node View") break;
//       }
//       return "View" + i;
//     };
//     if (nodeViewNumber === "") {
//       var tmpNumber = findNodeView()
//       preferences.setString("VISUALDROIDS_EZBACKDROP_NODEVIEWNUMBER", tmpNumber)
//       return view.group(nodeViewNumber);
//     } else {
//       var currentGroup = view.group(proto.visualDroidsnodeViewNumber);
//       if (currentGroup === "") {
//         var nodeViewNumber = findNodeView();
//         proto.visualDroidsnodeViewNumber = nodeViewNumber;
//         var currentGroup = view.group(nodeViewNumber);
//       }
//       return currentGroup;
//     }
//   },
// });

Ezbackdrop.prototype.showInterface = function () {
  // Load the User Interface
  this.ui = UiLoader.load(this.packageInfo.packageFolder + "/advanced.ui");
  if (!about.isMacArch()) {
    this.ui.setWindowFlags(new Qt.WindowFlags(Qt.Window));
    this.ui.setWindowTitle("EZ Backdrop by Visual Droids");
  } else {
    this.ui.setWindowFlags(
      new Qt.WindowFlags(Qt.Tool | Qt.WindowStaysOnTopHint)
    );
  }

  //
  this.ui.backdropNameInput.text = this.backdropName;
  this.ui.backdropTextBodyInput.text = this.backdropText;

  this.ui.colorPresetSelector.setStyleSheet(
    "QListWidget::item:selected {background: black;border: 2px solid white;}QListWidget::item {width:30; height:30}"
  );

  this.ui.colorPickerButton.setStyleSheet(
    "QPushButton { padding-top: 50%; padding-bottom: 50%; border-radius: 6px; background-color: " +
      this.backdropColor.slice(0, -2) +
      ";}"
  );

  // Save text fields to preferences when editing is finished
  this.ui.backdropNameInput.editingFinished.connect(this, function () {
    this.backdropName = this.ui.backdropNameInput.text;
  });
  this.ui.backdropTextBodyInput.editingFinished.connect(this, function () {
    this.backdropText = this.ui.backdropTextBodyInput.text;
  });

  this.ui.colorPresetSelector.itemSelectionChanged.connect(
    this,
    this.colorPresetSelected
  );

  this.ui.colorPickerButton.released.connect(this, function () {
    this.showColorPicker.call(this);
    this.updateUIColor.call(this, this.backdropColor);
  });

  this.ui.createBackdropButton.released.connect(this, function () {
    this.ui.close();
    this.createBackdrop.call(
      this,
      this.backdropName,
      this.backdropText,
      this.backdropColor
    );
  });

  this.ui.show();
  this.ui.activateWindow(); // Set current window to the top
};

Ezbackdrop.prototype.colorPresetSelected = function () {
  this.backdropColor = this.ui.colorPresetSelector
    .selectedItems()[0]
    .background()
    .color()
    .name();
  this.updateUIColor.call(this, this.backdropColor);
};

Ezbackdrop.prototype.showColorPicker = function () {
  try {
    var colorPicker = new QColorDialog();
    colorPicker.options = QColorDialog.DontUseNativeDialog;
    // TODO: Learn hou to use multiple flags > QColorDialog.DontUseNativeDialog | QColorDialog.NoButtons
    var lastColor = new $.oColorValue(this.backdropColor);
    colorPicker.setCurrentColor(
      new QColor(lastColor.r, lastColor.g, lastColor.b, lastColor.a)
    );
    colorPicker.exec();

    if (!colorPicker.selectedColor().isValid()) {
      return;
    } else {
      var color = colorPicker.selectedColor();
      this.backdropColor = {
        r: color.red(),
        g: color.green(),
        b: color.blue(),
        a: color.alpha(),
      };

      this.updateUIColor.call(this, this.backdropColor);
    }
  } catch (error) {
    MessageLog.trace(error);
  }
};

Ezbackdrop.prototype.updateUIColor = function (color) {
  this.ui.colorPickerButton.setStyleSheet(
    "QPushButton { padding-top: 50%; padding-bottom: 50%; border-radius: 6px; background-color: " +
      color.slice(0, -2) +
      ";}"
  );
};

/**
 *
 * @param {string} backdropName
 * @param {string} backdropText
 * @param {hexstring} color
 */
Ezbackdrop.prototype.createBackdrop = function (
  backdropName,
  backdropText,
  color
) {
  try {
    // // MACOS - Find Current Group Path in Node View
    // $.app.mainWindow.setFocus();
    // $.app.getWidgetByName("Node View").setFocus();
    // var nodeViewCurrentGroup = view.group(view.currentView());
    // MessageLog.trace(view.group(view.currentView()));

    // MessageLog.trace(
    //   ">>" +
    //     JSON.stringify(
    //       Action.validate(
    //         "onActionNewViewChecked(QString)",
    //         "sceneUI",
    //         "Node View"
    //       )
    //     )
    // );

    // Action.perform("onActionFocusOnSelectionNV()", "Node View");
    // Action.perform("onActionResetView()", "Node View");
    // Action.perform("onActionZoomIn()", "Node View");
    // Action.perform("onActionZoomIn()", "Node View");
    // Action.perform("onActionFocusOnSelectionNV()", "Node View");

    // var nodeViewCurrentGroup = (function () {
    //   var findNodeView = function () {
    //     for (var i = 0; i < 100000; i++) {
    //       if (view.type("View" + i) === "Node View") break;
    //     }
    //     return "View" + i;
    //   };
    //   return view.group(findNodeView());
    // })();

    // New Method

    var widgets = QApplication.allWidgets();
    var nodeViews = [];
    for (var i in widgets) {
      var widget = widgets[i];
      if (widget.objectName == "Node View") {
        nodeViews.push(widget);
      }
    }

    if (nodeViews.length === 0) {
      MessageBox.warning(
        "No Node View found. Please open a Node View.",
        1,
        0,
        0,
        "EZ Backdrop"
      );
      return;
    } else if (nodeViews.length > 1) {
      MessageBox.warning(
        "More than one Node View found. Please close all Node Views except the one you want to use.",
        1,
        0,
        0,
        "EZ Backdrop"
      );
      return;
    }

    // MessageLog.trace("Antes > " + view.currentView());
    nodeViews[0].setFocus();
    // MessageLog.trace("Despues > " + view.currentView());
    var nodeViewCurrentGroup = view.group(view.currentView());

    // Create new Backdrop
    scene.beginUndoRedoAccum("Visual Droids EZ Backdrop");
    Action.perform("onActionCreateBackdrop()", "Node View");
    var allBackdrops = Backdrop.backdrops(nodeViewCurrentGroup);
    allBackdrops[0].title.text = backdropName;
    allBackdrops[0].description.text = backdropText;
    allBackdrops[0].color = new $.oColorValue(color).toInt();
    Backdrop.setBackdrops(nodeViewCurrentGroup, allBackdrops);
    scene.endUndoRedoAccum();

    // New Method
    // // Action.perform("onActionNewViewChecked(QString)", "sceneUI", "Node View"); // Node View
    // // Action.perform("onActionNewViewChecked(QString)", "sceneUI", "Node View"); // Node View
    // // MACOS - Find Current Group Path in Node View
    // $.app.mainWindow.setFocus();
    // $.app.getWidgetByName("Node View").setFocus();
    // MessageLog.trace("Despues > " + view.currentView());
    // var nodeViewCurrentGroup = view.group(view.currentView());
    // // var nodeViewCurrentGroup = visualDroids.nodeViewGroup; // Old method
    // MessageLog.trace(nodeViewCurrentGroup);

    // // Create new Backdrop
    // // Action.perform("onActionFocusOnSelectionNV()", "Node View");
    // selection.clearSelection();
    // selection.addNodeToSelection(nodeViewCurrentGroup);
    // Action.perform("onActionEnterGroup()", "Node View");
    // // Action.performForEach("onActionCreateBackdrop()", "Node View");
    // Action.perform("onActionCreateBackdrop()", "Node View");
    // var allBackdrops = Backdrop.backdrops(nodeViewCurrentGroup);
    // // MessageLog.trace(JSON.stringify(allBackdrops));
    // // if (allBackdrops.length === 0) {
    // //   MessageLog.trace("No Backdrops found");
    // //   allBackdrops = { 0: { title: { text: "" }, description: { text: "" } } };
    // // }
    // allBackdrops[0].title.text = backdropName;
    // allBackdrops[0].description.text = backdropText;
    // allBackdrops[0].color = new $.oColorValue(color).toInt();
    // Backdrop.setBackdrops(nodeViewCurrentGroup, allBackdrops);

    // End Undo
    $.endUndo();
  } catch (error) {
    MessageLog.trace(error);
  }
};

Ezbackdrop.prototype.piemenu = function () {
  var pieMenuButtons = [];

  var backdropPresets = {
    0: {
      name: "Dark Red",
      color: "#A90000",
    },
    1: {
      name: "Red",
      color: "#D30000",
    },
    2: {
      name: "Dark Orange",
      color: "#8F3403",
    },
    3: {
      name: "Orange",
      color: "#F26200",
    },
    4: {
      name: "Yellow",
      color: "#E5A700",
    },
    5: {
      name: "Limeade",
      color: "#69C800",
    },
    6: {
      name: "Olive",
      color: "#768E00",
    },
    7: {
      name: "Green",
      color: "#008100",
    },
    8: {
      name: "Dark Green",
      color: "#004E0E",
    },
    9: {
      name: "Turquoise",
      color: "#006D57",
    },
    10: {
      name: "Blue",
      color: "#003DC6",
    },
    11: {
      name: "Violet",
      color: "#4D08EC",
    },
    12: {
      name: "Purple",
      color: "#7600A2",
    },
    13: {
      name: "Pink",
      color: "#B400A8",
    },
    14: {
      name: "Cerise",
      color: "#F800A4",
    },
    15: {
      name: "Rose",
      color: "#F80068",
    },
    16: {
      name: "Dark Gray",
      color: "#323232",
    },
  };

  var menu = new $.oPieMenu(
    (name = "EZ Backdrop"),
    (widgets = pieMenuButtons),
    (show = true),
    (minAngle = -0.5),
    (maxAngle = 1.5),
    (radius = 200)
  );

  var localCreateBackdrop = this.createBackdrop;
  var localBackdropName = this.backdropName;
  var pieInputText = new QLineEdit(this.backdropName, menu);

  var focusEventFilter = new QObject();
  var lastInputText = pieInputText.text;

  focusEventFilter.eventFilter = function (obj, event) {
    if (event.type() == QEvent.FocusOut && obj instanceof QLineEdit) {
      obj.setFocus();
    }
    if (obj.text === lastInputText) {
      obj.selectAll();
    }
  };

  pieInputText.alignment = Qt.AlignCenter;
  pieInputText.setStyleSheet(
    "QLineEdit {width: 200; height: 100; text-align: center;}"
  );
  pieInputText.installEventFilter(focusEventFilter);

  // pieInputText.focusPolicy = Qt.StrongFocus;
  // pieInputText.selectAll();

  pieInputText.editingFinished.connect(this, function () {
    localBackdropName = pieInputText.text;
    this.backdropName = localBackdropName;
  });

  // for (var i = 0; i < 11; i++) {
  for (var i in backdropPresets) {
    (function (index) {
      pieMenuButtons[index] = new $.oPieButton(
        (iconFile = ""),
        (text = backdropPresets[String(index)].name)
      );

      var itemColor = new $.oColorValue(backdropPresets[index].color);
      var styleSheet =
        "QPushButton{ background-color: rgba(" +
        itemColor.r +
        ", " +
        itemColor.g +
        ", " +
        itemColor.b +
        ", 100%); border-radius: 6px;}" +
        // "QPushButton:hover{ background-color: rgba(0, 200, 255, 80%); }"+
        "QToolTip{ background-color: rgba(0, 255, 255, 100%); }";
      pieMenuButtons[index].setStyleSheet(styleSheet);

      pieMenuButtons[index].backgroundColor = backdropPresets[index].color;
      pieMenuButtons[index].activate = function () {
        pieInputText.removeEventFilter(focusEventFilter);
        localCreateBackdrop(
          (backdropName = localBackdropName),
          (backdropText = ""),
          (pickedColor = backdropPresets[index].color)
        );
        pieMenuButtons[index].closeMenu();
      };
    })(i);
  }

  menu.button = pieInputText;
  menu.show();
  menu.button.setFocus();
};

Ezbackdrop.prototype.log = function (text) {
  if (this.debug) {
    MessageLog.trace(text);
  }
};

function ezbackdrop() {
  try {
    this.ezb = new Ezbackdrop(packageInfo, true);
    this.ezb.showInterface();
  } catch (error) {
    MessageLog.trace(error);
  }
}

function ezbackdroppiemenu() {
  MessageLog.clearLog();
  try {
    this.ezb = new Ezbackdrop(packageInfo, true);
    this.ezb.piemenu();
  } catch (error) {
    MessageLog.trace(error);
  }
}
function ezbackdropfastbackdropkey() {
  try {
    this.ezb = new Ezbackdrop(packageInfo, true);
    // MessageLog.trace(this.__proto__.visualDroids.nodeViewGroup);
    this.ezb.createBackdrop(
      this.ezb.backdropName,
      this.ezb.backdropText,
      this.ezb.backdropColor
    );
  } catch (error) {
    MessageLog.trace(error);
  }
}

exports.Ezbackdrop = Ezbackdrop;
