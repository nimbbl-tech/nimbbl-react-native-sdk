package com.nimbblupiintent;

import android.app.Activity;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.content.pm.ResolveInfo;
import android.net.Uri;
import android.widget.Toast;
import androidx.annotation.NonNull;

import com.facebook.react.bridge.ActivityEventListener;
import com.facebook.react.bridge.BaseActivityEventListener;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.module.annotations.ReactModule;

import com.google.gson.Gson;
import com.google.gson.reflect.TypeToken;

import com.nimbblupiintent.Utility;
import com.nimbblupiintent.UpiAppVo;


import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.lang.reflect.Type;
import java.util.ArrayList;
import java.util.List;

@ReactModule(name = NimbblUpiIntentModule.NAME)
public class NimbblUpiIntentModule extends ReactContextBaseJavaModule {
  public static final String NAME = "NimbblUpiIntent";
  ReactApplicationContext context;
  private Promise mPickerPromise;
  private static final int UPI_PICKER_REQUEST = 1;

  public NimbblUpiIntentModule(ReactApplicationContext reactContext) {
    super(reactContext);
    this.context =  reactContext;
  }

  @Override
  @NonNull
  public String getName() {
    return NAME;
  }


  @ReactMethod
  public void getUpiApps(Promise promise) {
    PackageManager packageManager = context.getPackageManager();
    Intent mainIntent = new Intent(Intent.ACTION_MAIN, null);
    mainIntent.addCategory(Intent.CATEGORY_DEFAULT);
    mainIntent.addCategory(Intent.CATEGORY_BROWSABLE);
    mainIntent.setAction(Intent.ACTION_VIEW);
    Uri uri1 = new Uri.Builder().scheme("upi").authority("pay").build();
    mainIntent.setData(uri1);

    List<ResolveInfo> pkgAppsList= packageManager.queryIntentActivities(mainIntent, 0);
    ArrayList<UpiAppVo> appListCol = new ArrayList();
    Gson gson = new Gson();

    try {
      String  referencedJsonString =Utility.loadJSONFromAsset(context,"json/nimbblupi.json");
      Type type = new TypeToken<List<UpiAppVo>>(){}.getType();
      List<UpiAppVo> refUPIJsonArray = gson.fromJson(referencedJsonString, type);

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
  public void openUpiApp(String parameters,Promise promise) {
    Activity currentActivity = getCurrentActivity();

    if (currentActivity == null) {
      promise.reject("E_ACTIVITY_DOES_NOT_EXIST", "Activity doesn't exist");
          return;
    }

    // Store the promise to resolve/reject when picker returns data
    mPickerPromise = promise;
    try {
      JSONObject responseObj = new JSONObject(parameters);
      String url  = responseObj.getString("url");
      String packageName =  responseObj.getString("package_name");
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
              mPickerPromise.resolve(intent.getStringExtra ("Status"));
            }
          }

        mPickerPromise = null;
      }
    }
  };
}
