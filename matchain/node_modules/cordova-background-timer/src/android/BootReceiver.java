package com.skycom.cordova.bgt;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.preference.PreferenceManager;
import android.util.Log;

public class BootReceiver extends BroadcastReceiver {
    private static final String TAG = "BGTimer";

    @Override
    public void onReceive(Context context, Intent intent) {
        SharedPreferences preferences = PreferenceManager.getDefaultSharedPreferences(context);
        PluginSettings.initialize(preferences);

        boolean isStarted = preferences.getBoolean("isActivityStarted", false);
        Log.i(TAG, "BootReceiver: isActivityStarted: " + isStarted);

        if (!PluginSettings.isStartOnBoot() || !PluginSettings.isEnabled()) return;
        ActivityHelper.forceActivityStart(context);
    }
}

