package com.skycom.cordova.bgt;

import org.apache.cordova.CordovaPlugin;
import org.apache.cordova.CallbackContext;
import org.apache.cordova.PluginResult;
import org.greenrobot.eventbus.EventBus;
import org.greenrobot.eventbus.Subscribe;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;
import android.app.Activity;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.preference.PreferenceManager;
import android.util.Log;

public class BackgroundTimer extends CordovaPlugin {
    private static final String TAG = "BGTimer";
    private static final String ACTION_START = "start";
    private static final String ACTION_STOP = "stop";
    private static final String ACTION_ON_TIMER = "onTimerEvent";

    private Context mContext;
    private SharedPreferences mSettings;
    private CallbackContext mTimerCallbackContext;
    private Intent mBackgroundServiceIntent;

    @Override
    protected void pluginInitialize() {
        Activity activity = this.cordova.getActivity();
        mContext = activity.getApplicationContext();
        mBackgroundServiceIntent = new Intent(mContext, BackgroundTimerService.class);
        mSettings = PreferenceManager.getDefaultSharedPreferences(mContext);
        PluginSettings.initialize(mSettings);
        EventBus.getDefault().register(this);
        Log.i(TAG, "pluginInitialize");
    }

    public boolean execute(String action, JSONArray data, CallbackContext callbackContext) throws JSONException {
        Log.d(TAG, "execute : " + action);

        if (ACTION_START.equalsIgnoreCase(action)) {
            this.configure(data);
            cordova.getActivity().startService(mBackgroundServiceIntent);
            callbackContext.success();
        } else if (ACTION_STOP.equalsIgnoreCase(action)) {
            PluginSettings.setEnabled(false);
            cordova.getActivity().stopService(mBackgroundServiceIntent);
            callbackContext.success();
        } else if (ACTION_ON_TIMER.equalsIgnoreCase(action)) {
            this.mTimerCallbackContext = callbackContext;
        }

        return true;
    }

    private void configure(JSONArray data) {
        PluginSettings.setEnabled(true);
        PluginSettings.setActivityStarted(true);

        try {
            JSONObject config = data.getJSONObject(0);
            PluginSettings.setConfig(config);
        } catch (JSONException e) {
            e.printStackTrace();
        }
    }

    @Subscribe
    public void onEventMainThread(TimerEvent event) {
        Log.i(TAG, "timer event has happened");

        if (mTimerCallbackContext != null) {
            PluginResult result = new PluginResult(PluginResult.Status.OK);
            result.setKeepCallback(true);
            mTimerCallbackContext.sendPluginResult(result);
        }
    }

    public void onDestroy() {
        Log.d(TAG, "onDestroy");
        PluginSettings.setActivityStarted(false);

        Log.d(TAG, "isEnabled: " + PluginSettings.isEnabled());
        Log.d(TAG, "isStopOnTerminate: " + PluginSettings.isStopOnTerminate());
        if(PluginSettings.isEnabled() && PluginSettings.isStopOnTerminate()) {
            this.cordova.getActivity().stopService(mBackgroundServiceIntent);
        }
        EventBus.getDefault().unregister(this);

        super.onDestroy();
    }
}
