(function() {
    window.changeHashPlatform = () => {
        var lochash = location.hash.toString();
        if (lochash.indexOf('tgWebAppPlatform=weba') !== -1) {
            lochash = lochash.replaceAll("tgWebAppPlatform=weba", "tgWebAppPlatform=android");
            location.hash = lochash;
            location.reload();
        } else if (lochash.indexOf('tgWebAppPlatform=web') !== -1) {
            lochash = lochash.replaceAll("tgWebAppPlatform=web", "tgWebAppPlatform=android");
            location.hash = lochash;
            location.reload();
        }
    };
    window.changeHashPlatform();
    addEventListener("hashchange", (event) => {
        window.changeHashPlatform();
    });
})();
