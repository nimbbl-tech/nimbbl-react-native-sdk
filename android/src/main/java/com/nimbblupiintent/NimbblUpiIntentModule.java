package com.nimbblupiintent;

import android.app.Activity;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.content.pm.ResolveInfo;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.util.Base64;
import android.net.Uri;
import android.util.Log;
import android.widget.Toast;
import androidx.annotation.NonNull;

import com.facebook.react.bridge.ActivityEventListener;
import com.facebook.react.bridge.BaseActivityEventListener;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.WritableArray;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.bridge.WritableNativeArray;
import com.facebook.react.bridge.WritableNativeMap;

import com.facebook.react.module.annotations.ReactModule;
import com.nimbblupiintent.UpiAppVo;

import java.io.ByteArrayOutputStream;
import java.util.ArrayList;
import java.util.List;

import org.json.JSONArray;
import org.json.JSONObject;


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

        WritableArray jsonArray = new WritableNativeArray();

        if(pkgAppsList.size()>0) {
            for (ResolveInfo resolveInfo : pkgAppsList) {
                WritableMap appObject = new WritableNativeMap();
                
                appObject.putString("name", resolveInfo.loadLabel(packageManager).toString());
                appObject.putString("packageName", resolveInfo.activityInfo.packageName);
                Bitmap bitmap = BitmapFactory.decodeResource(context.getResources(),resolveInfo.activityInfo.getIconResource());
                appObject.putString("appiconbase64",encodeToBase64(bitmap, Bitmap.CompressFormat.PNG, 100));

                jsonArray.pushMap(appObject);

                // appListCol.add(new UpiAppVo(resolveInfo.activityInfo.packageName, resolveInfo.loadIcon(packageManager), resolveInfo.loadLabel(packageManager).toString()));
            }
        }
        promise.resolve(jsonArray);
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

   public static String encodeToBase64(Bitmap image, Bitmap.CompressFormat compressFormat, int quality)
    {
        ByteArrayOutputStream byteArrayOS = new ByteArrayOutputStream();
        image.compress(compressFormat, quality, byteArrayOS);
        return Base64.encodeToString(byteArrayOS.toByteArray(), Base64.DEFAULT);
    }

}
