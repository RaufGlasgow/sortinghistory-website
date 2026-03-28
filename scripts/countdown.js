(function () {
    // April 16, 2026 at 10:00 AM Lisbon time (UTC+1 WEST / UTC+0 WET)
    // Using 09:00 UTC which is 10:00 Lisbon during DST
    var launchDate = new Date('2026-04-16T09:00:00Z');

    var daysEl = document.getElementById('cd-days');
    var hoursEl = document.getElementById('cd-hours');
    var minsEl = document.getElementById('cd-mins');
    var secsEl = document.getElementById('cd-secs');

    if (!daysEl) return;

    function update() {
        var now = new Date();
        var diff = launchDate - now;

        if (diff <= 0) {
            var section = document.getElementById('countdown');
            if (section) {
                section.innerHTML = '<span class="countdown-launched">Available Now on the App Store</span>';
            }
            return;
        }

        var days = Math.floor(diff / 86400000);
        var hours = Math.floor((diff % 86400000) / 3600000);
        var mins = Math.floor((diff % 3600000) / 60000);
        var secs = Math.floor((diff % 60000) / 1000);

        daysEl.textContent = days;
        hoursEl.textContent = hours;
        minsEl.textContent = mins;
        secsEl.textContent = secs < 10 ? '0' + secs : secs;

        requestAnimationFrame(function () {
            setTimeout(update, 1000 - (Date.now() % 1000));
        });
    }

    update();
})();
