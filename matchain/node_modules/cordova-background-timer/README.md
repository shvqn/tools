# cordova-background-timer
Background Timer plugin for Cordova
===================================


## Supported Platforms
- __Android__

## Installation

#### Automatic Installation using PhoneGap/Cordova CLI (iOS and Android)
1. Make sure you update your projects to Cordova iOS version 3.5.0+ before installing this plugin.

```
cordova platform update android
```

2. Install this plugin using PhoneGap/Cordova cli:

```   
cordova plugin add https://github.com/dukhanov/cordova-background-timer.git
```
		
## Usage

### start the plugin

```
var eventCallback = function() {
	// timer event fired
}

var successCallback = function() {
	// timer plugin configured successfully
}

var errorCallback = function(e) {
	// an error occurred
}

var settings = {
	timerInterval: 60000, // interval between ticks of the timer in milliseconds (Default: 60000)
	startOnBoot: true, // enable this to start timer after the device was restarted (Default: false)
	stopOnTerminate: true, // set to true to force stop timer in case the app is terminated (User closed the app and etc.) (Default: true)

	hours: 12, // delay timer to start at certain time (Default: -1)
	minutes: 0, // delay timer to start at certain time (Default: -1)
}

window.BackgroundTimer.onTimerEvent(eventCallback); // subscribe on timer event
// timer will start at 12:00
window.BackgroundTimer.start(successCallback, errorCallback, settings);

```	
#stop a timer

```
var successCallback = function(){
	// timer tick
}

var errorCallback = function(e){
	// an error occurred
}

window.BackgroundTimer.stop(successCallback, errorCallback);
```