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
      this.renderAnnotation(msgContainer, res);
    });

    vidChannel.join()
      .receive('ok', resp => console.log('joined the video channel', resp))
      .receive('error', reason => console.log('join failed', reason));
  },
  esc(str) {
    const div = document.createElement('div');
    div.appendChild(document.createTextNode(str));
    return div.innerHTML;
  },
  renderAnnotation(msgContainer, { user, body, at }) {
    console.log('====================================');
    console.log({ user, body, at});
    console.log('====================================');
    const tpl = document.createElement('div');
    tpl.innerHTML = `
      <a href="#" data-seek="${this.esc(at)}">
        <b>${this.esc(user.username)}</b>: ${this.esc(body)}
      </a>
    `

    msgContainer.appendChild(tpl);
    msgContainer.scrollTop = msgContainer.scrollHeight;
  }
}

export default Video;