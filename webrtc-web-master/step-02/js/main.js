// @ts-nocheck
'use strict';

const mediaStreamConstraints = {
  video: true,
};

const offerOptions = {
  offerToReceiveVideo: 1,
};

const localVideo = document.getElementById('localVideo');
const remoteVideo = document.getElementById('remoteVideo');

let localStream;

let localPeerConnection;
let remotePeerConnection;

function gotLocalMediaStream(mediaStream) {
  // @ts-ignore
  localVideo.srcObject = mediaStream;
  localStream = mediaStream;
}

function gotRemoteMediaStream(event) {
  const mediaStream = event.stream;
  // @ts-ignore
  remoteVideo.srcObject = mediaStream;
}

function handleConnection(event) {
  const peerConnection = event.target;
  const iceCandidate = event.candidate;

  if (iceCandidate) {
    const newIceCandidate = new RTCIceCandidate(iceCandidate);
    const otherPeer = getOtherPeer(peerConnection);

    otherPeer.addIceCandidate(newIceCandidate);
  }
}

function createdOffer(description) {
  localPeerConnection.setLocalDescription(description);

  remotePeerConnection.setRemoteDescription(description);

  remotePeerConnection.createAnswer().then(createdAnswer);
}

function createdAnswer(description) {
  remotePeerConnection.setLocalDescription(description);

  localPeerConnection.setRemoteDescription(description);
}

const startButton = document.getElementById('startButton');
const callButton = document.getElementById('callButton');
const hangupButton = document.getElementById('hangupButton');

function startAction() {
  navigator.mediaDevices
    .getUserMedia(mediaStreamConstraints)
    .then(gotLocalMediaStream);
}

function callAction() {
  const servers = null;

  localPeerConnection = new RTCPeerConnection(servers);

  localPeerConnection.addEventListener('icecandidate', handleConnection);

  remotePeerConnection = new RTCPeerConnection(servers);

  remotePeerConnection.addEventListener('icecandidate', handleConnection);
  remotePeerConnection.addEventListener('addstream', gotRemoteMediaStream);

  // @ts-ignore
  localPeerConnection.addStream(localStream);

  // @ts-ignore
  localPeerConnection.createOffer(offerOptions).then(createdOffer);
}

function hangupAction() {
  localPeerConnection.close();
  remotePeerConnection.close();
  localPeerConnection = null;
  remotePeerConnection = null;
}

startButton.addEventListener('click', startAction);
callButton.addEventListener('click', callAction);
hangupButton.addEventListener('click', hangupAction);

function getOtherPeer(peerConnection) {
  return peerConnection === localPeerConnection
    ? remotePeerConnection
    : localPeerConnection;
}

function getPeerName(peerConnection) {
  return peerConnection === localPeerConnection
    ? 'localPeerConnection'
    : 'remotePeerConnection';
}
