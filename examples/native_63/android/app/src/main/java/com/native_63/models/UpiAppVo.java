package com.native_63.models;

import android.graphics.drawable.Drawable;

public class UpiAppVo {
    String packagename;
    Drawable image;
    String name;

    public UpiAppVo(String packageName, Drawable loadIcon, String toString) {
        this.packagename = packageName;
        this.image= loadIcon;
        this.name = toString;
    }
}
