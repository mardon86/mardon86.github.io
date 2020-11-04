var get_baselib = function (ՐՏ_baselib, ՐՏ_ver_url, onprogresscallback, onloadedcallback, onfailedcallback) {
    var ՐՏ_baselib = ՐՏ_baselib || 'https://raw.githubusercontent.com/atsepkov/RapydScript/master/lib/baselib.js';
    var ՐՏ_ver_url = ՐՏ_ver_url || 'https://raw.githubusercontent.com/atsepkov/RapydScript/master/package.json';

    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function () {
        if (onprogresscallback) {
            onprogresscallback();
        }
        if (xhr.readyState === 4) {
            if (xhr.status === 200) {
                var new_ver = JSON.parse(xhr.responseText).version;
                if (localStorage && localStorage.getItem('ՐՏ_ver')) {
                    if (new_ver === localStorage.getItem('ՐՏ_ver')) {
                        if (localStorage.getItem('ՐՏ_baselib')) {
                            get_script(null, onprogresscallback, onloadedcallback, null, 'ՐՏ_baselib');
                        } else {
                            localStorage.removeItem('ՐՏ_ver');
                            get_script(ՐՏ_baselib, onprogresscallback, function () {
                                localStorage.setItem('ՐՏ_ver', new_ver);
                                onloadedcallback();
                            }, onfailedcallback, 'ՐՏ_baselib');
                        }
                    } else if (localStorage.getItem('ՐՏ_baselib')) {
                        oldscript = localStorage.getItem('ՐՏ_baselib');
                        oldscript_ver = localStorage.getItem('ՐՏ_ver');
                        localStorage.removeItem('ՐՏ_baselib');
                        localStorage.removeItem('ՐՏ_ver');
                        get_script(ՐՏ_baselib, onprogresscallback, function () {
                            localStorage.setItem('ՐՏ_ver', new_ver);
                            onloadedcallback();
                        }, function (e) {
                            localStorage.setItem('ՐՏ_baselib', oldscript);
                            localStorage.setItem('ՐՏ_ver', oldscript_ver);
                            get_script(null, onprogresscallback, onloadedcallback, null, 'ՐՏ_baselib');
                        }, 'ՐՏ_baselib');
                    } else {
                        localStorage.removeItem('ՐՏ_ver');
                        get_script(ՐՏ_baselib, onprogresscallback, function () {
                            localStorage.setItem('ՐՏ_ver', new_ver);
                            onloadedcallback();
                        }, onfailedcallback, 'ՐՏ_baselib');
                    }
                } else if (localStorage) {
                    get_script(ՐՏ_baselib, onprogresscallback, function () {
                        localStorage.setItem('ՐՏ_ver', new_ver);
                        onloadedcallback();
                    }, onfailedcallback, 'ՐՏ_baselib');
                }
            } else {
                get_script(null, onprogresscallback, onloadedcallback, onfailedcallback, 'ՐՏ_baselib');
            }
        }
    }
    xhr.open('GET', ՐՏ_ver_url);
    xhr.send();
}
