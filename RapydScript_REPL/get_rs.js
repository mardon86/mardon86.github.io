var get_rs = function (ՐՏ_url, ՐՏ_ver_url, onprogresscallback, onloadedcallback, onfailedcallback) {
    ՐՏ_url = ՐՏ_url || 'https://raw.githubusercontent.com/atsepkov/RapydScript/master/lib/rapydscript.js';
    ՐՏ_ver_url = ՐՏ_ver_url || 'https://raw.githubusercontent.com/atsepkov/RapydScript/master/package.json';

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
                        if (localStorage.getItem('ՐՏ')) {
                            get_script(null, true, onprogresscallback, onloadedcallback, null, 'ՐՏ');
                        } else {
                            localStorage.removeItem('ՐՏ_ver');
                            get_script(ՐՏ_url, true, onprogresscallback, function () {
                                localStorage.setItem('ՐՏ_ver', new_ver);
                                onloadedcallback();
                            }, onfailedcallback, 'ՐՏ');
                        }
                    } else if (localStorage.getItem('ՐՏ')) {
                        oldscript = localStorage.getItem('ՐՏ');
                        oldscript_ver = localStorage.getItem('ՐՏ_ver');
                        localStorage.removeItem('ՐՏ');
                        localStorage.removeItem('ՐՏ_ver');
                        get_script(ՐՏ_url, true, onprogresscallback, function () {
                            localStorage.setItem('ՐՏ_ver', new_ver);
                            onloadedcallback();
                        }, function (e) {
                            localStorage.setItem('ՐՏ', oldscript);
                            localStorage.setItem('ՐՏ_ver', oldscript_ver);
                            get_script(null, true, onprogresscallback, onloadedcallback, null, 'ՐՏ');
                        }, 'ՐՏ');
                    } else {
                        localStorage.removeItem('ՐՏ_ver');
                        get_script(ՐՏ_url, true, onprogresscallback, function () {
                            localStorage.setItem('ՐՏ_ver', new_ver);
                            onloadedcallback();
                        }, onfailedcallback, 'ՐՏ');
                    }
                } else if (localStorage) {
                    get_script(ՐՏ_url, true, onprogresscallback, function () {
                        localStorage.setItem('ՐՏ_ver', new_ver);
                        onloadedcallback();
                    }, onfailedcallback, 'ՐՏ');
                }
            } else {
                get_script(null, true, onprogresscallback, onloadedcallback, onfailedcallback, 'ՐՏ');
            }
        }
    }
    xhr.open('GET', ՐՏ_ver_url);
    xhr.send();
}
