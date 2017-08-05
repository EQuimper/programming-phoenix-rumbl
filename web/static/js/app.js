import "phoenix_html"

import socket from "./socket"
import Video from './video';

Video.init(socket, document.getElementById('video'));
