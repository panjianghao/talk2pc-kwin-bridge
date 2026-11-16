# Talk2PC KWin Bridge

A small KWin script that streams the real cursor position to the Talk2PC
desktop app. It is the KDE counterpart of the
[Talk2PC GNOME Shell extension](https://github.com/panjianghao/-talk2pc-focused-window-extension):
on Wayland the compositor owns the cursor, so a phone-driven overlay cannot
follow the pointer without asking the compositor where it is.

The script does one thing. On every `workspace.cursorPosChanged` it calls

```
callDBus("com.lycheenow.talk2pcdesktop.KWinBridge",
         "/com/lycheenow/talk2pcdesktop/KWinBridge",
         "com.lycheenow.talk2pcdesktop.KWinBridge",
         "ReportPointerStream", x, y)
```

throttled to about 30 fps. When the desktop app is not running, the calls are
dropped and nothing happens.

## What it does not do

- No network access, no listening ports, no telemetry.
- Does not read window titles, window contents, keystrokes or files.
- Does not inject input. Key and pointer injection stay in the Talk2PC desktop
  app, which uses the appropriate mechanism for the session.

This is a bridge, not an application. Installing it alone produces no visible
interface. Install and run the Talk2PC desktop app from
[talk2pc.lycheenow.com](https://talk2pc.lycheenow.com) first; the app owns the
D-Bus service and provides every feature.

Talk2PC does not implement the KDE Connect protocol, so this cannot be paired
with KDE Connect or GSConnect. The desktop app talks to this script directly
over the session bus.

## Install

### From the KDE Store

System Settings → Window Management → KWin Scripts → **Get New Scripts…**,
search for "Talk2PC Bridge", install, then enable the checkbox.

### From a release file

Download `talk2pc-bridge.kwinscript` from the
[releases page](https://github.com/panjianghao/talk2pc-kwin-bridge/releases)
and install it:

```sh
# Plasma 6 / KWin 6
kpackagetool6 --type KWin/Script -i talk2pc-bridge.kwinscript

# Plasma 5 / KWin 5
kpackagetool5 --type KWin/Script -i talk2pc-bridge.kwinscript
```

Then enable it and tell KWin to reload:

```sh
# Plasma 6
kwriteconfig6 --file kwinrc --group Plugins --key com.talk2pc.kwin.bridgeEnabled true
qdbus6 org.kde.KWin /KWin reconfigure

# Plasma 5
kwriteconfig5 --file kwinrc --group Plugins --key com.talk2pc.kwin.bridgeEnabled true
qdbus org.kde.KWin /KWin reconfigure
```

Or just tick **Talk2PC Bridge** in System Settings → Window Management → KWin
Scripts. No logout is needed after a reload.

### From source

```sh
git clone https://github.com/panjianghao/talk2pc-kwin-bridge.git
kpackagetool6 --type KWin/Script -i talk2pc-kwin-bridge
```

## Uninstall

```sh
kpackagetool6 --type KWin/Script -r com.talk2pc.kwin.bridge
```

## Verify it is working

With the Talk2PC desktop app running, watch the session bus:

```sh
dbus-monitor --session "interface='com.lycheenow.talk2pcdesktop.KWinBridge'"
```

Move the mouse; `ReportPointerStream` calls with the cursor coordinates should
appear while the pointer moves.

## Layout

```
metadata.json                 KPackage metadata (KPackageStructure: KWin/Script)
contents/code/main.js         the script
LICENSE                       GNU GPL v2 full text
talk2pc-bridge.kwinscript     packaged release artifact (zip of the above)
```

`metadata.json` must keep `Id` equal to the install directory name
(`com.talk2pc.kwin.bridge`). KWin scripts cannot expose inbound D-Bus methods,
so the stream is one-way: KWin pushes, the app listens.

## License

GPL-2.0-or-later. See [LICENSE](LICENSE).
