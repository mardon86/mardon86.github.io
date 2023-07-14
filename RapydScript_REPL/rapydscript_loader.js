import loadsync_script from './js_loader.js';

var ՐՏ_version_url = 'https://raw.githubusercontent.com/atsepkov/RapydScript/master/package.json';
var ՐՏ_baselib_url = 'https://raw.githubusercontent.com/atsepkov/RapydScript/master/lib/baselib.js';
var ՐՏ_url = 'https://raw.githubusercontent.com/atsepkov/RapydScript/master/lib/rapydscript_web.js';

export default function(onprogresscallback, onloadedcallback, onfailedcallback) {

    let loaded = 0;
    
    function proxy_callback() {
        loaded = loaded + 1;
        if (loaded === 2 && onloadedcallback) {
            onloadedcallback();
        };
    };

    if (document.querySelectorAll("script#ՐՏ_baselib").length) {
        proxy_callback();
    } else {
        loadsync_script({
            script_url: ՐՏ_baselib_url,
            scriptver_url: ՐՏ_version_url,
            script_keystorage: 'ՐՏ_baselib',
            scriptver_keystorage: 'ՐՏ_version',
            onprogresscallback: onprogresscallback,
            onloadedcallback: proxy_callback,
            onfailedcallback: onfailedcallback
        });
    };

    if (document.querySelectorAll("script#ՐՏ").length) {
        proxy_callback()
    } else {
        loadsync_script({
            script_url: ՐՏ_url,
            scriptver_url: ՐՏ_version_url,
            script_keystorage: 'ՐՏ',
            scriptver_keystorage: 'ՐՏ_version',
            onprogresscallback: onprogresscallback,
            onloadedcallback: proxy_callback,
            onfailedcallback: onfailedcallback
        });
    };
};