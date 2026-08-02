const KEY_MAP = {
  KeyW: 'forward', ArrowUp: 'forward',
  KeyS: 'backward', ArrowDown: 'backward',
  KeyA: 'left', ArrowLeft: 'left',
  KeyD: 'right', ArrowRight: 'right',
  Space: 'handbrake',
  KeyM: 'market',
  KeyC: 'camera',
  Escape: 'pause'
};

export class Input {
  constructor() {
    this.state = { forward: false, backward: false, left: false, right: false, handbrake: false };
    this._held = new Set(); // physical keys currently down (ignores OS auto-repeat)
    this._justPressed = new Set();

    this._onKeyDown = e => {
      const action = KEY_MAP[e.code];
      if (!action) return;
      if (['forward', 'backward', 'left', 'right', 'handbrake'].includes(action)) {
        this.state[action] = true;
      } else if (!this._held.has(e.code)) {
        this._justPressed.add(action);
      }
      this._held.add(e.code);
    };
    this._onKeyUp = e => {
      const action = KEY_MAP[e.code];
      this._held.delete(e.code);
      if (!action) return;
      if (['forward', 'backward', 'left', 'right', 'handbrake'].includes(action)) {
        this.state[action] = false;
      }
    };

    window.addEventListener('keydown', this._onKeyDown);
    window.addEventListener('keyup', this._onKeyUp);
  }

  // Returns true once per physical key press for toggle-style actions.
  consumeToggle(action) {
    if (this._justPressed.has(action)) {
      this._justPressed.delete(action);
      return true;
    }
    return false;
  }

  dispose() {
    window.removeEventListener('keydown', this._onKeyDown);
    window.removeEventListener('keyup', this._onKeyUp);
  }
}
