import React, { useEffect, useState, useRef } from "react"; //useEffect, useState

const Screen = () => {
  const [source, setSource] = useState(false);

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
      console.log("else");
      /*
      getScreenId(async (error, sourceId, screen_constraints) => {
        await navigator.mediaDevices
          .getUserMedia(screen_constraints)
          .then((screenStream) => {
            callback(screenStream);
          });
      });
      */
    }
  };
  const getScreenId = (error, sourceId, screen_constraints) => {
    /*
    navigator.getUserMedia =
      navigator.mozGetUserMedia || navigator.webkitGetUserMedia;
    navigator.getUserMedia(
      screen_constraints,
      (stream) => {
        document.querySelector("video").src = URL.createObjectURL(stream);
      },
      (error) => {
        console.error(error);
      }
    );
    */
  };

  const hasGetUserMedia = () => {
    return !!(
      navigator.getUserMedia ||
      navigator.webkitGetUserMedia ||
      navigator.mozGetUserMedia ||
      navigator.msGetUserMedia
    );
  };

  const getDisplay = async (cb) => {
    const stream = await navigator.mediaDevices.getDisplayMedia({
      video: true,
      // audio: true,
    });
    const videoTrack = stream.getVideoTracks();
    console.log(videoTrack);
    cb(stream);
  };
  const getScreen = () => {
    if (source) stop();
    console.log(navigator);
    /*
    getScreenStream((stream) => {
      // const video = document.querySelector("video");
      // video.srcObject = stream;
      setSource(stream);
    });
    */
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

  const getCam = () => {
    if (source) stop();
    navigator.mediaDevices
      .getUserMedia({ audio: true, video: { width: 1920, height: 1080 } })
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
  });
  return (
    <div>
      <button onClick={getScreen}>getScreen</button>
      <button onClick={getCam}>getCam</button>
      {!!source && <button onClick={stop}>stop</button>}
      {!!source && (
        <video
          title="Screen Share"
          id="video"
          /*
          ref={(video) => {
            if (!!source) {
              video.srcObject = source;
            }
          }}
          */
          ref={videoTag}
          // src={source}
          autoPlay={true}
          playsInline
          controls
          // height={!!source ? "50%" : "0%"}
          // width={!!source ? "100%" : "0%"}
        ></video>
      )}
    </div>
  );
};

export default Screen;
