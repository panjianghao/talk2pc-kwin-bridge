// SPDX-License-Identifier: GPL-2.0-or-later
// Copyright (C) 2026 Talk2PC contributors
//
// Talk2PC KWin bridge — persistent cursor position stream.
//
// The callback target is the D-Bus service owned by the Talk2PC desktop app
// itself (com.lycheenow.talk2pcdesktop.KWinBridge), so the stream reaches the
// app both on a host install and inside a Flatpak sandbox.
//
// Behaviour: on every workspace.cursorPosChanged, callDBus
// ReportPointerStream(x, y) into com.lycheenow.talk2pcdesktop.KWinBridge,
// throttled to ~30 fps (the presentation overlay's frame rate; a D-Bus call per
// raw input event is wasteful). The bridge service is owned by the running
// Talk2PC desktop app — when it is not running the calls are dropped, which is
// harmless.
//
// The script opens no network ports, reads no window contents and touches no
// files. It only reports a cursor coordinate.
(function() {
  var BRIDGE_SERVICE = "com.lycheenow.talk2pcdesktop.KWinBridge";
  var BRIDGE_PATH = "/com/lycheenow/talk2pcdesktop/KWinBridge";
  var BRIDGE_IFACE = "com.lycheenow.talk2pcdesktop.KWinBridge";

  var lastReportMs = 0;
  function report() {
    var now = Date.now();
    // The presentation overlay only needs ~30 fps; the compositor emits
    // cursorPosChanged at input rate and a D-Bus call per event is wasteful.
    if (now - lastReportMs < 33) return;
    var p = workspace.cursorPos;
    if (!p) return;
    var x = Number(p.x);
    var y = Number(p.y);
    if (!isFinite(x) || !isFinite(y)) return;
    lastReportMs = now;
    callDBus(
      BRIDGE_SERVICE, BRIDGE_PATH, BRIDGE_IFACE, "ReportPointerStream",
      x | 0, y | 0
    );
  }

  if (workspace.cursorPosChanged && workspace.cursorPosChanged.connect) {
    workspace.cursorPosChanged.connect(report);
  }
  report();
})();
