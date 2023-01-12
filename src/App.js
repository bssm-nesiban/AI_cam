// 1. Install dependencies DONE
// 2. Import dependencies DONE
// 3. Setup webcam and canvas DONE
// 4. Define references to those DONE
// 5. Load posenet DONE
// 6. Detect function DONE
// 7. Drawing utilities from tensorflow DONE
// 8. Draw functions DONE

import React, { useEffect, useRef, useState } from "react";
import "./App.css";
import * as tf from "@tensorflow/tfjs";
import * as posenet from "@tensorflow-models/posenet";
import Webcam from "react-webcam";
import { drawKeypoints, drawSkeleton } from "./utilities";

function App() {
  const [poseArray, setPoseArray] = useState([])
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);

  //  Load posenet
  const runPosenet = async () => {
    const net = await posenet.load({
      inputResolution: { width: 640, height: 480 },
      scale: 0.8,
    });
    //
    setInterval(() => {
      detect(net);
    }, 100);
  };

  const detect = async (net) => {
    if (
      typeof webcamRef.current !== "undefined" &&
      webcamRef.current !== null &&
      webcamRef.current.video.readyState === 4
    ) {
      // Get Video Properties
      const video = webcamRef.current.video;
      const videoWidth = webcamRef.current.video.videoWidth;
      const videoHeight = webcamRef.current.video.videoHeight;

      // Set video width
      webcamRef.current.video.width = videoWidth;
      webcamRef.current.video.height = videoHeight;

      // Make Detections
      const pose = await net.estimateSinglePose(video);

      setPoseArray(pose.keypoints)

      drawCanvas(pose, video, videoWidth, videoHeight, canvasRef);
    }
  };

  const drawCanvas = (pose, video, videoWidth, videoHeight, canvas) => {
    const ctx = canvas.current.getContext("2d");
    canvas.current.width = videoWidth;
    canvas.current.height = videoHeight;

    drawKeypoints(pose["keypoints"], 0.6, ctx);
    drawSkeleton(pose["keypoints"], 0.7, ctx);
  };

  useEffect(() => { runPosenet() }, [])

  const [dataArray, setDataArray] = useState([]);
  const [averageArray, setAvarageArray] = useState([])

  useEffect(() => {
    if (dataArray.length < 100){
      setDataArray((prev) => [...prev, ...poseArray.filter(v => v.part === 'nose').map(v => v.position)])
    }
    else {
      let total = dataArray.reduce((p, c, i, a) => {
        return {
          x: p.x + c.x,
          y: p.y + c.y
        }
      })
      total.x = total.x / dataArray.length;
      total.y = total.y / dataArray.length;
      setAvarageArray((prev) => [...prev, total])
      setDataArray([])
    }
  }, [poseArray])

  useEffect(() => {
    // 100개 평균 배열    
    console.info(averageArray);
    if(averageArray[2]?.x){
      if(Math.abs(averageArray[averageArray.length-1].x - averageArray[averageArray.length-2]) + Math.abs(averageArray[averageArray.length-1].y - averageArray[averageArray.length-2].y) < 10){
        console.log("안 움직임");
      }

  },[averageArray])


  return (
    <div className="App">
      <header className="App-header">
        <Webcam
          ref={webcamRef}
          style={{
            position: "absolute",
            marginLeft: "auto",
            marginRight: "auto",
            left: 0,
            right: 0,
            textAlign: "center",
            zindex: 9,
            width: 640,
            height: 480,
          }}
        />
        <canvas
          ref={canvasRef}
          style={{
            position: "absolute",
            marginLeft: "auto",
            marginRight: "auto",
            left: 0,
            right: 0,
            textAlign: "center",
            zindex: 9,
            width: 640,
            height: 480,
          }}
        />
      </header>
    </div>
  );
}

export default App;