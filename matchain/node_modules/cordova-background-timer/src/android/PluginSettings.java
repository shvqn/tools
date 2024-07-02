package com.skycom.cordova.bgt;

import android.content.SharedPreferences;
import android.util.Log;

import org.json.JSONObject;

import java.util.Calendar;

// singletog class for storing settings
public class PluginSettings {
    private static final String TAG = "BGTimer";

    static SharedPreferences mPreferences;
    private static final int DEFAULT_TIMER_INTERVAL = 10*1000;
    private static final boolean DEFAULT_START_ON_BOOT = false;
    private static final boolean DEFAULT_STOP_ON_TERMINATE = true;
    private static final int DEFAULT_HOURS_START = -1;
    private static final int DEFAULT_MINUTES_START = -1;

    private static boolean startOnBoot;
    private static boolean stopOnTerminate;
    private static boolean enabled;
    private static int timerInterval;
    private static int hours;
    private static int minutes;
    private static boolean isActivityStarted;

    protected static void initialize(SharedPreferences preferences) {
        if(preferences == null){
            return;
        }
        mPreferences = preferences;

        boolean startOnBoot = preferences.getBoolean("startOnBoot", DEFAULT_START_ON_BOOT);
        boolean stopOnTerminate = preferences.getBoolean("stopOnTerminate", DEFAULT_STOP_ON_TERMINATE);
        int timerInterval = preferences.getInt("timerInterval", DEFAULT_TIMER_INTERVAL);
        int hours = preferences.getInt("hours", DEFAULT_HOURS_START);
        int minutes = preferences.getInt("minutes", DEFAULT_MINUTES_START);
        boolean enabled = preferences.getBoolean("enabled", false);
        boolean isActivityStarted = preferences.getBoolean("isActivityStarted", false);

        setStartOnBoot(startOnBoot);
        setStopOnTerminate(stopOnTerminate);
        setTimerInterval(timerInterval);
        setHours(hours);
        setMinutes(minutes);
        setEnabled(enabled);
        setActivityStarted(isActivityStarted);

        Log.d(TAG, "Initialize plugin settings: " +
                "startOnBoot: " + startOnBoot +
                ", stopOnTerminate: " + stopOnTerminate +
                ", timerInterval: " + timerInterval +
                ", hours: " + hours +
                ", minutes: " + minutes +
                ", enabled: " + enabled +
                ", isActivityStarted: " + isActivityStarted);
    }

    protected static void setConfig(JSONObject config) {
        if(config == null || mPreferences == null){
            return;
        }

        boolean startOnBoot = config.optBoolean("startOnBoot", DEFAULT_START_ON_BOOT);
        boolean stopOnTerminate = config.optBoolean("stopOnTerminate", DEFAULT_STOP_ON_TERMINATE);
        int timerInterval = config.optInt("timerInterval", DEFAULT_TIMER_INTERVAL);
        int hours = config.optInt("hours", DEFAULT_HOURS_START);
        int minutes = config.optInt("minutes", DEFAULT_MINUTES_START);

        setStartOnBoot(startOnBoot);
        setStopOnTerminate(stopOnTerminate);
        setTimerInterval(timerInterval);
        setHours(hours);
        setMinutes(minutes);

        Log.d(TAG, "Set plugin config plugin settings: " +
                "startOnBoot: " + startOnBoot +
                ", stopOnTerminate: " + stopOnTerminate +
                ", timerInterval: " + timerInterval +
                ", hours: " + hours +
                ", minutes: " + minutes);
    }

    private static void saveBoolean(String name, boolean value) {
        SharedPreferences.Editor editor = mPreferences.edit();
        editor.putBoolean(name, value);
        editor.apply();
    }

    private static void saveInt(String name, int value) {
        SharedPreferences.Editor editor = mPreferences.edit();
        editor.putInt(name, value);
        editor.apply();
    }

    public static boolean isStartOnBoot() {
        return startOnBoot;
    }

    public static void setStartOnBoot(boolean value) {
        startOnBoot = value;
        saveBoolean("startOnBoot", value);
    }

    public static boolean isStopOnTerminate() {
        return stopOnTerminate;
    }

    public static void setStopOnTerminate(boolean value) {
        stopOnTerminate = value;
        saveBoolean("stopOnTerminate", value);
    }

    public static boolean isEnabled() {
        return enabled;
    }

    public static void setEnabled(boolean value) {
        enabled = value;
        saveBoolean("enabled", value);
    }

    public static boolean isActivityStarted() {
        return isActivityStarted;
    }

    public static void setActivityStarted(boolean value) {
        isActivityStarted = value;
        saveBoolean("isActivityStarted", value);
    }

    public static int getTimerInterval() {
        return timerInterval;
    }

    public static void setTimerInterval(int value) {
        timerInterval = value;
        saveInt("timerInterval", value);
    }

    public static int getHours() {
        return hours;
    }

    public static void setHours(int value) {
        hours = value;
        saveInt("hours", value);
    }

    public static int getMinutes() {
        return minutes;
    }

    public static void setMinutes(int value) {
        minutes = value;
        saveInt("minutes", value);
    }

    public static long getStartTime() {
        Calendar now = Calendar.getInstance();
        Calendar startTime = Calendar.getInstance();
        if (hours != DEFAULT_HOURS_START && minutes != DEFAULT_MINUTES_START) {
            startTime.set(Calendar.HOUR_OF_DAY, hours);
            startTime.set(Calendar.MINUTE, minutes);
            startTime.set(Calendar.SECOND, 0);
            startTime.set(Calendar.MILLISECOND,0);
        }

        if (startTime.before(now)) {
            startTime.set(Calendar.DATE, startTime.get(Calendar.DATE) + 1);
            Log.d("BGTimer", "isBefore: true");
        } else {
            Log.d("BGTimer", "isBefore: false");
        }

        return startTime.getTimeInMillis();
    }
}
