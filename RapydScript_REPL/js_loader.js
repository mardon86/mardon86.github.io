const load_script = function (options) {
    const {
        script_url,
        storage_key,
        onprogresscallback,
        scriptloadedcallback,
        loadscriptfailcallback,
    } = options;

    var storageKey = storage_key || 'cached-' + script_url;

    const append_script = function(script_content) {
        var script_tag = document.createElement("SCRIPT");
        script_tag.id = storageKey;
        script_tag.text = script_content;
        document.head.appendChild(script_tag);
        if (scriptloadedcallback) {
            scriptloadedcallback();
        }
    }

    const download_script = function(script_url, callback) {
        var xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function () {
            if (onprogresscallback) {
                onprogresscallback();
            }
            if (xhr.readyState === 4) {
                if (xhr.status === 200) {
                    callback(xhr.responseText);
                } else if (loadscriptfailcallback) {
                    loadscriptfailcallback();
                }
            }
        }
        xhr.open('GET', script_url);
        xhr.send();
    }

    if (script_url) {
        

        if (localStorage && localStorage.getItem(storageKey)) {
            var script_content = localStorage.getItem(storageKey);
            append_script(script_content);

        } else {

            download_script(script_url, function(script_content){
                append_script(script_content);
                if (scriptloadedcallback) {
                    scriptloadedcallback();
                }
                localStorage.setItem(storageKey, script_content);
            });
        }

    } else if (localStorage && localStorage.getItem(storage_key)) {

        var script_content = localStorage.getItem(storage_key);
        append_script(script_content);

    } else if (loadscriptfailcallback) {

        loadscriptfailcallback();

    }
}


export default function (options) {
    const {
        script_url,
        scriptver_url,
        script_keystorage,
        scriptver_keystorage,
        onprogresscallback,
        onloadedcallback,
        onfailedcallback
    } = options;

    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function () {
        if (onprogresscallback) {
            onprogresscallback();
        }
        if (xhr.readyState === 4) {
            if (xhr.status === 200) {
                var new_ver = JSON.parse(xhr.responseText).version;
                if (localStorage.getItem(scriptver_keystorage)) {
                    if (new_ver === localStorage.getItem(scriptver_keystorage)) {
                        load_script({
                            script_url: null,
                            storage_key: script_keystorage,
                            onprogresscallback: onprogresscallback,
                            scriptloadedcallback: onloadedcallback,
                            loadscriptfailcallback: null,
                        });
                    } else {
                        localStorage.removeItem(scriptver_keystorage);
                        localStorage.removeItem(script_keystorage);
                        load_script({
                            script_url: script_url,
                            storage_key: script_keystorage,
                            onprogresscallback: onprogresscallback,
                            scriptloadedcallback: function () {
                                localStorage.setItem(scriptver_keystorage, new_ver);
                                onloadedcallback();
                            },
                            loadscriptfailcallback: onfailedcallback
                        });
                    }
                } else {
                    load_script({
                        script_url: script_url,
                        storage_key: script_keystorage,
                        onprogresscallback: onprogresscallback,
                        scriptloadedcallback: function () {
                            localStorage.setItem(scriptver_keystorage, new_ver);
                            onloadedcallback();
                        },
                        loadscriptfailcallback: onfailedcallback
                    });
                }
            } else {
                load_script({
                    script_url: null,
                    storage_key: script_keystorage,
                    onprogresscallback: onprogresscallback,
                    scriptloadedcallback: onloadedcallback,
                    loadscriptfailcallback: onfailedcallback
                });
            }
        }
    }
    xhr.open('GET', scriptver_url);
    xhr.send();
}
