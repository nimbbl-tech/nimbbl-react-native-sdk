package com.native_63;

import android.app.Activity;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.content.pm.ResolveInfo;
import android.net.Uri;
import android.util.Log;
import android.widget.Toast;

import com.facebook.react.bridge.ActivityEventListener;
import com.facebook.react.bridge.BaseActivityEventListener;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.WritableNativeMap;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.bridge.WritableNativeArray;
import com.facebook.react.bridge.WritableArray;
import com.google.gson.Gson;
import com.google.gson.reflect.TypeToken;
import com.native_63.models.UpiAppVo;
import com.native_63.utility.Utility;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.lang.reflect.Type;
import java.util.ArrayList;
import java.util.List;

public class NimbblUPIHelperModule extends ReactContextBaseJavaModule {
    ReactApplicationContext context;

    private Promise mPickerPromise;
    private static final int UPI_PICKER_REQUEST = 1;
    NimbblUPIHelperModule(ReactApplicationContext context) {
        super(context);
        this.context =  context;
        // Add the listener for `onActivityResult`
        context.addActivityEventListener(mActivityEventListener);
    }

    @ReactMethod
    public void getUpi(Promise promise) {
        try {
            promise.resolve("data from android native");
        } catch(Exception e) {
            promise.reject("error from android native", e);
        } 
    }

    @ReactMethod
    public void sendUpiIntents(Promise promise) {
        PackageManager packageManager = context.getPackageManager();
        Intent mainIntent = new Intent(Intent.ACTION_MAIN, null);
        mainIntent.addCategory(Intent.CATEGORY_DEFAULT);
        mainIntent.addCategory(Intent.CATEGORY_BROWSABLE);
        mainIntent.setAction(Intent.ACTION_VIEW);
        Uri uri1 = new Uri.Builder().scheme("upi").authority("pay").build();
        mainIntent.setData(uri1);
        List<ResolveInfo> pkgAppsList= packageManager.queryIntentActivities(mainIntent, 0);
        ArrayList<UpiAppVo> appListCol = new ArrayList<>();

        Gson gson = new Gson();
        try {
            String  referencedJsonString =Utility.loadJSONFromAsset(context,"json/nimbblupi.json");
            Type type = new TypeToken<List<UpiAppVo>>(){}.getType();
            List<UpiAppVo> refUPIJsonArray = gson.fromJson(referencedJsonString, type);
        /*    for(UpiAppVo refUpiApp: refUPIJsonArray){
                Log.d("SAN",refUpiApp.package_name);
            }*/
            if(pkgAppsList.size()>0) {
                for (ResolveInfo resolveInfo : pkgAppsList) {
                    for(UpiAppVo refUpiApp: refUPIJsonArray){
                        if(resolveInfo.activityInfo.packageName.equalsIgnoreCase(refUpiApp.package_name)) {
                            appListCol.add(refUpiApp);
                            break;
                        }
                    }
                }
            }
        } catch (Exception e) {
            e.printStackTrace();
        }

        promise.resolve(gson.toJson(appListCol));
    }

    @ReactMethod
    public void openUpiIntent(String parameters,Promise promise) {
        Activity currentActivity = getCurrentActivity();

        if (currentActivity == null) {
            promise.reject("E_ACTIVITY_DOES_NOT_EXIST", "Activity doesn't exist");
            return;
        }

        mPickerPromise = promise;
            try {
                JSONObject responseObj = new JSONObject(parameters);
                String url  = responseObj.getString("url");
                String packageName =  responseObj.getString("packageName");
                Intent  intent = new Intent(Intent.ACTION_VIEW);
                intent.setData(Uri.parse(url));
                intent.setPackage(packageName);
                currentActivity.startActivityForResult(intent, UPI_PICKER_REQUEST);
            }catch (Exception e) {
                Toast.makeText(context,"Unable to launch UPI intent app.",Toast.LENGTH_SHORT).show();
                promise.reject("exception", e);
            }
    }

    private final ActivityEventListener mActivityEventListener = new BaseActivityEventListener() {

        @Override
        public void onActivityResult(Activity activity, int requestCode, int resultCode, Intent intent) {
            if (requestCode == UPI_PICKER_REQUEST) {
                if (mPickerPromise != null) {
                    if (resultCode == Activity.RESULT_CANCELED) {
                        mPickerPromise.resolve("cancelled");
                    } else{
                        String strStatus = "";
                        if (intent.getData() != null) {
                            strStatus = intent.getStringExtra("Status").toString();
                        }

                        mPickerPromise.resolve(intent.getStringExtra("Status"));
                        }
                    }

                    mPickerPromise = null;
                }

        }
    };



    @Override
    public String getName() {
        return "NimbblUPIHelperModule";
    }
}