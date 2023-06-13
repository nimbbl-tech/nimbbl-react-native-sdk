package com.native_63.utility;

import android.content.Context;

import java.io.IOException;
import java.io.InputStream;

public class Utility {

    public static String loadJSONFromAsset(Context context,String jsonFilePath) {
        String json = null;
        try {
            InputStream is = context.getAssets().open(jsonFilePath);

            int size = is.available();

            byte[] buffer = new byte[size];

            is.read(buffer);

            is.close();

            json = new String(buffer, "UTF-8");


        } catch (IOException ex) {
            ex.printStackTrace();
            return null;
        }
        return json;

    }
}
