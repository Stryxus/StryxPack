# StryxPack
The NodeJS based bundling app built for Stryxus' web based projects.

## Contributing
Contributing to StryxPack is welcome in any way, shape or form via [PR](https://github.com/Stryxus/StryxPack/pulls) or [Issue](https://github.com/Stryxus/StryxPack/issues) and is greatly appreciated!
## Why Do I Need Dart?
Due to [Sass Lang](https://sass-lang.com/)'s decision to move to Dart, it requires implementors to interface with it via Dart.<br>
You will need to install the [Dark SDK](https://dart.dev/) and, therefore [Chocolatey](https://chocolatey.org/). Simplified instructions on how to do this are below.
## Installation
`Note: FFmpeg will eventually be setup via an automated build script for windows and debian based distro's.`.
1. Open a Windows Terminal in administrator and make sure you are in a PowerShell tab with it pointing to the same directory as the `setup_first.ps1` file.
2. Run `Set-ExecutionPolicy Bypass -Scope Process` then `.\setup_first` to setup [Chocolatey](https://chocolatey.org/).
3. Close all terminals and everything you think may involve your systems enviroment variables. This will refresh the enviroment variables.
4. Open another Windows Terminal in administrator and run `.\setup_second` to setup [Dark SDK](https://dart.dev/) and restore the Dart and SASS dependencies.
5. Finally run `npm i -g typescript
6. You will need to download [git master FFmpeg Full](https://ffmpeg.org/download.html) and make sure the ffmpeg command is globally accessible through your terminal.
7. Done! Simple right.
## How to use in other repositories
1. Install typescript globally to use the compile and start scripts. `npm install -g typescript`.
2. Preferably open the Terminal in Visual Studio and run 'cd StryxPack' then `./compile'.
3. Finally create a script to run StryxPack in your project. Example: `node StryxPack/StyxPack/bootstrapper.js ../Client ../Server build:debug`.