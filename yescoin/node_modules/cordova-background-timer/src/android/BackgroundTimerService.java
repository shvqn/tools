package com.skycom.cordova.bgt;

import android.app.AlarmManager;
import android.app.PendingIntent;
import android.app.Service;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.os.IBinder;
import android.preference.PreferenceManager;
import android.util.Log;

public class BackgroundTimerService extends Service {
    private static final String TAG = "BGTimer";

    private SharedPreferences mSettings;
    private boolean timerStarted = false;
    private AlarmManager mAlarmManager;
    private Context mContext;
    private Intent mTimerIntent;
    private PendingIntent mTimerPendingIntent;

    public void onCreate() {
        super.onCreate();
    }

    public int onStartCommand(Intent intent, int flags, int startId){
        Log.i(TAG, "onStartCommand");

        mContext = getApplicationContext();
        mSettings = PreferenceManager.getDefaultSharedPreferences(mContext);
        PluginSettings.initialize(mSettings);
        mAlarmManager = (AlarmManager) mContext.getSystemService(Context.ALARM_SERVICE);
        mTimerIntent =  new Intent(mContext, TimerEventReceiver.class);
        mTimerPendingIntent = PendingIntent.getBroadcast(mContext, 0, mTimerIntent, PendingIntent.FLAG_UPDATE_CURRENT);

        if(PluginSettings.isEnabled()) {
            Log.i(TAG, "start");
            if(intent != null && intent.getExtras() != null && intent.getExtras().getBoolean("startOnBoot", false)){
                ActivityHelper.forceActivityStart(mContext);
            }
            this.start();
        }else{
            Log.i(TAG, "stop");
            this.stop();
        }

        return PluginSettings.isStopOnTerminate() ? START_NOT_STICKY :START_STICKY;
    }

    private void start() {
        if(this.timerStarted){
            this.stop();
        }

        timerStarted = true;
        PluginSettings.setEnabled(true);
        mAlarmManager.setRepeating(AlarmManager.RTC_WAKEUP, PluginSettings.getStartTime(), PluginSettings.getTimerInterval(), mTimerPendingIntent);
    }

    private void stop() {
        this.timerStarted = false;
        PluginSettings.setEnabled(false);
        mAlarmManager.cancel(mTimerPendingIntent);
    }

    @Override
    public void onDestroy() {
        super.onDestroy();
        Log.i(TAG, "Timer service onDestroy");
        cleanup();
    }

    private void cleanup() {
        Log.i(TAG, "cleanup");
        this.stop();
    }

    public IBinder onBind(Intent intent) {
        return null;
    }

    public boolean onUnbind(Intent intent){
        Log.i(TAG, "onUnbind");
        return super.onUnbind(intent);
    }
}
