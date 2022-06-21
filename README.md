# StryxPack
The NodeJS based bundling app built for Stryxus' web based projects.

## Contributing
Contributing to StryxPack is welcome in any way, shape or form via [PR](https://github.com/Stryxus/StryxPack/pulls) or [Issue](https://github.com/Stryxus/StryxPack/issues) and is greatly appreciated!
### Why Do I Need Dart?
Due to [Sass Lang](https://sass-lang.com/)'s decision to move to Dart, it requires implementors to interface with it via Dart.<br>
You will need to install the [Dark SDK](https://dart.dev/) and, therefore [Chocolatey](https://chocolatey.org/). Simplified instructions on how to do this are below.
### Installation
`Note: FFmpeg will eventually be setup via an automated build script for windows and debian based distro's.`
1. Open Windows Terminal and make sure you are in a PowerShell tab with it pointing to the same directory as the setup.ps1.
2. Run `Set-ExecutionPolicy Bypass -Scope Process` then `.\setup.ps1` to setup [Chocolatey](https://chocolatey.org/) and the [Dark SDK](https://dart.dev/).
3. Go into the project it self (where pubspec.yaml is) and open a terminal there. Finally run 'dart pub get' to resolve the dependencies.
4. You will need to download [git master FFmpeg Full](https://ffmpeg.org/download.html) and make sure the ffmpeg command is globally accessible through your terminal.
4. Done! Simple right?