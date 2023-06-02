package com.native_63.models;

import android.graphics.drawable.Drawable;

public class UpiAppVo {
    String packagename;
    Sting appIconBase64;
    String name;

    public UpiAppVo(String packageName, String loadIcon, String toString) {
        this.packagename = packageName;
        this.appIconBase64= loadIcon;
        this.name = toString;
    }
}
