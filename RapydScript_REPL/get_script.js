var get_script = function (script_url, dfr, onprogresscallback, scriptloadedcallback, getscriptfailcallback, alias) {
    
    if (script_url) {
        var ls_key = alias || 'cached-' + script_url;

        if (localStorage && localStorage.getItem(ls_key)) {
        
            var cs = localStorage.getItem(ls_key);
            var cs_tag = document.createElement("SCRIPT");
            cs_tag.id = ls_key;
            cs_tag.defer = dfr;
            cs_tag.text = cs;
            document.head.appendChild(cs_tag);
            if (scriptloadedcallback) {
                scriptloadedcallback();
            }
        
        } else {
            //alert('fetching..');
            var xhr = new XMLHttpRequest();
            xhr.onreadystatechange = function () {
                if (onprogresscallback) {
                    onprogresscallback();
                }
                if (xhr.readyState === 4) {
                    if (xhr.status === 200) {
                        var cs_tag = document.createElement("SCRIPT");
                        cs_tag.id = ls_key;
                        cs_tag.defer = true;
                        cs_tag.text = xhr.responseText;
                        document.head.appendChild(cs_tag);
                        if (scriptloadedcallback) {
                            scriptloadedcallback();
                        }
                        localStorage.setItem(ls_key, xhr.responseText);
                    } else if (getscriptfailcallback) {
                        getscriptfailcallback();
                    } else {
                        alert('get script failed');
                    }
                }
                //alert('get_script readyState: ' + xhr.readyState + '\nget_script status: ' + xhr.status);
            }
            xhr.open('GET', script_url);
            xhr.send();
        }
    } else {
        var ls_key = alias;

        if (localStorage && localStorage.getItem(ls_key)) {
        
            var cs = localStorage.getItem(ls_key);
            var cs_tag = document.createElement("SCRIPT");
            cs_tag.id = ls_key;
            cs_tag.defer = true;
            cs_tag.text = cs;
            document.head.appendChild(cs_tag);
            if (scriptloadedcallback) {
                scriptloadedcallback();
            }
        
        } else if (getscriptfailcallback) {
            getscriptfailcallback();
        } else {
            alert('get script failed');
        }
    }
}
