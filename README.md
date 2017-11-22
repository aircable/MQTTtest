This is a starter template for [Ionic](http://ionicframework.com/docs/) projects.

## How to use this template

*This template does not work on its own*. The shared files for each starter are found in the [ionic2-app-base repo](https://github.com/ionic-team/ionic2-app-base).

To use this template, either create a new ionic project using the ionic node.js utility, or copy the files from this repository into the [Starter App Base](https://github.com/ionic-team/ionic2-app-base).

### With the Ionic CLI:

Take the name after `ionic2-starter-`, and that is the name of the template to be used when using the `ionic start` command below:

```bash
$ sudo npm install -g ionic cordova
$ ionic start myBlank blank

// Web Bluetooth
$ npm install @types/web-bluetooth --save

// native Bluetooth plugin
$ ionic cordova plugin add cordova-plugin-ble-central --variable BLUETOOTH_USAGE_DESCRIPTION="Your description here"
$ npm install --save @ionic-native/ble

// local notifications
$ ionic cordova plugin add de.appplant.cordova.plugin.local-notification
$ npm install --save @ionic-native/local-notifications

// background mode
$ ionic cordova plugin add cordova-plugin-background-mode
$ npm install --save @ionic-native/background-mode
```

