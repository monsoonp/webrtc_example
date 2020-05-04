import React, { Fragment, useEffect, useState, useRef } from "react"; //useEffect, useState
import ReactPlayer from "react-player";
import Player from "video-react";

const Screen = ({ socket }) => {
  const [source, setSource] = useState(false);
  const [location, setLocation] = useState(false);
  const videoTag = useRef();

  const getScreenStream = async (callback) => {
    if (!!navigator.getDisplayMedia) {
      console.log("navigator.getDisplayMedia");
      await navigator
        .getDisplayMedia({
          video: true,
          audio: true,
        })
        .then((screenStream) => {
          callback(screenStream);
        });
    } else if (!!navigator.mediaDevices.getDisplayMedia) {
      console.log("navigator.mediaDevices.getDisplayMedia");
      await navigator.mediaDevices
        .getDisplayMedia({
          video: true,
          audio: true,
        })
        .then((screenStream) => {
          callback(screenStream);
        });
    } else {
      getScreenId(async (error, sourceId, screen_constraints) => {
        await navigator.mediaDevices
          .getUserMedia(screen_constraints)
          .then((screenStream) => {
            callback(screenStream);
          });
      });
    }
  };
  const getScreenId = (error, sourceId, screen_constraints) => {
    navigator.getUserMedia =
      navigator.mozGetUserMedia || navigator.webkitGetUserMedia;
    navigator.getUserMedia(
      screen_constraints,
      (stream) => {
        // document.querySelector("video").src = URL.createObjectURL(stream);
        setSource(stream);
        videoTag.current.srcObject = stream;
      },
      (error) => {
        console.error(error);
        alert(error);
      }
    );
  };

  const hasGetUserMedia = () => {
    return !!(
      navigator.getUserMedia ||
      navigator.webkitGetUserMedia ||
      navigator.mozGetUserMedia ||
      navigator.msGetUserMedia
    );
  };
  const displayConstraints = {
    video: {
      frameRate: 60,
      width: { ideal: 1920 },
      height: { ideal: 1080 },
      displaySurface: "browser", // 'application', 'browser', 'monitor', 'window'
      cursor: "motion", // 'always', 'motion', 'never'},
    },
    audio: {
      sampleSize: 8, // 샘플 byte 단위
      echoCancellation: true,
      noiseSuppression: true,
    },
  };
  const getDisplay = async (cb) => {
    const stream = await navigator.mediaDevices.getDisplayMedia({
      video: displayConstraints.video,
      audio: displayConstraints.audio,
    });
    const videoTrack = stream.getVideoTracks();
    console.log(videoTrack);
    cb(stream);
  };
  const getScreen = () => {
    if (source) stop();

    //  getScreenStream((stream) => {
    getDisplay((stream) => {
      // const video = document.querySelector("video");
      // video.srcObject = stream;
      setSource(stream);
      videoTag.current.srcObject = stream;
      // setSource(true);
    });
  };
  const stop = () => {
    // videoTag.current.srcObject = null;
    source.getTracks().forEach((track) => track.stop());
    setSource(false);
  };
  const camConstraints = {
    video: {
      width: { min: 1080, ideal: 1920 },
      height: { min: 720, ideal: 1280 },
      // optional: [{ frameRate: 60 }, { facingMode: "user" }],
    },
    audio: {
      sampleSize: 8, // 샘플 byte 단위
      echoCancellation: true,
      noiseSuppression: true,
    },
  };
  const getCam = () => {
    if (source) stop();
    if (hasGetUserMedia()) {
      navigator.mediaDevices
        .getUserMedia({
          video: camConstraints.video,
          audio: camConstraints.audio,
        })
        .then((mediaStream) => {
          /*
          var video = document.querySelector("video");
          video.srcObject = mediaStream;
          video.onloadedmetadata = function (e) {
            video.play();
          };
          */
          setSource(mediaStream);
          videoTag.current.srcObject = mediaStream;
        })
        .catch(function (err) {
          console.log(err.name + ": " + err.message);
        }); // always check for errors at the end.
    } else {
      alert("카메라를 찾을 수 없습니다.");
    }
  };
  useEffect(() => {
    if (source) {
      source.getVideoTracks()[0].onended = (e) => {
        //oninactive , onended
        console.log(e);
        stop();
        alert("화면 공유를 중지하였습니다.");
      };
    }
    if (socket) {
      console.log("socket connection:", socket);
      socket.on("screen", (data) => {
        setSource(data);
        videoTag.current.srcObject = data;
      });
    }
    if (!location) {
      navigator.geolocation.getCurrentPosition((position) => {
        console.log(position);
        setLocation(position);
      });
    }
  });
  return (
    <div>
      <Fragment>
        {!!location && (
          <p>
            ({location.coords.latitude}, {location.coords.longitude})
          </p>
        )}
      </Fragment>
      <Fragment>
        <button onClick={getScreen}>getScreen</button>
        <button onClick={getCam}>getCam</button>
        {!!source && <button onClick={stop}>stop</button>}
      </Fragment>

      {!!source && (
        <div>
          <video
            title="Screen Share"
            id="video"
            // ref={(video) => {
            //   if (!!source) {
            //     video.srcObject = source;
            //   }
            // }}
            ref={videoTag}
            // src={source}
            autoPlay={true}
            playsInline
            controls
            height={!!source ? "50%" : "0%"}
            width={!!source ? "100%" : "0%"}
            style={{
              scale: 2, //transform: "rotate(20deg)"
            }}
            onClick={(e) => {
              e.preventDefault();
              if (e.target.paused) {
                // e.target.play();
              } else {
                // e.target.pause();
              }
            }}
            onDoubleClick={(e) => {
              if (!e.target.fullscreenElement) {
                console.log("fullscreen");
                e.target.requestFullscreen();
              } else {
                if (e.target.exitFullscreen) {
                  e.target.exitFullscreen();
                }
              }
            }}
          />
        </div>
      )}
      {/* <ReactPlayer url={source} autoPlay /> */}
    </div>
  );
};

export default Screen;
