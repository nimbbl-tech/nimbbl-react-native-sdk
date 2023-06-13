package com.nimbblupiintent;

import android.graphics.drawable.Drawable;

public class UpiAppVo {
    String packageName;
    String appIconBase64;
    String name;

    public UpiAppVo(String packageName, String loadIcon, String toString) {
        this.packageName = packageName;
        this.appIconBase64= loadIcon;
        this.name = toString;
    }
}