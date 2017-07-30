import Player from './player';

const Video = {
  init(socket, el) {
    if (!el) { return false; }

    const playerId = el.getAttribute('data-player-id');
    const videoId = el.getAttribute('data-id');
    socket.connect();
    Player.init(el.id, playerId, () => {
      this.onReady(videoId, socket);
    });
  },
  onReady(videoId, socket) {
    const msgContainer = document.getElementById('msg-container');
    const msgInput = document.getElementById('msg-input');
    const postButton = document.getElementById('msg-submit');
    const vidChannel = socket.channel('videos:' + videoId);

    postButton.addEventListener('click', e => {
      const payload = { body: msgInput.value, at: Player.getCurrentTime() };
      vidChannel.push('new_annotation', payload)
        .receive('error', e => console.log(e));
      msgInput.value = '';
    });

    vidChannel.on('new_annotation', res => {
      vidChannel.params.last_seen_id = res.id
      this.renderAnnotation(msgContainer, res);
    });

    msgContainer.addEventListener('click', e => {
      e.preventDefault();
      const seconds = e.target.getAttribute('data-seek') || e.target.parentNode.getAttribute('data-seek')

      if (!seconds) {
        return;
      }

      Player.seekTo(seconds);
    })

    vidChannel.join()
      .receive('ok', ({ annotations }) => {
        const ids = annotations.map(ann => ann.id);
        if (ids.length > 0) {
          vidChannel.params.last_seen_id = Math.max(...ids);
        }
        this.scheduleMessages(msgContainer, annotations);
      })
      .receive('error', reason => console.log('join failed', reason));
  },
  esc(str) {
    const div = document.createElement('div');
    div.appendChild(document.createTextNode(str));
    return div.innerHTML;
  },
  renderAnnotation(msgContainer, { user, body, at }) {
    const tpl = document.createElement('div');
    tpl.innerHTML = `
      <a href="#" data-seek="${this.esc(at)}">
        [${this.formatTime(at)}]
        <b>${this.esc(user.username)}</b>: ${this.esc(body)}
      </a>
    `

    msgContainer.appendChild(tpl);
    msgContainer.scrollTop = msgContainer.scrollHeight;
  },
  scheduleMessages(msgContainer, annotations) {
    setTimeout(() => {
      const ctime = Player.getCurrentTime();
      const remaining = this.renderAtTime(annotations, ctime, msgContainer)
      this.scheduleMessages(msgContainer, remaining)
    }, 1000);
  },
  renderAtTime(annotations, seconds, msgContainer) {
    return annotations.filter(ann => {
      if (ann.at > seconds) {
        return true;
      }
      this.renderAnnotation(msgContainer, ann);
      return false;
    })
  },
  formatTime(at) {
    const date = new Date(null);
    date.setSeconds(at / 1000);
    return date.toISOString().substr(14, 5);
  }
}

export default Video;