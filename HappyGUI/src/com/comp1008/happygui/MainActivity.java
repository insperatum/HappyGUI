package com.comp1008.happygui;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.nio.channels.FileChannel;
import java.text.SimpleDateFormat;
import java.util.Date;

import com.comp1008.happygui.R;

import android.net.Uri;
import android.os.Bundle;
import android.os.Environment;
import android.provider.MediaStore;
import android.app.Activity;
import android.content.Context;
import android.content.Intent;
import android.util.Log;
import android.view.Menu;
import android.webkit.JavascriptInterface;
import android.webkit.WebView;
import android.widget.Toast;

public class MainActivity extends Activity {
	private final int CAMERA_PICTURE_INTENT = 1;
	
	private WebView webView;
	private File cameraFile;
    private JSObject jsObject;
    
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);
        webView = (WebView) findViewById(R.id.webView1);
        try {
			loadEditor();
		} catch (IOException e) {
			e.printStackTrace();
		}
    }

    
    public void loadEditor() throws IOException { // loads the editor into the webview
    	InputStream ins = getResources().openRawResource(R.raw.editor);
    	BufferedReader reader = new BufferedReader(new InputStreamReader(ins));
    	
    	String str = "";
		String line;
		while(true) {
			line = reader.readLine();
			if(line==null) break;
			str = str + line;
		}
		
		webView.getSettings().setJavaScriptEnabled(true);
		webView.loadDataWithBaseURL("", str, "text/html", "utf-8", "");
    	jsObject = new JSObject();
		webView.addJavascriptInterface(jsObject, "jsObject");
    }
    
    
    
    
    class JSObject {
    	 @JavascriptInterface
    	public void log(String msg) {
    		Log.d("Javascript", msg);
    	}
    	
    	 @JavascriptInterface
    	public void takePhoto() { // Take a photo and send the image back to javascript
			 String timeStamp = new SimpleDateFormat("yyyyMMdd_HHmmss").format(new Date());
    		 cameraFile = new File(Environment.getExternalStorageDirectory(), "HappyGUI_capture_" + timeStamp + ".png");
	 
		     Intent cameraIntent = new Intent(MediaStore.ACTION_IMAGE_CAPTURE);
		     cameraIntent.putExtra(MediaStore.EXTRA_OUTPUT, Uri.fromFile(cameraFile));
		     startActivityForResult(cameraIntent, CAMERA_PICTURE_INTENT);
    	}
    	 
    	 public void addImage(File imageFile) { // Copies pictureFile to local directory, then passes the new file URI to javascript addImage
    		 Log.d("JSObject", "Adding image from:" + imageFile.toString());
    		 
    		 String timeStamp = new SimpleDateFormat("yyyyMMdd_HHmmss").format(new Date());
    		 File newFile = new File(getDir("images", MODE_PRIVATE), "HappyGUI_" + timeStamp + ".png"); // replace filename with something more descriptive later.
    		 FileChannel src;
    		 FileChannel dst;
			try {
				src = new FileInputStream(imageFile).getChannel();
				dst = new FileOutputStream(newFile).getChannel();
				dst.transferFrom(src, 0, src.size());
	            src.close();
	            dst.close();
			} catch (Exception e) {
				Log.d("addPicture", "Error copying picture.");
			}
             
			Log.d("JSObject", "Image copied to:" + newFile.toString());
    		 webView.loadUrl("javascript:addImage('file://" + newFile.toString() + "');");
    	 }
     }
    
    
    
    protected void onActivityResult(int requestCode, int resultCode, Intent imageReturnedIntent)
    { 
        super.onActivityResult(requestCode, resultCode, imageReturnedIntent);

        if(resultCode == RESULT_OK)
        {
        	if(requestCode == CAMERA_PICTURE_INTENT) {
	        	Log.d("onActivityResult", "Activity Result OK!");
	        	jsObject.addImage(cameraFile);
        	}
        }
    }
    
}
