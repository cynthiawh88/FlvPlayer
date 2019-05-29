export default function templateInit(flv, player) {
    const { options } = flv;
    options.container.classList.add('flv-player-container');
    options.container.innerHTML = `
        <div class="flv-player-inner">
            <canvas class="flv-player-canvas" width="${options.width}" height="${options.height}"></canvas>
            <div class="flv-player-controls">
                <div class="flv-player-controls-top">
                    <div class="flv-player-controls-left">
                        <div class="flv-player-controls-item flv-player-state">
                            <div class="flv-player-play">${flv.icons.play}</div>
                            <div class="flv-player-pause">${flv.icons.pause}</div>
                        </div>
                        <div class="flv-player-controls-item flv-player-time">
                            <span class="flv-player-current">00:00</span> / <span class="flv-player-duration">00:00</span>
                        </div>
                    </div>
                    <div class="flv-player-controls-right">
                        <div class="flv-player-controls-item flv-player-volume">${flv.icons.volume}</div>
                        <div class="flv-player-controls-item flv-player-fullscreen">${flv.icons.fullscreen}</div>
                    </div>
                </div>
                <div class="flv-player-controls-progress">
                    <div class="flv-player-loaded"></div>
                    <div class="flv-player-played">
                        <div class="flv-player-indicator"></div>
                    </div>
                </div>
            </div>
        </div>
    `;

    Object.defineProperty(player, '$container', {
        value: options.container,
    });

    Object.defineProperty(player, '$inner', {
        value: options.container.querySelector('.flv-player-inner'),
    });

    Object.defineProperty(player, '$canvas', {
        value: options.container.querySelector('.flv-player-canvas'),
    });

    Object.defineProperty(player, '$controls', {
        value: options.container.querySelector('.flv-player-controls'),
    });

    Object.defineProperty(player, '$state', {
        value: options.container.querySelector('.flv-player-state'),
    });

    Object.defineProperty(player, '$play', {
        value: options.container.querySelector('.flv-player-play'),
    });

    Object.defineProperty(player, '$pause', {
        value: options.container.querySelector('.flv-player-pause'),
    });

    Object.defineProperty(player, '$current', {
        value: options.container.querySelector('.flv-player-current'),
    });

    Object.defineProperty(player, '$duration', {
        value: options.container.querySelector('.flv-player-duration'),
    });

    Object.defineProperty(player, '$volume', {
        value: options.container.querySelector('.flv-player-volume'),
    });

    Object.defineProperty(player, '$fullscreen', {
        value: options.container.querySelector('.flv-player-fullscreen'),
    });

    Object.defineProperty(player, '$played', {
        value: options.container.querySelector('.flv-player-played'),
    });

    Object.defineProperty(player, '$indicator', {
        value: options.container.querySelector('.flv-player-indicator'),
    });
}