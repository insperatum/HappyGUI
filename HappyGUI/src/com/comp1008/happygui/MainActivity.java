package com.comp1008.happygui;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;

import com.comp1008.happygui.R;

import android.os.Bundle;
import android.provider.MediaStore;
import android.app.Activity;
import android.content.Intent;
import android.util.Log;
import android.view.Menu;
import android.webkit.WebView;
import android.widget.Toast;

public class MainActivity extends Activity {
	WebView webView;
	
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);
        webView = (WebView) findViewById(R.id.webView1);
        try {
			loadPage();
		} catch (IOException e) {
			e.printStackTrace();
		}
    }

    @Override
    public boolean onCreateOptionsMenu(Menu menu) {
        // Inflate the menu; this adds items to the action bar if it is present.
        getMenuInflater().inflate(R.menu.activity_main, menu);
        return true;
    }
    
    
    public void loadPage() throws IOException {
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
		webView.loadData(str, "text/html", null);
    	JSObject jsObject = new JSObject();
		webView.addJavascriptInterface(jsObject, "jsObject");
    }
    
    class JSObject {
    	public void sayHello() {
    		Log.d("JS", "Hello from javascript.");
    	}
    	
    	public void takePhoto() {
    		Intent intent = new Intent(MediaStore.ACTION_IMAGE_CAPTURE);
    	    //intent.putExtra(MediaStore.EXTRA_OUTPUT, getOutputMediaFileUri(MediaStore.Files.FileColumns.MEDIA_TYPE_IMAGE));
    	    startActivityForResult(intent, 100);
    	}
     }
    
    @Override
    protected void onActivityResult(int requestCode, int resultCode, Intent data) {
    	super.onActivityResult(requestCode, resultCode, data);
    	if(resultCode == 100) {
    		if (resultCode == RESULT_OK) {
    			Toast.makeText(this, "Image saved to:\n" + data.getData(), Toast.LENGTH_LONG).show();
    		}
    	}
    }
    
}
