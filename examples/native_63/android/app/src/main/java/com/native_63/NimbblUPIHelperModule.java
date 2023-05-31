package com.native_63;

import android.app.Activity;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.content.pm.ResolveInfo;
import android.net.Uri;
import android.widget.Toast;

import com.facebook.react.bridge.ActivityEventListener;
import com.facebook.react.bridge.BaseActivityEventListener;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.native_63.models.UpiAppVo;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

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

        ArrayList<UpiAppVo> appListCol = new ArrayList();

        JSONArray jsonArray = new JSONArray();

        if(pkgAppsList.size()>0) {
            for (ResolveInfo resolveInfo : pkgAppsList) {
                JSONObject apssObj = new JSONObject();
                try {
                    apssObj.put("name", resolveInfo.loadLabel(packageManager).toString());
                    apssObj.put("packagename", resolveInfo.activityInfo.packageName);
                    jsonArray.put(apssObj);
                    appListCol.add(new UpiAppVo(resolveInfo.activityInfo.packageName, resolveInfo.loadIcon(packageManager), resolveInfo.loadLabel(packageManager).toString()));

                    JSONObject mainobj = new JSONObject().put("UPIApps", jsonArray);

                    promise.resolve(mainobj);
                } catch (JSONException e) {
                    promise.reject("error from android native", e);
                    throw new RuntimeException(e);
                }
            }
        }else{
            JSONObject mainObj;
            try {
                mainObj = new JSONObject().put("UPIApps", new JSONArray());
                promise.resolve(mainObj);
            } catch (JSONException e) {
                promise.reject("error from android native", e);
                throw new RuntimeException(e);
            }


        }


   /*     String json = "{\n" +
                "  \"UPIApps\": [\n" +
                "    {\n" +
                "      \"name\": \"gpay\",\n" +
                "      \"packagename\": \"com.google.android.apps.nbu.paisa.user\"\n" +
                "    },\n" +
                "    {\n" +
                "      \"name\": \"phonepay\",\n" +
                "      \"packagename\": \"com.phonepe.app\"\n" +
                "    }\n" +
                "  ]\n" +
                "}";


        try {
            promise.resolve(json);
        } catch(Exception e) {
            promise.reject("error from android native", e);
        }    */
    }

    @ReactMethod
    public void openUpiIntent(String parameters,Promise promise) {
        Activity currentActivity = getCurrentActivity();

        if (currentActivity == null) {
            promise.reject("E_ACTIVITY_DOES_NOT_EXIST", "Activity doesn't exist");
            return;
        }

        // Store the promise to resolve/reject when picker returns data
        mPickerPromise = promise;
        // Log.d("SAN","openUpiIntent")
        //Log.d("SAN", "openUpiIntent-->$parameters")
            try {
                JSONObject responseObj = new JSONObject(parameters);
                String url  = responseObj.getString("url");
                String packageName =  responseObj.getString("packagename");
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
                            strStatus = intent.getStringExtra ("Status").toString();
                        }
                        if(strStatus.equalsIgnoreCase("failure"))
                        {
                            mPickerPromise.resolve("failure");
                        }else  if(strStatus.equalsIgnoreCase("success"))
                        {
                            mPickerPromise.resolve("success");
                        }else{
                            mPickerPromise.resolve("close");
                        }

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
