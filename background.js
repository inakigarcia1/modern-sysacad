chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
    if (msg.type === 'openGCalTabs' && Array.isArray(msg.urls)) {
        msg.urls.forEach((url, i) => {
            chrome.tabs.create({ url, active: i === 0 });
        });
        sendResponse({ ok: true });
    }
    return true;
});
