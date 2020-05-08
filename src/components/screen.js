import React, { Fragment, useEffect, useState, useRef } from "react"; //useEffect, useState
// import { getDesktop } from "./desktopCapture";
const electron = window.require("electron");
const desktopCapturer = electron.desktopCapturer;

// import ReactPlayer from "react-player";
// import Player from "video-react";

const Screen = ({ socket }) => {
  const [source, setSource] = useState(false);
  const [location, setLocation] = useState(false);
  const [count, setCount] = useState(0);
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
    const stream = await navigator.mediaDevices
      .getDisplayMedia({
        video: displayConstraints.video,
        audio: displayConstraints.audio,
      })
      .catch(async () => {
        getDesktop(cb);
        // alert("Couldn't get Screen");
      });
    // const videoTrack = stream.getVideoTracks();
    // console.log(videoTrack);
    cb(stream);
  };
  const getDesktop = (cb) => {
    desktopCapturer
      .getSources({ types: ["screen", "window"] }) //"window", "screen", "tap"
      .then(async (sources) => {
        // for (const src of sources) {
        for (const [idx, src] of sources.entries()) {
          console.log(
            `%c${
              Object.entries(src)
                .reduce((a, e) => {
                  if (typeof e[1] != "function") {
                    a += `"${e[0]}" : "${e[1]}", `;
                  }
                  return a;
                }, "`{")
                .slice(1, -2) + "}`"
            }`,
            "color:black;font-family:system-ui;-webkit-text-stroke: 1px orange;font-weight:bold"
          );
          // if (src.name === "Electron" || src.name === "Entire Screen") {
          if (idx === count) {
            try {
              const stream = await navigator.mediaDevices.getUserMedia({
                video: {
                  mandatory: {
                    chromeMediaSource: "desktop",
                    chromeMediaSourceId: src.id, //
                    minWidth: 1280, // size
                    maxWidth: 1280,
                    minHeight: 720,
                    maxHeight: 720,
                    maxFrameRate: 0.5, // fps
                    minFrameRate: 0.2, //
                  },
                },
                audio: false,
              });
              cb(stream);
              //   setSource(stream);
              //   tag.current.srcObject = stream;
              // handleStream(stream);
            } catch (e) {
              console.log(e);
            }
            // return;
          }
        }
      });
  };
  const getScreen = () => {
    if (source) stop();

    //  getScreenStream((stream) => {
    getDisplay((stream) => {
      // const video = document.querySelector("video");
      // video.srcObject = stream;
      console.log("screen stream:", stream);
      if (stream) {
        setSource(stream);
        videoTag.current.srcObject = stream;
      }
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
        <input
          onChange={(e) => {
            setCount(parseInt(e.target.value));
          }}
          value={count}
          placeholder="select screen number"
        />
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
