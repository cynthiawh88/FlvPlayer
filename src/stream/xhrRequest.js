export default function xhrRequest(flv, url) {
    flv.emit('streamStart', 'xhr-request');
    const {
        events: { proxy },
        options: { headers },
    } = flv;
    const textEncoder = new TextEncoder();
    const xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.responseType = 'text';
    Object.keys(headers).forEach(key => {
        xhr.setRequestHeader(key, headers[key]);
    });
    let index = 0;

    proxy(xhr, 'readystatechange', () => {
        flv.emit('readystatechange', xhr);
    });

    proxy(xhr, 'progress', () => {
        const rawText = xhr.responseText.substr(index);
        index = xhr.responseText.length;
        flv.emit('streaming', textEncoder.encode(rawText, { stream: true }));
    });

    proxy(xhr, 'loadend', () => {
        flv.emit('streaming', textEncoder.encode('', { stream: false }));
        flv.emit('streamEnd');
    });

    proxy(xhr, 'error', error => {
        flv.retry();
        throw error;
    });

    flv.on('destroy', () => {
        xhr.abort();
    });

    xhr.send();

    return xhr;
}
