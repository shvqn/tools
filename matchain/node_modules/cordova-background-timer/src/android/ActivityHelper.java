package com.skycom.cordova.bgt;

import android.content.Context;
import android.content.Intent;
import android.util.Log;

public class ActivityHelper {
    private static final String TAG = "BGTimer";

    public static void forceActivityStart(Context context) {
        Log.i(TAG, "forceActivityStart");
        Intent intent = context.getPackageManager().getLaunchIntentForPackage(context.getPackageName());
        // hide an app after reloading
        intent.putExtra("forceReload", true);
        intent.addFlags(Intent.FLAG_ACTIVITY_NO_ANIMATION | Intent.FLAG_ACTIVITY_NO_USER_ACTION | Intent.FLAG_FROM_BACKGROUND);
        context.startActivity(intent);
    }
}
