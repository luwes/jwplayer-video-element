import { fixture, assert, aTimeout } from "@open-wc/testing";
import { promisify } from '../src/utils.js';
import "../src/jwplayer-video-element.js";

describe("<jwplayer-video>", () => {
  it("has a video like API", async function () {
    this.timeout(10000);

    const player = await fixture(`<jwplayer-video
      src="https://cdn.jwplayer.com/players/C8YE48zj-IxzuqJ4M.html"
    ></jwplayer-video>`);

    assert.equal(player.paused, true, "is paused on initialization");

    await player.loadComplete;

    assert.equal(player.paused, true, "is paused on initialization");
    assert(!player.ended, "is not ended");

    assert(!player.loop, "loop is false by default");
    player.loop = true;
    assert(player.loop, "loop is true");

    assert.equal(player.volume, 1, "is all turned up");
    player.volume = 0.5;
    assert.equal(player.volume, 0.5, "is half volume");

    player.muted = true;
    assert(player.muted, "is muted");

    try {
      await player.play();
    } catch (error) {
      console.warn(error);
    }

    assert(!player.paused, "is playing after player.play()");
    assert.equal(Math.round(player.duration), 115, `is 115s long`);

    await aTimeout(1000);

    assert.equal(String(Math.round(player.currentTime)), 1, "is about 1s in");

    player.playbackRate = 2;
    await aTimeout(1000);

    assert.equal(String(Math.round(player.currentTime)), 3, "is about 3s in");
  });

  it("can load a new src", async function () {
    const player = await fixture(`<jwplayer-video
      src="https://cdn.jwplayer.com/players/C8YE48zj-IxzuqJ4M.html"
      muted
    ></jwplayer-video>`);

    const loadComplete = player.loadComplete;
    await player.loadComplete;

    assert(player.muted, "is muted");

    await promisify(player.addEventListener.bind(player))('loadedmetadata');

    assert.equal(Math.round(player.duration), 115, `is 115s long`);

    player.src = 'https://cdn.jwplayer.com/players/hAETCxXu-Pd4r8gwe.html';

    assert(loadComplete != player.loadComplete, 'creates a new promise after new src');

    await promisify(player.addEventListener.bind(player))('loadedmetadata');

    assert.equal(Math.round(player.duration), 20, `is 20s long`);

    player.src = 'https://cdn.jwplayer.com/players/R12Nj7bO-Pd4r8gwe.html';

    await promisify(player.addEventListener.bind(player))('loadedmetadata');

    assert.equal(Math.round(player.duration), 90, `is 90s long`);
  });
});
